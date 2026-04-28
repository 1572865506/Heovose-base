-- CreateTable
CREATE TABLE "LocalizedString" (
    "id" TEXT NOT NULL,
    "zh" TEXT NOT NULL,
    "en" TEXT NOT NULL,

    CONSTRAINT "LocalizedString_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomepageContent" (
    "id" TEXT NOT NULL DEFAULT 'hero',
    "heroHeadlineEn" TEXT,
    "heroHeadlineZh" TEXT,
    "heroSubheadlineEn" TEXT,
    "heroSubheadlineZh" TEXT,
    "heroWholesaleButtonEn" TEXT,
    "heroWholesaleButtonZh" TEXT,
    "heroProjectButtonEn" TEXT,
    "heroProjectButtonZh" TEXT,
    "heroWholesaleCategoryId" TEXT,
    "heroProjectCategoryId" TEXT,
    "isVideoEnabled" BOOLEAN NOT NULL DEFAULT true,
    "videoTitleEn" TEXT,
    "videoTitleZh" TEXT,
    "videoSubtitleEn" TEXT,
    "videoSubtitleZh" TEXT,
    "mapTitleEn" TEXT,
    "mapTitleZh" TEXT,
    "mapSubtitleEn" TEXT,
    "mapSubtitleZh" TEXT,

    CONSTRAINT "HomepageContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MapLocation" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "titleZh" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "addressZh" TEXT NOT NULL,
    "addressEn" TEXT NOT NULL,
    "descZh" TEXT NOT NULL,
    "descEn" TEXT NOT NULL,
    "imageUrl" TEXT,
    "posTop" TEXT NOT NULL,
    "posLeft" TEXT NOT NULL,
    "homepageId" TEXT NOT NULL,

    CONSTRAINT "MapLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseStudy" (
    "id" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "tagZh" TEXT NOT NULL,
    "tagEn" TEXT NOT NULL,
    "titleZh" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "descZh" TEXT NOT NULL,
    "descEn" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,

    CONSTRAINT "CaseStudy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductionStep" (
    "id" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "titleZh" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "descZh" TEXT NOT NULL,
    "descEn" TEXT NOT NULL,
    "imageUrls" TEXT[],

    CONSTRAINT "ProductionStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "nameTextId" TEXT NOT NULL,
    "categoryId" TEXT,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductCategory" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "thumbnailImageUrl" TEXT,
    "parentId" TEXT,
    "nameTextId" TEXT NOT NULL,

    CONSTRAINT "ProductCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "uid" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'editor',
    "displayName" TEXT,
    "avatarUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("uid")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductCategory_slug_key" ON "ProductCategory"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- AddForeignKey
ALTER TABLE "MapLocation" ADD CONSTRAINT "MapLocation_homepageId_fkey" FOREIGN KEY ("homepageId") REFERENCES "HomepageContent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_nameTextId_fkey" FOREIGN KEY ("nameTextId") REFERENCES "LocalizedString"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ProductCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCategory" ADD CONSTRAINT "ProductCategory_nameTextId_fkey" FOREIGN KEY ("nameTextId") REFERENCES "LocalizedString"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCategory" ADD CONSTRAINT "ProductCategory_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "ProductCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
