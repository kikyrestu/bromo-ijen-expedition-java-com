import { NextRequest, NextResponse } from 'next/server';
import { translationService } from '@/lib/translation-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, from = 'id', to = 'en' } = body;

    if (!text) {
      return NextResponse.json(
        { success: false, error: 'Text is required' },
        { status: 400 }
      );
    }

    // Validate language codes
    const supportedLanguages = translationService.getSupportedLanguages();
    if (!supportedLanguages.includes(from) || !supportedLanguages.includes(to)) {
      return NextResponse.json(
        { success: false, error: 'Unsupported language code' },
        { status: 400 }
      );
    }

    // Translate the text
    const translatedText = await translationService.translateText(text, from, to);

    return NextResponse.json({
      success: true,
      data: {
        originalText: text,
        translatedText: translatedText,
        from,
        to
      }
    });

  } catch (error) {
    console.error('Translation API error:', error);
    return NextResponse.json(
      { success: false, error: 'Translation failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const text = searchParams.get('text');
    const from = searchParams.get('from') || 'id';
    const to = searchParams.get('to') || 'en';

    if (!text) {
      return NextResponse.json(
        { success: false, error: 'Text parameter is required' },
        { status: 400 }
      );
    }

    // Validate language codes
    const supportedLanguages = translationService.getSupportedLanguages();
    if (!supportedLanguages.includes(from) || !supportedLanguages.includes(to)) {
      return NextResponse.json(
        { success: false, error: 'Unsupported language code' },
        { status: 400 }
      );
    }

    // Translate the text
    const translatedText = await translationService.translateText(text, from, to);

    return NextResponse.json({
      success: true,
      data: {
        originalText: text,
        translatedText: translatedText,
        from,
        to
      }
    });

  } catch (error) {
    console.error('Translation API error:', error);
    return NextResponse.json(
      { success: false, error: 'Translation failed' },
      { status: 500 }
    );
  }
}