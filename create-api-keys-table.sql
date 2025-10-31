-- Create api_key_settings table manually
-- Run this in your MySQL database if you can't run migrations

CREATE TABLE IF NOT EXISTS `api_key_settings` (
  `id` VARCHAR(50) NOT NULL DEFAULT 'default',
  `keys` LONGTEXT NULL,
  `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default row
INSERT IGNORE INTO `api_key_settings` (`id`, `keys`, `createdAt`, `updatedAt`) 
VALUES ('default', NULL, NOW(), NOW());

