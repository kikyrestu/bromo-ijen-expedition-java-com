import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding navigation menus...');

  // Create Main Header Menu
  const headerMenu = await prisma.navigationMenu.create({
    data: {
      name: 'Main Navigation',
      location: 'header',
      isActive: true
    }
  });
  console.log('✅ Created Main Header Menu:', headerMenu.id);

  // 1. Beranda / Home
  await prisma.navigationItem.create({
    data: {
      menuId: headerMenu.id,
      order: 1,
      isActive: true,
      isExternal: false,
      target: '_self',
      iconType: 'lucide',
      iconName: 'Home',
      translations: {
        create: [
          { language: 'id', title: 'Beranda', url: '/' },
          { language: 'en', title: 'Home', url: '/en' }
        ]
      }
    }
  });
  console.log('✅ Created menu item: Beranda / Home');

  // 2. Paket Wisata / Tour Packages (with children)
  const packagesParent = await prisma.navigationItem.create({
    data: {
      menuId: headerMenu.id,
      order: 2,
      isActive: true,
      isExternal: false,
      target: '_self',
      iconType: 'lucide',
      iconName: 'Package',
      translations: {
        create: [
          { language: 'id', title: 'Paket Wisata', url: '/packages' },
          { language: 'en', title: 'Tour Packages', url: '/en/packages' }
        ]
      }
    }
  });
  console.log('✅ Created menu item: Paket Wisata / Tour Packages');

  // 2.1 Paket Bromo (child)
  await prisma.navigationItem.create({
    data: {
      menuId: headerMenu.id,
      parentId: packagesParent.id,
      order: 1,
      isActive: true,
      isExternal: false,
      target: '_self',
      iconType: 'lucide',
      iconName: 'Mountain',
      translations: {
        create: [
          { language: 'id', title: 'Paket Bromo', url: '/packages/bromo-tour' },
          { language: 'en', title: 'Bromo Tour', url: '/en/packages/bromo-tour' }
        ]
      }
    }
  });
  console.log('  ✅ Created submenu: Paket Bromo');

  // 2.2 Paket Ijen (child)
  await prisma.navigationItem.create({
    data: {
      menuId: headerMenu.id,
      parentId: packagesParent.id,
      order: 2,
      isActive: true,
      isExternal: false,
      target: '_self',
      iconType: 'lucide',
      iconName: 'Flame',
      translations: {
        create: [
          { language: 'id', title: 'Paket Ijen', url: '/packages/ijen-tour' },
          { language: 'en', title: 'Ijen Tour', url: '/en/packages/ijen-tour' }
        ]
      }
    }
  });
  console.log('  ✅ Created submenu: Paket Ijen');

  // 2.3 Paket Combo (child)
  await prisma.navigationItem.create({
    data: {
      menuId: headerMenu.id,
      parentId: packagesParent.id,
      order: 3,
      isActive: true,
      isExternal: false,
      target: '_self',
      iconType: 'lucide',
      iconName: 'Map',
      translations: {
        create: [
          { language: 'id', title: 'Paket Combo', url: '/packages/combo-tour' },
          { language: 'en', title: 'Combo Tour', url: '/en/packages/combo-tour' }
        ]
      }
    }
  });
  console.log('  ✅ Created submenu: Paket Combo');

  // 3. Galeri / Gallery
  await prisma.navigationItem.create({
    data: {
      menuId: headerMenu.id,
      order: 3,
      isActive: true,
      isExternal: false,
      target: '_self',
      iconType: 'lucide',
      iconName: 'Image',
      translations: {
        create: [
          { language: 'id', title: 'Galeri', url: '/#gallery' },
          { language: 'en', title: 'Gallery', url: '/en#gallery' }
        ]
      }
    }
  });
  console.log('✅ Created menu item: Galeri / Gallery');

  // 4. Blog / Blog
  await prisma.navigationItem.create({
    data: {
      menuId: headerMenu.id,
      order: 4,
      isActive: true,
      isExternal: false,
      target: '_self',
      iconType: 'lucide',
      iconName: 'BookOpen',
      translations: {
        create: [
          { language: 'id', title: 'Blog', url: '/blog' },
          { language: 'en', title: 'Blog', url: '/en/blog' }
        ]
      }
    }
  });
  console.log('✅ Created menu item: Blog / Blog');

  // 5. Kontak / Contact
  await prisma.navigationItem.create({
    data: {
      menuId: headerMenu.id,
      order: 5,
      isActive: true,
      isExternal: false,
      target: '_self',
      iconType: 'lucide',
      iconName: 'Phone',
      translations: {
        create: [
          { language: 'id', title: 'Kontak', url: '/#contact' },
          { language: 'en', title: 'Contact', url: '/en#contact' }
        ]
      }
    }
  });
  console.log('✅ Created menu item: Kontak / Contact');

  console.log('✨ Navigation menus seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding navigation:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
