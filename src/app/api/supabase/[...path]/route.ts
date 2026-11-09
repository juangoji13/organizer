import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_TARGET = process.env.INTERNAL_SUPABASE_URL || 'http://149.130.186.213:8000';

async function handleProxy(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  try {
    const { path } = await params;
    const pathStr = (path || []).join('/');
    const search = request.nextUrl.search;
    const targetUrl = `${SUPABASE_TARGET}/${pathStr}${search}`;

    const headers = new Headers();
    request.headers.forEach((value, key) => {
      // Exclude host and connection headers
      if (!['host', 'connection', 'content-length'].includes(key.toLowerCase())) {
        headers.set(key, value);
      }
    });

    const body = ['GET', 'HEAD'].includes(request.method) ? undefined : await request.arrayBuffer();

    const response = await fetch(targetUrl, {
      method: request.method,
      headers,
      body,
      // Avoid caching dynamic DB requests
      cache: 'no-store',
    });

    const responseHeaders = new Headers();
    response.headers.forEach((value, key) => {
      responseHeaders.set(key, value);
    });

    // Ensure CORS headers are present
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    responseHeaders.set('Access-Control-Allow-Headers', '*');

    const responseData = await response.arrayBuffer();

    return new NextResponse(responseData, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('Supabase Proxy Error:', error);
    return NextResponse.json(
      { error: 'Failed to proxy request to Supabase', details: String(error) },
      { status: 502 }
    );
  }
}

export const GET = handleProxy;
export const POST = handleProxy;
export const PUT = handleProxy;
export const PATCH = handleProxy;
export const DELETE = handleProxy;
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': '*',
    },
  });
}
