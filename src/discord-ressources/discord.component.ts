import { Injectable } from "@nestjs/common";
import { Logger } from "../common/logger/logger.js";
import { EmbedBuilder } from "discord.js";
import { ClanWar } from "clashofclans.js";

@Injectable()
export class DiscordEmbedService {
  private readonly logger = new Logger(DiscordEmbedService.name);

  constructor() {}

  public onWarStarted(war: ClanWar, badge: string, members: string): EmbedBuilder {
    const embed = new EmbedBuilder()
      .setTitle("⚔️ Clan War gestartet")
      .setColor(0xff0000)
      .setThumbnail(badge)
      .addFields(
        { name: "Gegner", value: war.opponent.name, inline: true },
        { name: "Typ", value: war.type, inline: true },
        { name: "Start", value: `<t:${Math.floor(war.startTime.getTime() / 1000)}:R>` },
        { name: "End", value: `<t:${Math.floor(war.endTime.getTime() / 1000)}:R>` },
        { name: "Mitglieder", value: members }
      )
      .setTimestamp();

    return embed;
  }

  public onWarAttack(
    warTag: string,
    attackerName: string,
    defenderName: string,
    attackStars: number,
    destruction: number
  ): EmbedBuilder {
    const stars = "⭐".repeat(attackStars) || "❌";

    const embed = new EmbedBuilder()
      .setTitle("🎯 Neuer Angriff")
      .setColor(0x00ff00)
      .addFields(
        { name: "Angreifer", value: attackerName, inline: true },
        { name: "Verteidiger", value: defenderName, inline: true },
        { name: "Ergebnis", value: `${stars} (${destruction.toFixed(1)}%)` }
      )
      .setFooter({ text: `War: ${warTag}` })
      .setTimestamp();

    return embed;
  }

  public onWarFinished(war: ClanWar): EmbedBuilder {
    const clan = war.clan;
    const opponent = war.opponent;

    let result: string;
    if (clan.stars > opponent.stars) {
      result = `🏆 **${clan.name} hat gewonnen!**`;
    } else if (clan.stars < opponent.stars) {
      result = `❌ **${opponent.name} hat gewonnen!**`;
    } else {
      result = `🤝 **Unentschieden**`;
    }

    const embed = new EmbedBuilder()
      .setColor(0xff0000)
      .setTitle("⚔️ Clanwar beendet")
      .setDescription(result)
      .setThumbnail(clan.badge.medium)
      .addFields(
        {
          name: `🏠 ${clan.name}`,
          value:
            `⭐ Sterne: **${clan.stars}**\n` +
            `⚔️ Angriffe: **${clan.attacks.length}/${war.teamSize * 2}**\n` +
            `💥 Zerstörung: **${clan.destruction.toFixed(2)}%**`,
          inline: true,
        },
        {
          name: `🆚 ${opponent.name}`,
          value:
            `⭐ Sterne: **${opponent.stars}**\n` +
            `⚔️ Angriffe: **${opponent.attacks.length}/${war.teamSize * 2}**\n` +
            `💥 Zerstörung: **${opponent.destruction.toFixed(2)}%**`,
          inline: true,
        }
      )
      .setFooter({
        text: `War Type: ${war.type} | Team Size: ${war.teamSize}v${war.teamSize}`,
      })
      .setTimestamp(new Date(war.endTime));

    return embed;
  }

  public onWarSearch(): EmbedBuilder {
    const embed = new EmbedBuilder()
      .setTitle("🔍 Clan War Suche gestartet")
      .setColor(0xffff00)
      .setTimestamp();

    return embed;
  }
}
