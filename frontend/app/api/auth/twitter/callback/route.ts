import { NextRequest, NextResponse } from 'next/server';
import { TwitterApi } from 'twitter-api-v2';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      return NextResponse.redirect(
        new URL(`/app?error=${encodeURIComponent(error)}`, request.url)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL('/app?error=missing_code', request.url)
      );
    }

    // Verify state to prevent CSRF attacks
    // In production, you should store the state in a session and verify it here

    const clientId = process.env.NEXT_PUBLIC_X_CLIENT_ID!;
    const clientSecret = process.env.X_CLIENT_SECRET!;
    const callbackUrl = process.env.NEXT_PUBLIC_X_CALLBACK_URL || `${request.nextUrl.origin}/api/auth/twitter/callback`;

    // Exchange code for access token
    const client = new TwitterApi({
      clientId,
      clientSecret,
    });

    const { accessToken, refreshToken, expiresIn } = await client.loginWithOAuth2({
      code,
      codeVerifier: 'challenge', // In production, retrieve this from session
      redirectUri: callbackUrl,
    });

    // Create authenticated client
    const authenticatedClient = new TwitterApi(accessToken);

    // Get user info
    const { data: userObject } = await authenticatedClient.v2.me({
      'user.fields': ['profile_image_url', 'username', 'name', 'id'],
    });

    // Store tokens and user info in session/cookie
    // For now, we'll redirect with user info as query params (not recommended for production)
    const response = NextResponse.redirect(
      new URL(
        `/app?twitter_connected=true&twitter_user=${encodeURIComponent(userObject.username)}&twitter_name=${encodeURIComponent(userObject.name)}`,
        request.url
      )
    );

    // Store tokens in httpOnly cookies for security
    response.cookies.set('twitter_access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: expiresIn || 7200, // 2 hours default
    });

    if (refreshToken) {
      response.cookies.set('twitter_refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }

    // Store user info
    response.cookies.set('twitter_user', JSON.stringify(userObject), {
      httpOnly: false, // Allow client-side access for display
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Twitter OAuth callback error:', error);
    return NextResponse.redirect(
      new URL(`/app?error=oauth_failed`, request.url)
    );
  }
}
