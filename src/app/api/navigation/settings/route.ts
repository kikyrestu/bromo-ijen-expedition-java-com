import { NextRequest, NextResponse } from 'next/server';

// Mock navigation settings data
const mockNavigationSettings = {
  topbar: {
    enabled: true,
    text: 'Welcome to Bromo Ijen Adventure!',
    backgroundColor: '#f97316',
    textColor: '#ffffff',
    showLanguageSelector: true,
    showContactInfo: true,
    contactInfo: {
      phone: '+62 812-3456-7890',
      email: 'info@bromoijen.com',
      whatsapp: '+62 812-3456-7890'
    }
  },
  header: {
    logo: '/logo.png',
    logoAlt: 'Bromo Ijen Adventure',
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    sticky: true,
    showSearch: true,
    showLanguageSelector: true,
    showContactButton: true,
    contactButtonText: 'Contact Us',
    contactButtonUrl: '/#contact'
  },
  mobile: {
    enabled: true,
    backgroundColor: '#1f2937',
    textColor: '#ffffff',
    showLanguageSelector: true,
    showContactInfo: true,
    menuIcon: 'hamburger',
    closeIcon: 'x'
  },
  footer: {
    backgroundColor: '#1f2937',
    textColor: '#ffffff',
    showSocialLinks: true,
    showNewsletter: true,
    showContactInfo: true,
    socialLinks: {
      facebook: 'https://facebook.com/bromoijen',
      instagram: 'https://instagram.com/bromoijen',
      twitter: 'https://twitter.com/bromoijen',
      youtube: 'https://youtube.com/bromoijen'
    }
  },
  language: {
    defaultLanguage: 'id',
    supportedLanguages: ['id', 'en', 'de', 'cn', 'ru'],
    showLanguageSelector: true,
    languageSelectorPosition: 'topbar'
  }
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';

    let responseData = mockNavigationSettings;

    // Filter by type if specified
    if (type !== 'all' && mockNavigationSettings[type as keyof typeof mockNavigationSettings]) {
      responseData = { [type]: mockNavigationSettings[type as keyof typeof mockNavigationSettings] } as any;
    }

    return NextResponse.json({
      success: true,
      data: responseData,
      type: type
    });
  } catch (error) {
    console.error('Navigation settings API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch navigation settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, settings } = body;

    if (!type || !settings) {
      return NextResponse.json(
        { success: false, error: 'Type and settings are required' },
        { status: 400 }
      );
    }

    // Mock save operation
    return NextResponse.json({
      success: true,
      message: 'Navigation settings saved successfully',
      data: {
        type,
        settings,
        updatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Navigation settings save error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save navigation settings' },
      { status: 500 }
    );
  }
}
