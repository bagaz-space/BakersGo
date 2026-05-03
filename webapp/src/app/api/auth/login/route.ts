import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/lib/api';
import { setToken } from '@/lib/auth';
import type { AuthResponse, LoginRequest } from '@bakersgo/types';

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();
    const data = await api.post<AuthResponse>('/auth/login', body);
    await setToken(data.token);
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Login gagal';
    const status = (err as { status?: number }).status ?? 500;
    return NextResponse.json({ message }, { status });
  }
}
