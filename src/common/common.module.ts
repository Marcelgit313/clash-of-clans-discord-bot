import { Module } from "@nestjs/common";
import { PrismaService } from "./prisma/prisma.service.js";

@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class CommonModule {}
