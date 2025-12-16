import { ModuleRef, NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";
import { Logger } from "./common/logger/logger.js";
import { DependencyRegistryEngine } from "./common/dependency-registry-engine/dependency-registry-engine.js";
import { DIService } from "discordx";
import helmet from "helmet";
import { GlobalErrorFilter } from "./common/error/filter/global-error.filter.js";
import { DiscordClientService } from "./discord-client/discord-client.service.js";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    logger: new Logger("Main"),
  });

  DIService.engine = new DependencyRegistryEngine(app.get(ModuleRef));

  app.use(
    helmet({
      frameguard: { action: "deny" }, // prevents iframe
      noSniff: true, // prevents MIME-sniffing
      hidePoweredBy: true, // removes Express version ad
      dnsPrefetchControl: { allow: false }, // prevents browser prefetching DNS links
      ieNoOpen: true, // prevents downloads in site context
      contentSecurityPolicy: {
        useDefaults: false,
        directives: {
          "default-src": "'self'",
          "object-src": "'none'",
          "img-src": "'self' data:",
          "style-src": "'self' 'unsafe-inline'",
          "frame-ancestors": "'none'",
          "upgrade-insecure-requests": "",
          "block-all-mixed-content": "",
          "require-trusted-types-for": "'script'",
        },
      },
    })
  );

  app.useGlobalFilters(new GlobalErrorFilter());

  await app.get(DiscordClientService).initialize();

  await app.init();

  async function handleExit(): Promise<void> {
    await app.close();
    process.exit(0);
  }
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  process.on("SIGINT", handleExit);
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  process.on("SIGQUIT", handleExit);
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  process.on("SIGTERM", handleExit);
}
void bootstrap();
