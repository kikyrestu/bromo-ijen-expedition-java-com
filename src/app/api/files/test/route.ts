import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    message: 'Files API is working!',
    url: request.url,
    pathname: new URL(request.url).pathname
  });
}
