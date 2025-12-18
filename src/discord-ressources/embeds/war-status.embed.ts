import { DiscordComponent } from "../discord.component";
import { EmbedBuilder } from "discord.js";
import { ClanWar, ClanWarMember } from "clashofclans.js";

export class WarStatusEmbed implements DiscordComponent<EmbedBuilder> {
  protected war: ClanWar;

  constructor(war: ClanWar) {
    this.war = war;
  }

  public build(): EmbedBuilder {
    const ourClan = this.war.clan;
    const enemyClan = this.war.opponent;

    ourClan.members.sort((a, b) => a.mapPosition - b.mapPosition);
    enemyClan.members.sort((a, b) => a.mapPosition - b.mapPosition);

    const lines: string[] = [];

    for (let i = 0; i < ourClan.members.length; i++) {
      const us = ourClan.members[i];
      const enemy = enemyClan.members[i];

      const usStars = this.starsToEmoji(us.bestOpponentAttack?.stars ?? 0);
      const enemyStars = this.starsToEmoji(enemy.bestOpponentAttack?.stars ?? 0);

      lines.push(
        `${us.mapPosition.toString().padEnd(2)} ${us.name.padEnd(16)} ${usStars} ${this.attackStatus(us)}   ` +
          `${enemy.mapPosition.toString().padEnd(2)} ${enemy.name.padEnd(16)} ${enemyStars} ${this.attackStatus(enemy)}`
      );
    }

    return new EmbedBuilder()
      .setColor(0x3498db)
      .setTitle("⚔️ Clanwar Status")
      .setDescription(
        "```" +
          `🔵 **${ourClan.name}**        🔴 **${enemyClan.name}**\n` +
          lines.join("\n") +
          `⭐ ${ourClan.stars} | 💥 ${ourClan.destruction}%` +
          `                 ⭐ ${enemyClan.stars} | 💥 ${enemyClan.destruction}%` +
          "```"
      )
      .setTimestamp();
  }

  private starsToEmoji(stars: number): string {
    if (stars === 3) return "★★★";
    if (stars === 2) return "★★☆";
    if (stars === 1) return "★☆☆";
    return "☆☆☆";
  }

  private attackStatus(member: ClanWarMember): string {
    if (!member.attacks || member.attacks.length === 0) return "⏳";
    if (member.attacks.length < 2) return "⏳";
    return "✅";
  }
}
