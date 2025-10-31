import { NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';

// Encryption key - in production, this should be from env
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-32-character-encryption-key-here-change-this!!';
const ALGORITHM = 'aes-256-cbc';

// Encrypt function
function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.slice(0, 32)), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

// Decrypt function
function decrypt(text: string): string {
  try {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift()!, 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.slice(0, 32)), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (error) {
    return text; // Return original if decryption fails (backwards compatibility)
  }
}

// GET - Fetch all API keys
export async function GET() {
  try {
    console.log('[API Keys GET] Starting fetch...');
    let settings;
    
    try {
      settings = await prisma.apiKeySettings.findFirst();
      console.log('[API Keys GET] Settings found:', !!settings);
    } catch (dbError: any) {
      // Table might not exist yet, return empty
      console.log('[API Keys GET] Database error:', dbError.message);
      return NextResponse.json({
        success: true,
        data: {}
      });
    }
    
    if (!settings) {
      console.log('[API Keys GET] No settings, returning empty');
      return NextResponse.json({
        success: true,
        data: {}
      });
    }

    // Decrypt keys before sending
    const decryptedKeys: Record<string, string> = {};
    if (settings.keys) {
      try {
        const keys = typeof settings.keys === 'string' ? JSON.parse(settings.keys) : settings.keys;
        for (const [service, encryptedKey] of Object.entries(keys)) {
          if (typeof encryptedKey === 'string') {
            try {
              decryptedKeys[service] = decrypt(encryptedKey);
            } catch (decryptError) {
              console.error(`[API Keys GET] Failed to decrypt ${service}:`, decryptError);
              decryptedKeys[service] = ''; // Return empty if can't decrypt
            }
          }
        }
      } catch (parseError) {
        console.error('[API Keys GET] Failed to parse keys:', parseError);
      }
    }

    console.log('[API Keys GET] Success, returning', Object.keys(decryptedKeys).length, 'keys');
    return NextResponse.json({
      success: true,
      data: decryptedKeys
    });
  } catch (error: any) {
    console.error('[API Keys GET] Fatal error:', error);
    return NextResponse.json({
      success: false,
      error: error?.message || 'Failed to fetch API keys'
    }, { status: 500 });
  }
}

// POST - Save API keys
export async function POST(request: Request) {
  try {
    console.log('[API Keys POST] Starting save...');
    
    const body = await request.json();
    const { apiKeys } = body;

    console.log('[API Keys POST] Received keys for services:', Object.keys(apiKeys || {}));

    if (!apiKeys || typeof apiKeys !== 'object') {
      console.log('[API Keys POST] Invalid format');
      return NextResponse.json({
        success: false,
        error: 'Invalid API keys format'
      }, { status: 400 });
    }

    // Encrypt keys before saving
    const encryptedKeys: Record<string, string> = {};
    for (const [service, key] of Object.entries(apiKeys)) {
      if (key && typeof key === 'string' && key.trim() !== '') {
        try {
          encryptedKeys[service] = encrypt(key);
          console.log(`[API Keys POST] Encrypted ${service}`);
        } catch (encryptError) {
          console.error(`[API Keys POST] Failed to encrypt ${service}:`, encryptError);
        }
      }
    }

    console.log('[API Keys POST] Total encrypted:', Object.keys(encryptedKeys).length);

    try {
      // Upsert settings
      const existingSettings = await prisma.apiKeySettings.findFirst();
      console.log('[API Keys POST] Existing settings found:', !!existingSettings);

      if (existingSettings) {
        console.log('[API Keys POST] Updating existing settings...');
        await prisma.apiKeySettings.update({
          where: { id: existingSettings.id },
          data: {
            keys: JSON.stringify(encryptedKeys),
            updatedAt: new Date()
          }
        });
        console.log('[API Keys POST] Update successful');
      } else {
        console.log('[API Keys POST] Creating new settings...');
        await prisma.apiKeySettings.create({
          data: {
            keys: JSON.stringify(encryptedKeys)
          }
        });
        console.log('[API Keys POST] Create successful');
      }

      return NextResponse.json({
        success: true,
        message: 'API keys saved successfully'
      });
    } catch (dbError: any) {
      console.error('[API Keys POST] Database error:', dbError);
      return NextResponse.json({
        success: false,
        error: `Database error: ${dbError.message}`
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('[API Keys POST] Fatal error:', error);
    return NextResponse.json({
      success: false,
      error: error?.message || 'Failed to save API keys'
    }, { status: 500 });
  }
}

