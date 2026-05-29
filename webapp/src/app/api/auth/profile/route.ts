import { NextResponse } from 'next/server';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';
import type { UpdateProfileRequest, UserProfile } from '@bakersgo/types';

export async function PATCH(request: Request) {
  try {
    const token = await getToken();
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const body: UpdateProfileRequest = await request.json();
    const user = await api.patch<UserProfile>('/auth/profile', body, token);
    return NextResponse.json(user);
  } catch (err: unknown) {
    const status = (err as { status?: number }).status ?? 500;
    const message = (err as Error).message ?? 'Terjadi kesalahan';
    return NextResponse.json({ message }, { status });
  }
}
