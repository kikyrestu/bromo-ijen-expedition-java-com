import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const configPath = path.join(process.cwd(), 'src', 'config', 'routing.json');
    
    if (!fs.existsSync(configPath)) {
      return NextResponse.json({ enableMultiLanguage: true });
    }
    
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    return NextResponse.json(config);
  } catch (error) {
    return NextResponse.json({ enableMultiLanguage: true });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const configPath = path.join(process.cwd(), 'src', 'config', 'routing.json');
    
    // Ensure directory exists
    const dir = path.dirname(configPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(configPath, JSON.stringify(body, null, 2));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving routing settings:', error);
    return NextResponse.json({ success: false, error: 'Failed to save settings' }, { status: 500 });
  }
}
