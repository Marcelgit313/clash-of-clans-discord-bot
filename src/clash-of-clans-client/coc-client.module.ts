import { Module } from "@nestjs/common";
import { CommonModule } from "../common/common.module.js";
import { CocClientService } from "./coc-client.service.js";
import { DiscordClientModule } from "../discord-client/discord-client.module.js";

@Module({
  imports: [CommonModule, DiscordClientModule],
  providers: [CocClientService],
  exports: [CocClientService],
})
export class CocClientModule {}
