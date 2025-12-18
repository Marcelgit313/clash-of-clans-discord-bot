import { Module } from "@nestjs/common";
import { PrismaService } from "./prisma/prisma.service.js";
import { CacheService } from "./cache/cache.service.js";

@Module({
  providers: [PrismaService, CacheService],
  exports: [PrismaService, CacheService],
})
export class CommonModule {}
