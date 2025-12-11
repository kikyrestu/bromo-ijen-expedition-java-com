import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Dynamic route untuk serve Google verification file
// Format: /google[verification].html (e.g., /google1234567890abcdef.html)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ googleVerification: string[] }> }
) {
  try {
    const { googleVerification } = await params;
    const filename = googleVerification.join('/');
    
    // Get verification code from settings
    const settings = await prisma.settings.findUnique({
      where: { id: 'default' }
    });

    // Check if the filename matches the stored verification
    if (settings?.googleSiteVerification && settings.googleSiteVerification.endsWith('.html')) {
      // If stored verification is a file, check if filename matches
      if (filename === settings.googleSiteVerification) {
        // Return Google verification HTML file
        // Extract the verification code (remove 'google' prefix and '.html' suffix)
        const verificationCode = filename.replace('google', '').replace('.html', '');
        const htmlContent = `google-site-verification: ${verificationCode}`;
        
        return new NextResponse(htmlContent, {
          headers: {
            'Content-Type': 'text/html',
            'Cache-Control': 'public, max-age=3600'
          }
        });
      }
    }

    // If verification code doesn't match, return 404
    return new NextResponse('Verification file not found', { status: 404 });
  } catch (error) {
    console.error('Error serving Google verification file:', error);
    return new NextResponse('Error serving verification file', { status: 500 });
  }
}

