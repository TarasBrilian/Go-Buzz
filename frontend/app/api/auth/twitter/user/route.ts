import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const twitterUser = cookieStore.get('twitter_user');

    if (!twitterUser) {
      return NextResponse.json(
        { authenticated: false, user: null },
        { status: 200 }
      );
    }

    const user = JSON.parse(twitterUser.value);

    return NextResponse.json(
      { authenticated: true, user },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching Twitter user:', error);
    return NextResponse.json(
      { authenticated: false, user: null },
      { status: 200 }
    );
  }
}
