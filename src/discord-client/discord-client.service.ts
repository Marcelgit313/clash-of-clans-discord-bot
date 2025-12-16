import { Injectable } from "@nestjs/common";
import config from "config";
import { EmbedBuilder, GatewayIntentBits, Guild, Partials, TextChannel } from "discord.js";
import { Client } from "discordx";
import { Logger } from "../common/logger/logger.js";

const BOT_TOKEN = config.get<string>("discord.botToken");
const GUILD_ID = config.get<string>("discord.guildId");
const WAR_LOG_CHANNEL_ID = config.get<string>("discord.warLogChannel");
const WAR_ATTACKS_CHANNEL_ID = config.get<string>("discord.warAttacksChannel");

@Injectable()
export class DiscordClientService {
  private readonly logger = new Logger(DiscordClientService.name);

  public static guildIconUrl: string | null = null;

  private client: Client;
  private guild?: Guild;
  private warLogChannel: TextChannel | null;
  private warAttacksChannel: TextChannel | null;

  constructor() {
    this.client = new Client({
      botGuilds: [(client): string[] => client.guilds.cache.map((guild) => guild.id)],

      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
      partials: [Partials.Message],

      silent: false,
    });

    this.client.once("clientReady", () => {
      this.logger.log(`Bot '${this.client.user?.username}' started`);
    });
  }

  public async initialize(): Promise<void> {
    this.logger.log("Initializing Discord Bot");
    await this.client.login(BOT_TOKEN);
    await this.client.guilds.fetch();

    this.warLogChannel = await this.findChannel(WAR_LOG_CHANNEL_ID);
    this.warAttacksChannel = await this.findChannel(WAR_ATTACKS_CHANNEL_ID);

    const guild = await this.getGuild();
    DiscordClientService.guildIconUrl = guild.iconURL();
    await this.client.user?.setAvatar(DiscordClientService.guildIconUrl);
  }

  private async getGuild(): Promise<Guild> {
    if (!this.guild) {
      this.guild = await this.client.guilds.fetch(GUILD_ID);
    }
    return this.guild;
  }

  public async sendMessage(channelID: string, message: EmbedBuilder): Promise<void> {
    if (channelID === "warLogChannel" && this.warLogChannel) {
      await this.warLogChannel.send({ embeds: [message] });
      this.logger.log("Sending message to WarLogChannel");
    } else if (channelID === "warAttacksChannel" && this.warAttacksChannel) {
      await this.warAttacksChannel.send({ embeds: [message] });
      this.logger.log("Sending message to WarAttacksChannel");
    } else {
      this.logger.warn("Error sending message to Channel");
      throw new Error("Invalid message channel ID");
    }
  }

  private async findChannel(channelId: string): Promise<TextChannel | null> {
    try {
      const channel = await this.client.channels.fetch(channelId);
      return channel instanceof TextChannel ? channel : null;
    } catch {
      return null;
    }
  }
}
