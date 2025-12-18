import { DiscordComponent } from "../discord.component";
import { EmbedBuilder } from "discord.js";
import { ClanWar } from "clashofclans.js";

export class WarStartedEmbed implements DiscordComponent<EmbedBuilder> {
  protected war: ClanWar;
  protected badge: string;
  protected members: string;

  constructor(war: ClanWar, badge: string, members: string) {
    this.war = war;
    this.badge = badge;
    this.members = members;
  }

  public build(): EmbedBuilder {
    return new EmbedBuilder()
      .setTitle("⚔️ Clan War gestartet")
      .setColor(0xff0000)
      .setThumbnail(this.badge)
      .addFields(
        { name: "Gegner", value: this.war.opponent.name, inline: true },
        { name: "Typ", value: this.war.type, inline: true },
        {
          name: "Start",
          value: `<t:${Math.floor(this.war.startTime.getTime() + 60 * 60 * 1000) / 1000}:R>`,
          inline: true,
        },
        {
          name: "End",
          value: `<t:${Math.floor((this.war.endTime.getTime() + 60 * 60 * 1000) / 1000)}:R>`,
          inline: true,
        },
        { name: "Mitglieder", value: `\`\`\`${this.members}\`\`\`` }
      )
      .setTimestamp();
  }
}
