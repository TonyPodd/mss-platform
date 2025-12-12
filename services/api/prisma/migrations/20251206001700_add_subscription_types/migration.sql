-- CreateTable SubscriptionType
CREATE TABLE "subscription_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "classCount" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "durationDays" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_types_pkey" PRIMARY KEY ("id")
);

-- AlterTable subscriptions: Add typeId field
ALTER TABLE "subscriptions" ADD COLUMN "typeId" TEXT;

-- Создаём временный тип абонемента для существующих записей
INSERT INTO "subscription_types" ("id", "name", "description", "classCount", "price", "isActive", "createdAt", "updatedAt")
VALUES ('00000000-0000-0000-0000-000000000001', 'Старый абонемент', 'Миграция старых абонементов', 1, 0, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Обновляем существующие subscriptions, устанавливая typeId
UPDATE "subscriptions" SET "typeId" = '00000000-0000-0000-0000-000000000001' WHERE "typeId" IS NULL;

-- Делаем typeId NOT NULL
ALTER TABLE "subscriptions" ALTER COLUMN "typeId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "subscription_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
