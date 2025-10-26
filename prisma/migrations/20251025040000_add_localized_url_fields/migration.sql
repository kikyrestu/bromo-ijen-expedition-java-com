-- Add localized URL fields to packages table
ALTER TABLE `packages` ADD COLUMN `localizedUrls` TEXT NULL;
ALTER TABLE `packages` ADD COLUMN `urlPathEn` VARCHAR(100) NULL;
ALTER TABLE `packages` ADD COLUMN `urlPathDe` VARCHAR(100) NULL;
ALTER TABLE `packages` ADD COLUMN `urlPathNl` VARCHAR(100) NULL;
ALTER TABLE `packages` ADD COLUMN `urlPathZh` VARCHAR(100) NULL;

-- Add localized URL fields to blogs table
ALTER TABLE `blogs` ADD COLUMN `localizedUrls` TEXT NULL;
ALTER TABLE `blogs` ADD COLUMN `urlPathEn` VARCHAR(100) NULL;
ALTER TABLE `blogs` ADD COLUMN `urlPathDe` VARCHAR(100) NULL;
ALTER TABLE `blogs` ADD COLUMN `urlPathNl` VARCHAR(100) NULL;
ALTER TABLE `blogs` ADD COLUMN `urlPathZh` VARCHAR(100) NULL;

-- Create localized_url_settings table
CREATE TABLE `localized_url_settings` (
  `id` VARCHAR(50) NOT NULL DEFAULT 'default',
  `contentType` VARCHAR(50) NOT NULL,
  `urlPathId` VARCHAR(100) NULL,
  `urlPathEn` VARCHAR(100) NULL,
  `urlPathDe` VARCHAR(100) NULL,
  `urlPathNl` VARCHAR(100) NULL,
  `urlPathZh` VARCHAR(100) NULL,
  `autoGenerate` BOOLEAN NOT NULL DEFAULT true,
  `customPattern` TEXT NULL,
  `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `localized_url_settings_contentType_key` (`contentType`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Insert default localized URL settings
INSERT INTO `localized_url_settings` (`id`, `contentType`, `urlPathId`, `urlPathEn`, `urlPathDe`, `urlPathNl`, `urlPathZh`, `autoGenerate`) VALUES
('packages', 'packages', 'packages', 'tours', 'reisen', 'reizen', '旅游', true),
('blogs', 'blogs', 'blog', 'blog', 'blog', 'blog', '博客', true),
('gallery', 'gallery', 'gallery', 'gallery', 'galerie', 'galerij', '画廊', true);
