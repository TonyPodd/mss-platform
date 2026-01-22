-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('SCHEDULED', 'CANCELLED', 'COMPLETED');

-- AlterTable regular_groups: Change schedule from String to Json
ALTER TABLE "regular_groups" ADD COLUMN "schedule_new" JSONB;

-- Convert existing schedule data to JSON format (simple wrapper)
UPDATE "regular_groups" SET "schedule_new" = jsonb_build_object('text', "schedule", 'daysOfWeek', ARRAY[]::integer[], 'time', '00:00', 'duration', 90);

-- Drop old column and rename new one
ALTER TABLE "regular_groups" DROP COLUMN "schedule";
ALTER TABLE "regular_groups" RENAME COLUMN "schedule_new" TO "schedule";
ALTER TABLE "regular_groups" ALTER COLUMN "schedule" SET NOT NULL;

-- CreateTable GroupSession
CREATE TABLE "group_sessions" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL,
    "status" "SessionStatus" NOT NULL DEFAULT 'SCHEDULED',
    "currentParticipants" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "group_sessions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "group_sessions" ADD CONSTRAINT "group_sessions_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "regular_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable bookings: Make eventId optional and add groupSessionId
ALTER TABLE "bookings" ALTER COLUMN "eventId" DROP NOT NULL;
ALTER TABLE "bookings" ADD COLUMN "groupSessionId" TEXT;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_groupSessionId_fkey" FOREIGN KEY ("groupSessionId") REFERENCES "group_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
