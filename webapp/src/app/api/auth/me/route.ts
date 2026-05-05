import { NextResponse } from 'next/server';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';
import type { UserProfile } from '@bakersgo/types';

export async function GET() {
  try {
    const token = await getToken();
    if (!token) return NextResponse.json(null, { status: 401 });
    const user = await api.get<UserProfile>('/auth/profile', token);
    return NextResponse.json(user);
  } catch {
    return NextResponse.json(null, { status: 401 });
  }
}
