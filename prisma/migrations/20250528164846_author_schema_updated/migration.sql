-- DropIndex
DROP INDEX "Author_olid_key";

-- AlterTable
ALTER TABLE "Author" ALTER COLUMN "olid" DROP NOT NULL,
ALTER COLUMN "name" DROP NOT NULL,
ALTER COLUMN "link" DROP NOT NULL,
ALTER COLUMN "gender" DROP NOT NULL,
ALTER COLUMN "about" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Author_olid_idx" ON "Author"("olid");

-- CreateIndex
CREATE INDEX "Author_average_rating_idx" ON "Author"("average_rating");
