import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json(
      { success: true, message: 'Logged out successfully' },
      { status: 200 }
    );

    // Clear all Twitter-related cookies
    response.cookies.delete('twitter_access_token');
    response.cookies.delete('twitter_refresh_token');
    response.cookies.delete('twitter_user');
    response.cookies.delete('twitter_oauth_state');
    response.cookies.delete('twitter_code_verifier');

    return response;
  } catch (error) {
    console.error('Twitter logout error:', error);
    return NextResponse.json(
      { success: false, error: 'Logout failed' },
      { status: 500 }
    );
  }
}
