import { NextRequest, NextResponse } from 'next/server';
import { TwitterApi } from 'twitter-api-v2';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      return NextResponse.redirect(
        new URL(`/app/dashboard?error=${encodeURIComponent(error)}`, request.url)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL('/app/dashboard?error=missing_code', request.url)
      );
    }

    // Get cookies
    const cookieStore = await cookies();
    const storedState = cookieStore.get('twitter_oauth_state')?.value;
    const codeVerifier = cookieStore.get('twitter_code_verifier')?.value;

    // Verify state to prevent CSRF attacks
    if (!storedState || storedState !== state) {
      console.error('State mismatch:', { storedState, receivedState: state });
      return NextResponse.redirect(
        new URL('/app/dashboard?error=invalid_state', request.url)
      );
    }

    if (!codeVerifier) {
      console.error('Code verifier not found in cookies');
      return NextResponse.redirect(
        new URL('/app/dashboard?error=missing_verifier', request.url)
      );
    }

    const clientId = process.env.NEXT_PUBLIC_X_CLIENT_ID!;
    const clientSecret = process.env.X_CLIENT_SECRET!;
    const callbackUrl = process.env.NEXT_PUBLIC_X_CALLBACK_URL || `${request.nextUrl.origin}/api/auth/twitter/callback`;

    console.log('OAuth Callback - exchanging code for token...');

    // Exchange code for access token
    const client = new TwitterApi({
      clientId,
      clientSecret,
    });

    const { accessToken, refreshToken, expiresIn } = await client.loginWithOAuth2({
      code,
      codeVerifier,
      redirectUri: callbackUrl,
    });

    console.log('Access token received, fetching user info...');

    // Create authenticated client
    const authenticatedClient = new TwitterApi(accessToken);

    // Get user info
    const { data: userObject } = await authenticatedClient.v2.me({
      'user.fields': ['profile_image_url', 'username', 'name', 'id'],
    });

    console.log('User info retrieved:', userObject.username);

    // Redirect to dashboard
    const response = NextResponse.redirect(
      new URL('/app/dashboard?twitter_connected=true', request.url)
    );

    // Store tokens in httpOnly cookies for security
    response.cookies.set('twitter_access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: expiresIn || 7200, // 2 hours default
      path: '/',
    });

    if (refreshToken) {
      response.cookies.set('twitter_refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
      });
    }

    // Store user info
    response.cookies.set('twitter_user', JSON.stringify(userObject), {
      httpOnly: false, // Allow client-side access for display
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    // Clear OAuth temporary cookies
    response.cookies.delete('twitter_oauth_state');
    response.cookies.delete('twitter_code_verifier');

    return response;
  } catch (error) {
    console.error('Twitter OAuth callback error:', error);
    return NextResponse.redirect(
      new URL(`/app/dashboard?error=oauth_failed&details=${encodeURIComponent(error instanceof Error ? error.message : 'Unknown error')}`, request.url)
    );
  }
}
