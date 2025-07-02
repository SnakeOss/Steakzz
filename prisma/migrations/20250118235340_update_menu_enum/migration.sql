/*
  Warnings:

  - The values [CHICKEN_STEAK,FISH_STEAK,BEEF_STEAK,LAMB_STEAK] on the enum `menuItem` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[item]` on the table `Menu` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "menuItem_new" AS ENUM ('GRILLED_CHICKEN', 'PASTA_ALFREDO', 'PIZZA_MARGHERITA', 'SUSHI_ROLL', 'BURGER_DELUXE', 'CAESAR_SALAD');
ALTER TABLE "Menu" ALTER COLUMN "item" TYPE "menuItem_new" USING ("item"::text::"menuItem_new");
ALTER TYPE "menuItem" RENAME TO "menuItem_old";
ALTER TYPE "menuItem_new" RENAME TO "menuItem";
DROP TYPE "menuItem_old";
COMMIT;

-- CreateIndex
CREATE UNIQUE INDEX "Menu_item_key" ON "Menu"("item");
