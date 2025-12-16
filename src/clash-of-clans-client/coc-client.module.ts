import { Module } from "@nestjs/common";
import { CommonModule } from "../common/common.module.js";
import { CocClientService } from "./coc-client.service.js";
import { DiscordEmbedModule } from "../discord-embed/discord-embed.module.js";

@Module({
  imports: [CommonModule, DiscordEmbedModule],
  providers: [CocClientService],
  exports: [CocClientService],
})
export class CocClientModule {}
