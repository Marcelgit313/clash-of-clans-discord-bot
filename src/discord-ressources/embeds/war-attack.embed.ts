import { EmbedBuilder } from "discord.js";
import { DiscordComponent } from "../discord.component";

export class WarAttackEmbed implements DiscordComponent<EmbedBuilder> {
  protected warTag: string;
  protected attackerName: string;
  protected defenderName: string;
  protected stars: number;
  protected destruction: number;

  constructor(
    warTag: string,
    attackerName: string,
    defenderName: string,
    stars: number,
    destruction: number
  ) {
    this.warTag = warTag;
    this.attackerName = attackerName;
    this.defenderName = defenderName;
    this.stars = stars;
    this.destruction = destruction;
  }

  public build(): EmbedBuilder {
    return new EmbedBuilder()
      .setTitle("🎯 Neuer Angriff")
      .setColor(0x00ff00)
      .addFields(
        { name: "Angreifer", value: this.attackerName, inline: true },
        { name: "Verteidiger", value: this.defenderName, inline: true },
        { name: "Ergebnis", value: `${this.stars} (${this.destruction.toFixed(1)}%)` }
      )
      .setFooter({ text: `War: ${this.warTag}` })
      .setTimestamp();
  }
}