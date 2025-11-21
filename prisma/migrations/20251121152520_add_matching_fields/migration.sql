-- AlterTable
ALTER TABLE "users" ADD COLUMN     "is_matched" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "matched_with" UUID;
