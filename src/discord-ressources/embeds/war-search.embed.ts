import { DiscordComponent } from "../discord.component";
import { EmbedBuilder } from "discord.js";

export class WarSearchEmbed implements DiscordComponent<EmbedBuilder> {
  public build(): EmbedBuilder {
    return new EmbedBuilder()
      .setTitle("🔍 Clan War Suche gestartet")
      .setColor(0xffff00)
      .setTimestamp();
  }
}
