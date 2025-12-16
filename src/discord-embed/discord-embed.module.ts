import { Module } from "@nestjs/common";
import { DiscordClientModule } from "../discord-client/discord-client.module.js";
import { DiscordEmbedService } from "./discord-embed.service.js";

@Module({
  imports: [DiscordClientModule],
  providers: [DiscordEmbedService],
  exports: [DiscordEmbedService],
})
export class DiscordEmbedModule {}
