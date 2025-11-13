-- AlterTable
ALTER TABLE "users" ADD COLUMN     "one_liner" TEXT,
ADD COLUMN     "summary" TEXT,
ADD COLUMN     "traits" TEXT[] DEFAULT ARRAY[]::TEXT[];
