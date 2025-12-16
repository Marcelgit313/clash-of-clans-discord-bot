import { Injectable } from "@nestjs/common";
import { Logger } from "../common/logger/logger.js";
import { DiscordClientService } from "../discord-client/discord-client.service.js";
import { EmbedBuilder } from "discord.js";
import { ClanWar } from "clashofclans.js";

@Injectable()
export class DiscordEmbedService {
  private readonly logger = new Logger(DiscordEmbedService.name);

  constructor(private readonly discord: DiscordClientService) {}

  public async onWarStarted(war: ClanWar, badge: string, members: string): Promise<void> {
    const embed = new EmbedBuilder()
      .setTitle("⚔️ Clan War gestartet")
      .setColor(0xff0000)
      .setThumbnail(badge)
      .addFields(
        { name: "Gegner", value: war.opponent.name, inline: true },
        { name: "Typ", value: war.type, inline: true },
        { name: "Start", value: `<t:${Math.floor(war.startTime.getTime() / 1000)}:R>` },
        { name: "Mitglieder", value: members }
      )
      .setTimestamp();

    await this.discord.sendMessage("warLogChannel", embed);
    this.logger.log("WarLogChannel: [%s]", embed);
  }

  public async onWarAttack(
    warTag: string,
    attackerName: string,
    defenderName: string,
    attackStars: number,
    destruction: number
  ): Promise<void> {
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

    await this.discord.sendMessage("warAttacksChannel", embed);
    this.logger.log("WarAttacksChannel: [%s]", embed);
  }
}
