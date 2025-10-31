CREATE TABLE `banners` (
  `id` VARCHAR(191) NOT NULL,
  `slug` VARCHAR(150) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `title` VARCHAR(200) NULL,
  `subtitle` VARCHAR(255) NULL,
  `description` LONGTEXT NULL,
  `displayType` VARCHAR(50) NOT NULL DEFAULT 'image',
  `imageUrl` VARCHAR(255) NULL,
  `backgroundColor` VARCHAR(20) NULL,
  `overlayColor` VARCHAR(20) NULL,
  `ctaText` VARCHAR(120) NULL,
  `ctaUrl` VARCHAR(255) NULL,
  `isActive` TINYINT(1) NOT NULL DEFAULT 1,
  `customHtml` LONGTEXT NULL,
  `createdBy` VARCHAR(100) NULL,
  `updatedBy` VARCHAR(100) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  UNIQUE INDEX `banners_slug_key`(`slug`),
  PRIMARY KEY `banners_pkey` (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `banner_translations` (
  `id` VARCHAR(191) NOT NULL,
  `bannerId` VARCHAR(191) NOT NULL,
  `language` VARCHAR(5) NOT NULL,
  `title` VARCHAR(200) NULL,
  `subtitle` VARCHAR(255) NULL,
  `description` LONGTEXT NULL,
  `ctaText` VARCHAR(120) NULL,
  `ctaUrl` VARCHAR(255) NULL,
  `imageUrl` VARCHAR(255) NULL,
  UNIQUE INDEX `banner_translations_bannerId_language_key`(`bannerId`, `language`),
  PRIMARY KEY `banner_translations_pkey` (`id`),
  CONSTRAINT `banner_translations_bannerId_fkey` FOREIGN KEY (`bannerId`) REFERENCES `banners`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `banner_placements` (
  `id` VARCHAR(191) NOT NULL,
  `bannerId` VARCHAR(191) NOT NULL,
  `location` VARCHAR(100) NOT NULL,
  `position` INT NOT NULL DEFAULT 0,
  `isActive` TINYINT(1) NOT NULL DEFAULT 1,
  `startDate` DATETIME(3) NULL,
  `endDate` DATETIME(3) NULL,
  INDEX `banner_placements_location_position_idx`(`location`, `position`),
  PRIMARY KEY `banner_placements_pkey` (`id`),
  CONSTRAINT `banner_placements_bannerId_fkey` FOREIGN KEY (`bannerId`) REFERENCES `banners`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
