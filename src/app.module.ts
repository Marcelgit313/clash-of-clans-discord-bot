import { Module } from "@nestjs/common";
import { CommonModule } from "./common/common.module.js";
import { DiscordClientModule } from "./discord-client/discord-client.module.js";
import { CocClientModule } from "./clash-of-clans-client/coc-client.module.js";
import { Logger } from "./common/logger/logger.js";
import config from "config";
import { DiscordEmbedModule } from "./discord-embed/discord-embed.module.js";
import { ScheduleModule } from "@nestjs/schedule";

@Module({
  imports: [
    ScheduleModule.forRoot(),
    CommonModule,
    DiscordClientModule,
    CocClientModule,
    DiscordEmbedModule,
  ],
})
export class AppModule {
  private readonly logger = new Logger(AppModule.name);

  constructor() {
    this.logger.log(
      "Loaded config sources: [%s]",
      config.util
        .getConfigSources()
        .map((c) => c.name)
        .join(", ")
    );
  }
}
