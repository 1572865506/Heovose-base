/*
  Warnings:

  - Added the required column `updatedAt` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "GalleryCategory" ADD COLUMN     "parentId" TEXT;

-- AlterTable
ALTER TABLE "HomepageContent" ADD COLUMN     "heroProjectDescriptionEn" TEXT,
ADD COLUMN     "heroProjectDescriptionZh" TEXT,
ADD COLUMN     "heroSlides" JSONB,
ADD COLUMN     "heroWholesaleDescriptionEn" TEXT,
ADD COLUMN     "heroWholesaleDescriptionZh" TEXT,
ADD COLUMN     "videoUrl" TEXT;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "advantageTextIds" TEXT[],
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "descriptionTextId" TEXT,
ADD COLUMN     "enabledLanguages" TEXT[],
ADD COLUMN     "galleryImageUrls" TEXT[],
ADD COLUMN     "localizedDetails" JSONB,
ADD COLUMN     "mainImageUrl" TEXT,
ADD COLUMN     "specGroups" JSONB,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "Setting" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_descriptionTextId_fkey" FOREIGN KEY ("descriptionTextId") REFERENCES "LocalizedString"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GalleryCategory" ADD CONSTRAINT "GalleryCategory_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "GalleryCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
