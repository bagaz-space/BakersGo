import { NextResponse } from 'next/server';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';
import type { ChangePasswordRequest } from '@bakersgo/types';

export async function POST(request: Request) {
  try {
    const token = await getToken();
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const body: ChangePasswordRequest = await request.json();
    await api.post<void>('/auth/change-password', body, token);
    return new NextResponse(null, { status: 204 });
  } catch (err: unknown) {
    const status = (err as { status?: number }).status ?? 500;
    const message = (err as Error).message ?? 'Terjadi kesalahan';
    return NextResponse.json({ message }, { status });
  }
}
