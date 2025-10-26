import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

// GET: Fetch settings
export async function GET(request: NextRequest) {
  try {
    // For now, we'll use a single settings record with id 'default'
    let settings = await prisma.settings.findUnique({
      where: { id: 'default' }
    });

    // If no settings exist, create default
    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          id: 'default',
          whatsappNumber: '',
          whatsappGreeting: 'Halo Bromo Ijen Tour! 👋'
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        whatsappNumber: settings.whatsappNumber,
        whatsappGreeting: settings.whatsappGreeting,
        providerName: settings.providerName,
        memberSince: settings.memberSince,
        providerPhone: settings.providerPhone,
        providerEmail: settings.providerEmail,
        siteName: settings.siteName,
        siteDescription: settings.siteDescription,
        defaultOgImage: settings.defaultOgImage,
        siteUrl: settings.siteUrl,
        googleSiteVerification: settings.googleSiteVerification,
        bingSiteVerification: settings.bingSiteVerification,
        activeTemplate: settings.activeTemplate
      }
    });

  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

// POST: Update settings
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const settings = await prisma.settings.upsert({
      where: { id: 'default' },
      update: {
        whatsappNumber: body.whatsappNumber || '',
        whatsappGreeting: body.whatsappGreeting || 'Halo Bromo Ijen Tour! 👋',
        // Provider Details
        providerName: body.providerName || 'Bromo Ijen Tour',
        memberSince: body.memberSince || '14 May 2024',
        providerPhone: body.providerPhone || '+62 812-3456-7890',
        providerEmail: body.providerEmail || 'info@bromotour.com',
        // SEO Settings
        siteName: body.siteName,
        siteDescription: body.siteDescription,
        defaultOgImage: body.defaultOgImage,
        siteUrl: body.siteUrl,
        // Search Engine Verification
        googleSiteVerification: body.googleSiteVerification || '',
        bingSiteVerification: body.bingSiteVerification || '',
        // Template Setting
        activeTemplate: body.activeTemplate || 'default'
      },
      create: {
        id: 'default',
        whatsappNumber: body.whatsappNumber || '',
        whatsappGreeting: body.whatsappGreeting || 'Halo Bromo Ijen Tour! 👋',
        // Provider Details
        providerName: body.providerName || 'Bromo Ijen Tour',
        memberSince: body.memberSince || '14 May 2024',
        providerPhone: body.providerPhone || '+62 812-3456-7890',
        providerEmail: body.providerEmail || 'info@bromotour.com',
        // SEO Settings
        siteName: body.siteName || 'Bromo Ijen Tour & Travel',
        siteDescription: body.siteDescription || 'Experience the best of Mount Bromo and Ijen',
        defaultOgImage: body.defaultOgImage || '/og-default.jpg',
        siteUrl: body.siteUrl || 'https://bromoijen.com',
        // Search Engine Verification
        googleSiteVerification: body.googleSiteVerification || '',
        bingSiteVerification: body.bingSiteVerification || '',
        // Template Setting
        activeTemplate: body.activeTemplate || 'default'
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        whatsappNumber: settings.whatsappNumber,
        whatsappGreeting: settings.whatsappGreeting,
        providerName: settings.providerName,
        memberSince: settings.memberSince,
        providerPhone: settings.providerPhone,
        providerEmail: settings.providerEmail,
        siteName: settings.siteName,
        siteDescription: settings.siteDescription,
        defaultOgImage: settings.defaultOgImage,
        siteUrl: settings.siteUrl,
        googleSiteVerification: settings.googleSiteVerification,
        bingSiteVerification: settings.bingSiteVerification,
        activeTemplate: settings.activeTemplate
      }
    });

  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}