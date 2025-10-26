-- AlterTable
ALTER TABLE `packages` ADD COLUMN `departure` VARCHAR(100) NULL,
    ADD COLUMN `excludes` TEXT NULL,
    ADD COLUMN `faqs` TEXT NULL,
    ADD COLUMN `gallery` TEXT NULL,
    ADD COLUMN `itinerary` TEXT NULL,
    ADD COLUMN `location` VARCHAR(255) NULL,
    ADD COLUMN `longDescription` TEXT NULL,
    ADD COLUMN `return` VARCHAR(100) NULL,
    ADD COLUMN `totalPeople` INTEGER NULL;
