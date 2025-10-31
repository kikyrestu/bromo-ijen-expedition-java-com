import { NextResponse } from 'next/server';

// POST - Test API key
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { service, apiKey } = body;

    if (!service || !apiKey) {
      return NextResponse.json({
        success: false,
        error: 'Service and API key are required'
      }, { status: 400 });
    }

    // Test different services
    let testResult = false;
    let errorMessage = '';

    switch (service) {
      case 'deepl':
        testResult = await testDeepL(apiKey);
        errorMessage = 'Invalid DeepL API key or service unavailable';
        break;

      case 'google_translate':
        testResult = await testGoogleTranslate(apiKey);
        errorMessage = 'Invalid Google Translate API key or service unavailable';
        break;

      case 'openai':
        testResult = await testOpenAI(apiKey);
        errorMessage = 'Invalid OpenAI API key or service unavailable';
        break;

      case 'google_analytics':
        testResult = apiKey.startsWith('G-') || apiKey.startsWith('UA-');
        errorMessage = 'Invalid Google Analytics ID format';
        break;

      case 'mapbox':
        testResult = apiKey.startsWith('pk.');
        errorMessage = 'Invalid Mapbox API key format';
        break;

      case 'stripe':
        testResult = apiKey.startsWith('sk_');
        errorMessage = 'Invalid Stripe API key format';
        break;

      case 'sendgrid':
        testResult = apiKey.startsWith('SG.');
        errorMessage = 'Invalid SendGrid API key format';
        break;

      case 'cloudinary':
        testResult = apiKey.length > 10; // Basic validation
        errorMessage = 'Invalid Cloudinary API key';
        break;

      default:
        return NextResponse.json({
          success: false,
          error: 'Unknown service'
        }, { status: 400 });
    }

    if (testResult) {
      return NextResponse.json({
        success: true,
        message: `${service} API key is valid`
      });
    } else {
      return NextResponse.json({
        success: false,
        error: errorMessage
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Error testing API key:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to test API key'
    }, { status: 500 });
  }
}

// Test DeepL API
async function testDeepL(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch('https://api-free.deepl.com/v2/usage', {
      headers: {
        'Authorization': `DeepL-Auth-Key ${apiKey}`
      }
    });
    return response.ok;
  } catch (error) {
    console.error('DeepL test error:', error);
    return false;
  }
}

// Test Google Translate API
async function testGoogleTranslate(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch(
      `https://translation.googleapis.com/language/translate/v2/languages?key=${apiKey}`
    );
    return response.ok;
  } catch (error) {
    console.error('Google Translate test error:', error);
    return false;
  }
}

// Test OpenAI API
async function testOpenAI(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });
    return response.ok;
  } catch (error) {
    console.error('OpenAI test error:', error);
    return false;
  }
}

