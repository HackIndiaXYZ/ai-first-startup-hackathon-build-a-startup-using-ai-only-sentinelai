-- AlterTable
ALTER TABLE "Finding" ADD COLUMN     "confidence" INTEGER NOT NULL DEFAULT 50,
ADD COLUMN     "evidence" TEXT,
ADD COLUMN     "filename" TEXT,
ADD COLUMN     "recommendation" TEXT;
