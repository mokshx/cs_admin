import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '../../../lib/auth';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  
  if (!token) {
    return NextResponse.json(
      { message: 'No token provided' },
      { status: 401 }
    );
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return NextResponse.json(
      { message: 'Invalid token' },
      { status: 401 }
    );
  }

  return NextResponse.json({ user: { username: decoded.username, type: decoded.type, company_id: decoded.company_id ?? null } });
}
