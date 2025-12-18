import { ClanWar } from "clashofclans.js";
import { EmbedBuilder } from "discord.js";
import { DiscordComponent } from "../discord.component";

export class WarFinishedEmbed implements DiscordComponent<EmbedBuilder> {
  protected war: ClanWar;

  constructor(war: ClanWar) {
    this.war = war;
  }

  public build(): EmbedBuilder {
    const clan = this.war.clan;
    const opponent = this.war.opponent;

    let result: string;
    if (clan.stars > opponent.stars) {
      result = `🏆 **${clan.name} hat gewonnen!**`;
    } else if (clan.stars < opponent.stars) {
      result = `❌ **${opponent.name} hat gewonnen!**`;
    } else {
      result = `🤝 **Unentschieden**`;
    }

    return new EmbedBuilder()
      .setColor(0xff0000)
      .setTitle("⚔️ Clanwar beendet")
      .setDescription(result)
      .setThumbnail(clan.badge.medium)
      .addFields(
        {
          name: `🏠 ${clan.name}`,
          value:
            `⭐ Sterne: **${clan.stars}**\n` +
            `⚔️ Angriffe: **${clan.attacks.length}/${this.war.teamSize * 2}**\n` +
            `💥 Zerstörung: **${clan.destruction.toFixed(2)}%**`,
          inline: true,
        },
        {
          name: `🆚 ${opponent.name}`,
          value:
            `⭐ Sterne: **${opponent.stars}**\n` +
            `⚔️ Angriffe: **${opponent.attacks.length}/${this.war.teamSize * 2}**\n` +
            `💥 Zerstörung: **${opponent.destruction.toFixed(2)}%**`,
          inline: true,
        }
      )
      .setFooter({
        text: `War Type: ${this.war.type} | Team Size: ${this.war.teamSize}v${this.war.teamSize}`,
      })
      .setTimestamp(new Date(this.war.endTime));
  }
}
