import config from "config";
import { Injectable, OnModuleInit } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { Player, Clan, Client, ClanWar, ClanWarLeagueGroup } from "clashofclans.js";
import { Logger } from "../common/logger/logger.js";
import { PrismaService } from "../common/prisma/prisma.service.js";
import { ClashPlayer } from "./entity/clash-player.entity.js";
import { WarType } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library.js";
import { DiscordEmbedService } from "../discord-embed/discord-embed.service.js";

const CLASH_OF_CLANS_API_KEY = config.get<string>("coc.api_token");
const CLASH_OF_CLANS_CLAN_TAG = config.get<string>("coc.clanTag");

const CLAN_SYNC_CRON = config.get<string>("coc.cronClan");
const WAR_SYNC_CRON = config.get<string>("coc.cronWar");

@Injectable()
export class CocClientService implements OnModuleInit {
  private readonly logger = new Logger(CocClientService.name);

  private client: Client;

  private clan: Clan | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly discordEmbed: DiscordEmbedService
  ) {
    this.client = new Client({ keys: [CLASH_OF_CLANS_API_KEY] });
  }

  async onModuleInit(): Promise<void> {
    try {
      this.logger.log("Starting clash-of-clans client");
      await this.syncClan();
    } catch (error: unknown) {
      this.logger.error("Unkown error while init coc client [%s]", error);
    }
  }

  @Cron(WAR_SYNC_CRON)
  private async sync(): Promise<void> {
    this.logger.log("Start cron sync War ...");
    await this.syncClanWar();
    //await this.syncCWL();
    this.logger.log("Finished cron sync War");
  }

  @Cron(CLAN_SYNC_CRON)
  private async syncClan(): Promise<void> {
    try {
      this.logger.log("Start sync of Clan and members ...");
      this.clan = await this.client.getClan(CLASH_OF_CLANS_CLAN_TAG);
      await this.createOrUpdateClan(this.clan);

      const apiMembers: Player[] = await this.clan.fetchMembers();
      const dbMembers: ClashPlayer[] = await this.getClanMembers(this.clan.tag);

      const apiMemberTags = new Set(apiMembers.map((m) => m.tag));

      for (const member of apiMembers) {
        await this.createOrUpdatePlayer(member);
      }

      const membersToRemove = dbMembers.filter((dbMember) => !apiMemberTags.has(dbMember.tag));

      for (const member of membersToRemove) {
        await this.removePlayerFromClan(member.tag);
      }
    } catch (error: unknown) {
      this.logger.error("Unkown error while syncing clan client [%s]", error);
    }
  }

  private async syncClanWar(): Promise<void> {
    this.logger.log("Start sync of Clanwar ...");
    const war = await this.client.getCurrentWar(CLASH_OF_CLANS_CLAN_TAG);

    if (!war || war.state === "notInWar") return;

    await this.syncWar(war, WarType.CLAN_WAR);
  }

  private async syncWar(war: ClanWar, type: WarType): Promise<void> {
    const opponent = await this.client.getClan(war.opponent.tag);
    await this.createOrUpdateClan(opponent);

    const members = await opponent.fetchMembers();
    for (const member of members) {
      await this.createOrUpdatePlayer(member);
    }

    const warTag = this.getWarId(war, type);
    const existingWar = await this.prisma.clanWar.findUnique({
      where: { tag: warTag },
    });

    if (!existingWar) {
      await this.prisma.clanWar.create({
        data: {
          tag: warTag,
          type,
          state: war.state,
          startTime: war.startTime,
          endTime: war.endTime,
          homeClanTag: war.clan.tag,
          opponentClanTag: war.opponent.tag,
        },
      });

      this.logger.log("Finished creating War: [%s]", warTag);

      const clanMembers: ClashPlayer[] = await this.getClanMembers(CLASH_OF_CLANS_CLAN_TAG);
      const inWar = clanMembers.filter((member) =>
        war.clan.members.some((warMember) => warMember.tag === member.tag)
      );
      const inWarNames = inWar.map((member) => member.name).join("\n");

      await this.discordEmbed.onWarStarted(war, opponent.badge.medium, inWarNames);
    } else if (existingWar.state !== war.state) {
      await this.prisma.clanWar.update({
        where: { tag: warTag },
        data: { state: war.state, endTime: war.endTime },
      });
    }
    if (war.state === "inWar") {
      await this.syncWarAttacks(war, warTag);
    }
  }

  private async syncCWL(): Promise<void> {
    const cwl: ClanWarLeagueGroup =
      await this.client.getClanWarLeagueGroup(CLASH_OF_CLANS_CLAN_TAG);

    if (!cwl || cwl.state === "notInWar") return;

    for (const round of cwl.rounds) {
      for (const warTag of round.warTags) {
        if (warTag === "#0") continue;

        const war = await this.client.getClanWar(warTag);
        await this.syncWar(war, WarType.CWL);
      }
    }
  }

  private async syncWarAttacks(war: ClanWar, warTag: string): Promise<void> {
    const members = [...war.clan.members, ...war.opponent.members];

    for (const member of members) {
      const player = await this.client.getPlayer(member.tag);
      await this.createOrUpdatePlayer(player);

      for (const attack of member.attacks ?? []) {
        const exists = await this.prisma.warAttack.findUnique({
          where: {
            tag_attackerTag_defenderTag: {
              tag: warTag,
              attackerTag: member.tag,
              defenderTag: attack.defenderTag,
            },
          },
        });

        if (exists) continue;

        try {
          const opponent: ClashPlayer = await this.prisma.player.findFirstOrThrow({
            where: {
              tag: attack.defenderTag,
            },
          });

          await this.prisma.warAttack.create({
            data: {
              tag: warTag,
              attackerTag: member.tag,
              defenderTag: attack.defenderTag,
              stars: attack.stars,
              destruction: attack.destruction,
              orderIndex: attack.order,
            },
          });

          await this.discordEmbed.onWarAttack(
            warTag,
            member.name,
            opponent.name,
            attack.stars,
            attack.destruction
          );
        } catch (error: unknown) {
          if (error instanceof PrismaClientKnownRequestError && error.code === "P2025") {
            this.logger.error("Unknown opponent [%s]", error);
          }
        }
      }
    }
  }

  private getClanMembers(clanId: string): Promise<ClashPlayer[]> {
    return this.prisma.player.findMany({
      where: {
        clanId: clanId,
      },
    });
  }

  private async createOrUpdateClan(clan: Clan): Promise<void> {
    try {
      await this.prisma.clan.upsert({
        where: {
          tag: clan.tag,
        },
        create: {
          tag: clan.tag,
          name: clan.name,
          description: clan.description,
          level: clan.level,
          points: clan.points,
          warWinStreak: clan.warWinStreak,
          warWins: clan.warWins,
          warTies: clan.warTies ?? 0,
          warLosses: clan.warLosses ?? 0,
          badgeUrl: clan.badge.medium,
        },
        update: {
          description: clan.description,
          level: clan.level,
          points: clan.points,
          warWinStreak: clan.warWinStreak,
          warWins: clan.warWins,
          warTies: clan.warTies ?? 0,
          warLosses: clan.warLosses ?? 0,
        },
      });
      this.logger.log("Creating or Updating Clan [%s]", clan.tag);
    } catch (error: unknown) {
      this.logger.error("Unkown error while create/updating clan in db: [%s]", error);
    }
  }

  private async createOrUpdatePlayer(player: Player): Promise<void> {
    try {
      await this.prisma.player.upsert({
        where: {
          tag: player.tag,
        },
        create: {
          tag: player.tag,
          name: player.name,
          townHallLevel: player.townHallLevel,
          expLevel: player.expLevel,
          trophies: player.trophies,
          bestTrophies: player.bestTrophies,
          warStars: player.warStars,
          donations: player.donations,
          received: player.received,
          leagueTier: player.leagueTier.name,
          leagueIconUrl: player.leagueTier.icon.medium,
          clanId: player.clan?.tag,
        },
        update: {
          name: player.name,
          townHallLevel: player.townHallLevel,
          expLevel: player.expLevel,
          trophies: player.trophies,
          bestTrophies: player.bestTrophies,
          warStars: player.warStars,
          donations: player.donations,
          received: player.received,
          leagueTier: player.leagueTier.name,
          leagueIconUrl: player.leagueTier.icon.medium,
          clanId: player.clan?.tag,
        },
      });
      this.logger.log("Creating or Updating player [%s]", player.tag);
    } catch (error: unknown) {
      this.logger.error("Unkown error while create/updating Player in db [%s]", error);
    }
  }

  private async removePlayerFromClan(playerId: string): Promise<void> {
    try {
      await this.prisma.player.update({
        where: {
          tag: playerId,
        },
        data: {
          clanId: null,
        },
      });
      this.logger.log("Removing player from clan [%s]", playerId);
    } catch (error: unknown) {
      this.logger.error("Unkown error while removing player from clan [%s]", error);
    }
  }

  private getWarId(war: ClanWar, type: WarType): string {
    if (type === WarType.CWL && war.warTag) {
      return war.warTag;
    }

    // Normaler War → stabil & eindeutig
    return `CLANWAR_${war.clan.tag}_${war.startTime.toISOString()}`;
  }
}
