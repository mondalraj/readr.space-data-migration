-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('male', 'female', 'others');

-- CreateTable
CREATE TABLE "Author" (
    "id" SERIAL NOT NULL,
    "olid" TEXT NOT NULL,
    "birth_date" TIMESTAMP(3),
    "alternate_names" TEXT[],
    "name" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "rating_count" INTEGER NOT NULL DEFAULT 0,
    "average_rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "gender" "Gender" NOT NULL,
    "image_url" TEXT,
    "about" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "uuid" TEXT NOT NULL,

    CONSTRAINT "Author_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Author_olid_key" ON "Author"("olid");

-- CreateIndex
CREATE UNIQUE INDEX "Author_uuid_key" ON "Author"("uuid");

-- CreateIndex
CREATE INDEX "Author_name_idx" ON "Author"("name");

-- CreateIndex
CREATE INDEX "Author_alternate_names_idx" ON "Author"("alternate_names");

-- CreateIndex
CREATE INDEX "Author_about_idx" ON "Author"("about");
