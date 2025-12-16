import { Injectable, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { spawnSync } from "child_process";
import config from "config";
import { exit } from "process";
import { Logger } from "../logger/logger.js";

const DATABASE_URL = config.get<string>("database.url");
const PRISMA_EXECUTABLE = config.get<string>("prisma.executable");

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({ datasources: { db: { url: DATABASE_URL } } });
  }

  private migrate(): void {
    this.logger.log("Starting migrations");
    const migrateCommand = spawnSync(`${PRISMA_EXECUTABLE} migrate deploy`, {
      shell: true,
      env: { DATABASE_URL: DATABASE_URL },
    });
    this.logger.log(
      `Deploy output: ${migrateCommand.stdout.toString("utf8")}\n${migrateCommand.stderr.toString(
        "utf8"
      )}`
    );

    if (migrateCommand.status === 0) {
      this.logger.log("Finished migrations successfully");
    } else {
      this.logger.error("Finished migrations unsuccessfully");
      exit(1);
    }
  }

  async onModuleInit(): Promise<void> {
    this.migrate();
    await this.$connect();
  }
}