-- AlterTable
ALTER TABLE `section_contents` ADD COLUMN `category` VARCHAR(100) NULL,
    ADD COLUMN `displayCount` INTEGER NULL,
    ADD COLUMN `featuredOnly` BOOLEAN NULL DEFAULT false,
    ADD COLUMN `sortBy` VARCHAR(50) NULL;
