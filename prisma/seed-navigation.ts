import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding navigation menus...');

  // Check if menu already exists
  let headerMenu = await prisma.navigationMenu.findFirst({
    where: { location: 'header' }
  });

  if (!headerMenu) {
    // Create Main Header Menu
    headerMenu = await prisma.navigationMenu.create({
      data: {
        name: 'Main Navigation',
        location: 'header',
        isActive: true
      }
    });
    console.log('✅ Created Main Header Menu:', headerMenu.id);
  } else {
    console.log('✅ Main Header Menu already exists:', headerMenu.id);
  }

  // Menu Items Configuration
  const menuItems = [
    {
        order: 1,
        isActive: true,
        isExternal: false,
      target: '_self',
      iconType: 'lucide',
      iconName: 'Home',
      iconUrl: null,
      backgroundColor: null,
      textColor: null,
      hoverColor: null,
      activeColor: null,
      fontFamily: null,
      fontSize: null,
      fontWeight: null,
      children: []
    },
    {
        order: 2,
        isActive: true,
        isExternal: false,
      target: '_self',
      iconType: 'lucide',
      iconName: 'Package',
      iconUrl: null,
      backgroundColor: null,
      textColor: null,
      hoverColor: null,
      activeColor: null,
      fontFamily: null,
      fontSize: null,
      fontWeight: null,
      children: [
        {
          order: 1,
        isActive: true,
        isExternal: false,
          target: '_self',
          iconType: 'lucide',
          iconName: 'Mountain',
          iconUrl: null,
          backgroundColor: null,
          textColor: null,
          hoverColor: null,
          activeColor: null,
          fontFamily: null,
          fontSize: null,
          fontWeight: null,
          children: []
        },
        {
          order: 2,
        isActive: true,
        isExternal: false,
          target: '_self',
          iconType: 'lucide',
          iconName: 'Flame',
          iconUrl: null,
          backgroundColor: null,
          textColor: null,
          hoverColor: null,
          activeColor: null,
          fontFamily: null,
          fontSize: null,
          fontWeight: null,
          children: []
        },
        {
          order: 3,
        isActive: true,
        isExternal: false,
          target: '_self',
          iconType: 'lucide',
          iconName: 'Map',
          iconUrl: null,
          backgroundColor: null,
          textColor: null,
          hoverColor: null,
          activeColor: null,
          fontFamily: null,
          fontSize: null,
          fontWeight: null,
          children: []
        }
      ]
    },
    {
      order: 3,
        isActive: true,
        isExternal: false,
      target: '_self',
      iconType: 'lucide',
      iconName: 'Image',
      iconUrl: null,
      backgroundColor: null,
      textColor: null,
      hoverColor: null,
      activeColor: null,
      fontFamily: null,
      fontSize: null,
      fontWeight: null,
      children: []
    },
    {
      order: 4,
        isActive: true,
        isExternal: false,
      target: '_self',
      iconType: 'lucide',
      iconName: 'BookOpen',
      iconUrl: null,
      backgroundColor: null,
      textColor: null,
      hoverColor: null,
      activeColor: null,
      fontFamily: null,
      fontSize: null,
      fontWeight: null,
      children: []
    },
    {
      order: 5,
        isActive: true,
        isExternal: false,
      target: '_self',
      iconType: 'lucide',
      iconName: 'Phone',
      iconUrl: null,
      backgroundColor: null,
      textColor: null,
      hoverColor: null,
      activeColor: null,
      fontFamily: null,
      fontSize: null,
      fontWeight: null,
      children: []
    }
  ];

  // Create menu items with translations
  for (const itemConfig of menuItems) {
    let item;
    const { children, ...menuItemConfig } = itemConfig;

    // Get translations based on index
    let titleEn = '';
    let titleId = '';
    let urlEn = '';
    let urlId = '';
    let iconName = itemConfig.iconName || '';

    switch (itemConfig.order) {
      case 1: // Home
        titleId = 'Beranda';
        titleEn = 'Home';
        urlId = '/';
        urlEn = '/en';
        break;
      case 2: // Packages
        titleId = 'Paket Wisata';
        titleEn = 'Tour Packages';
        urlId = '/packages';
        urlEn = '/en/packages';
        break;
      case 3: // Gallery
        titleId = 'Galeri';
        titleEn = 'Gallery';
        urlId = '/#gallery';
        urlEn = '/en#gallery';
        break;
      case 4: // Blog
        titleId = 'Blog';
        titleEn = 'Blog';
        urlId = '/blog';
        urlEn = '/en/blog';
        break;
      case 5: // Contact
        titleId = 'Kontak';
        titleEn = 'Contact';
        urlId = '/#contact';
        urlEn = '/en#contact';
        break;
    }

    // Create menu item
    if (itemConfig.order === 2 && children && children.length > 0) {
      // Create parent item first
      item = await prisma.navigationItem.create({
        data: {
          ...menuItemConfig,
          menuId: headerMenu.id,
          parentId: null,
          translations: {
            create: [
              { language: 'id', title: titleId, url: urlId },
              { language: 'en', title: titleEn, url: urlEn }
            ]
          }
        }
      });

      console.log(`✅ Created menu item: ${titleId}`);

      // Create children
      let childIndex = 1;
      for (const childConfig of children) {
        const childTitles = [
          { id: 'Paket Bromo', en: 'Bromo Tour' },
          { id: 'Paket Ijen', en: 'Ijen Tour' },
          { id: 'Paket Combo', en: 'Combo Tour' }
        ];
        const childUrls = [
          { id: '/packages/bromo-tour', en: '/en/packages/bromo-tour' },
          { id: '/packages/ijen-tour', en: '/en/packages/ijen-tour' },
          { id: '/packages/combo-tour', en: '/en/packages/combo-tour' }
        ];

        const { children: _, ...childItemConfig } = childConfig;
        
        await prisma.navigationItem.create({
          data: {
            ...childItemConfig,
            menuId: headerMenu.id,
            parentId: item.id,
            order: childIndex,
            translations: {
              create: [
                { 
                  language: 'id', 
                  title: childTitles[childIndex - 1].id, 
                  url: childUrls[childIndex - 1].id 
                },
                { 
                  language: 'en', 
                  title: childTitles[childIndex - 1].en, 
                  url: childUrls[childIndex - 1].en 
                }
              ]
            }
          }
        });

        console.log(`✅ Created submenu: ${childTitles[childIndex - 1].id}`);
        childIndex++;
      }
    } else {
      item = await prisma.navigationItem.create({
        data: {
          ...menuItemConfig,
          menuId: headerMenu.id,
          parentId: null,
          translations: {
            create: [
              { language: 'id', title: titleId, url: urlId },
              { language: 'en', title: titleEn, url: urlEn }
            ]
          }
        }
      });

      console.log(`✅ Created menu item: ${titleId}`);
    }
  }

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
