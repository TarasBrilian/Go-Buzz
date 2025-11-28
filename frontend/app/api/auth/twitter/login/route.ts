import { NextRequest, NextResponse } from 'next/server';
import { TwitterApi } from 'twitter-api-v2';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
  try {
    const clientId = process.env.NEXT_PUBLIC_X_CLIENT_ID!;
    const callbackUrl = process.env.NEXT_PUBLIC_X_CALLBACK_URL || `${request.nextUrl.origin}/api/auth/twitter/callback`;

    if (!clientId) {
      return NextResponse.json(
        { error: 'Twitter Client ID not configured' },
        { status: 500 }
      );
    }

    // Generate code verifier and challenge for PKCE
    const codeVerifier = crypto.randomBytes(32).toString('base64url');
    const codeChallenge = crypto
      .createHash('sha256')
      .update(codeVerifier)
      .digest('base64url');

    // Generate state for CSRF protection
    const state = crypto.randomBytes(16).toString('hex');

    // Create Twitter OAuth2 client
    const client = new TwitterApi({ clientId });

    // Generate authorization URL
    const { url, codeVerifier: generatedCodeVerifier } = client.generateOAuth2AuthLink(
      callbackUrl,
      {
        scope: ['tweet.read', 'users.read', 'offline.access'],
        state,
      }
    );

    // Store state and code verifier in session/cookie
    // In production, use a proper session store
    const response = NextResponse.redirect(url);

    response.cookies.set('twitter_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
    });

    response.cookies.set('twitter_code_verifier', generatedCodeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
    });

    return response;
  } catch (error) {
    console.error('Twitter OAuth login error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate Twitter OAuth' },
      { status: 500 }
    );
  }
}
