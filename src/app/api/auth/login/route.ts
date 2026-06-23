import { NextRequest, NextResponse } from 'next/server';
import users from '../../../../lib/users.json';
import { signToken, setAuthCookie } from '../../../../lib/auth';
import { LoginRequest } from '../../../../lib/types';

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { message: 'Username and password required' },
        { status: 400 }
      );
    }

    // Check if user exists and password matches
    const userRecord = users as Record<string, { password: string; type: string; company_id?: string | null }>;
    if (userRecord[username] && userRecord[username].password === password) {
      const { type, company_id } = userRecord[username];
      const token = signToken({ username, type, company_id: company_id ?? null });
      const response = NextResponse.json({
        message: 'Login successful',
        user: { username, type, company_id: company_id ?? null }
      });
      
      setAuthCookie(response.headers, token);
      return response;
    }

    return NextResponse.json(
      { message: 'Invalid credentials' },
      { status: 401 }
    );
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}