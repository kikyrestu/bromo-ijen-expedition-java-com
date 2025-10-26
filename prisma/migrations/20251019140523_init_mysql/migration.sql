-- CreateTable
CREATE TABLE `section_contents` (
    `id` VARCHAR(191) NOT NULL,
    `sectionId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(255) NULL,
    `subtitle` TEXT NULL,
    `description` TEXT NULL,
    `ctaText` VARCHAR(255) NULL,
    `ctaLink` VARCHAR(255) NULL,
    `backgroundVideo` VARCHAR(255) NULL,
    `destinations` TEXT NULL,
    `features` TEXT NULL,
    `stats` TEXT NULL,
    `packages` TEXT NULL,
    `testimonials` TEXT NULL,
    `posts` TEXT NULL,
    `items` TEXT NULL,
    `categories` TEXT NULL,
    `updatedAt` TIMESTAMP(0) NOT NULL,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `section_contents_sectionId_key`(`sectionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `destinations` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `location` VARCHAR(255) NOT NULL,
    `category` VARCHAR(100) NOT NULL,
    `rating` FLOAT NOT NULL,
    `visitors` VARCHAR(50) NOT NULL,
    `duration` VARCHAR(100) NOT NULL,
    `price` VARCHAR(50) NOT NULL,
    `description` TEXT NOT NULL,
    `highlights` TEXT NOT NULL,
    `image` VARCHAR(255) NOT NULL,
    `featured` BOOLEAN NOT NULL DEFAULT false,
    `updatedAt` TIMESTAMP(0) NOT NULL,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `packages` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `duration` VARCHAR(100) NOT NULL,
    `price` FLOAT NOT NULL,
    `originalPrice` FLOAT NULL,
    `discount` VARCHAR(50) NULL,
    `rating` FLOAT NOT NULL,
    `reviewCount` INTEGER NOT NULL,
    `category` VARCHAR(100) NOT NULL,
    `description` TEXT NOT NULL,
    `destinations` TEXT NOT NULL,
    `includes` TEXT NOT NULL,
    `highlights` TEXT NOT NULL,
    `groupSize` VARCHAR(50) NOT NULL,
    `difficulty` VARCHAR(50) NOT NULL,
    `bestFor` VARCHAR(100) NOT NULL,
    `image` VARCHAR(255) NOT NULL,
    `featured` BOOLEAN NOT NULL DEFAULT false,
    `available` BOOLEAN NOT NULL DEFAULT true,
    `updatedAt` TIMESTAMP(0) NOT NULL,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `blogs` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `excerpt` TEXT NOT NULL,
    `content` LONGTEXT NOT NULL,
    `author` VARCHAR(100) NOT NULL,
    `publishDate` DATETIME(0) NOT NULL,
    `readTime` VARCHAR(50) NOT NULL,
    `category` VARCHAR(100) NOT NULL,
    `tags` TEXT NOT NULL,
    `image` VARCHAR(255) NOT NULL,
    `likes` INTEGER NOT NULL DEFAULT 0,
    `shares` INTEGER NOT NULL DEFAULT 0,
    `featured` BOOLEAN NOT NULL DEFAULT false,
    `status` VARCHAR(20) NOT NULL DEFAULT 'draft',
    `updatedAt` TIMESTAMP(0) NOT NULL,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `testimonials` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `role` VARCHAR(100) NOT NULL,
    `content` TEXT NOT NULL,
    `rating` INTEGER NOT NULL,
    `image` VARCHAR(255) NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'pending',
    `updatedAt` TIMESTAMP(0) NOT NULL,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `gallery_items` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `category` VARCHAR(100) NOT NULL,
    `image` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `tags` TEXT NOT NULL,
    `likes` INTEGER NOT NULL DEFAULT 0,
    `views` INTEGER NOT NULL DEFAULT 0,
    `updatedAt` TIMESTAMP(0) NOT NULL,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bookings` (
    `id` VARCHAR(191) NOT NULL,
    `packageId` VARCHAR(255) NOT NULL,
    `packageName` VARCHAR(255) NOT NULL,
    `customerName` VARCHAR(100) NOT NULL,
    `customerEmail` VARCHAR(255) NOT NULL,
    `customerPhone` VARCHAR(20) NOT NULL,
    `checkInDate` DATETIME(0) NOT NULL,
    `checkOutDate` DATETIME(0) NOT NULL,
    `adults` INTEGER NOT NULL,
    `children` INTEGER NOT NULL,
    `infants` INTEGER NOT NULL,
    `totalPrice` FLOAT NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'pending',
    `paymentStatus` VARCHAR(20) NOT NULL DEFAULT 'pending',
    `specialRequests` TEXT NULL,
    `updatedAt` TIMESTAMP(0) NOT NULL,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
