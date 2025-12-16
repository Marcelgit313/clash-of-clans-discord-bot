-- CreateEnum
CREATE TYPE "WarType" AS ENUM ('CLAN_WAR', 'CWL');

-- CreateTable
CREATE TABLE "Player" (
    "tag" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "townHallLevel" INTEGER NOT NULL,
    "expLevel" INTEGER NOT NULL,
    "trophies" INTEGER NOT NULL,
    "bestTrophies" INTEGER NOT NULL,
    "warStars" INTEGER NOT NULL,
    "donations" INTEGER NOT NULL,
    "received" INTEGER NOT NULL,
    "leagueTier" TEXT,
    "leagueIconUrl" TEXT,
    "discordId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "clanId" TEXT,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("tag")
);

-- CreateTable
CREATE TABLE "Clan" (
    "tag" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "points" INTEGER NOT NULL,
    "warWinStreak" INTEGER NOT NULL,
    "warWins" INTEGER NOT NULL,
    "warTies" INTEGER NOT NULL,
    "warLosses" INTEGER NOT NULL,
    "badgeUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Clan_pkey" PRIMARY KEY ("tag")
);

-- CreateTable
CREATE TABLE "ClanWar" (
    "tag" TEXT NOT NULL,
    "homeClanTag" TEXT NOT NULL,
    "opponentClanTag" TEXT NOT NULL,
    "type" "WarType" NOT NULL,
    "state" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "status" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClanWar_pkey" PRIMARY KEY ("tag")
);

-- CreateTable
CREATE TABLE "WarAttack" (
    "tag" TEXT NOT NULL,
    "attackerTag" TEXT NOT NULL,
    "defenderTag" TEXT NOT NULL,
    "stars" INTEGER NOT NULL,
    "destruction" DOUBLE PRECISION NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WarAttack_pkey" PRIMARY KEY ("tag")
);

-- CreateIndex
CREATE UNIQUE INDEX "WarAttack_tag_attackerTag_defenderTag_key" ON "WarAttack"("tag", "attackerTag", "defenderTag");

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_clanId_fkey" FOREIGN KEY ("clanId") REFERENCES "Clan"("tag") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClanWar" ADD CONSTRAINT "ClanWar_homeClanTag_fkey" FOREIGN KEY ("homeClanTag") REFERENCES "Clan"("tag") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClanWar" ADD CONSTRAINT "ClanWar_opponentClanTag_fkey" FOREIGN KEY ("opponentClanTag") REFERENCES "Clan"("tag") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WarAttack" ADD CONSTRAINT "WarAttack_tag_fkey" FOREIGN KEY ("tag") REFERENCES "ClanWar"("tag") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WarAttack" ADD CONSTRAINT "WarAttack_attackerTag_fkey" FOREIGN KEY ("attackerTag") REFERENCES "Player"("tag") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WarAttack" ADD CONSTRAINT "WarAttack_defenderTag_fkey" FOREIGN KEY ("defenderTag") REFERENCES "Player"("tag") ON DELETE RESTRICT ON UPDATE CASCADE;
