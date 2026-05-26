'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';

const schema = z.object({
  email: z.string().email('Email tidak valid'),
  userId: z.string().min(3, 'Username minimal 3 karakter'),
  brandName: z.string().min(2, 'Nama usaha minimal 2 karakter'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});
type FormValues = z.infer<typeof schema>;

export function RegisterForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setServerError(null);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const data = await res.json();
        setServerError(data.message ?? 'Pendaftaran gagal');
        return;
      }
      router.push('/dashboard');
      router.refresh();
    } catch {
      setServerError('Terjadi kesalahan. Coba lagi.');
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          {...register('email')}
          className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="contoh@email.com"
        />
        {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="userId" className="block text-sm font-medium text-foreground mb-1.5">
          Username
        </label>
        <input
          id="userId"
          type="text"
          {...register('userId')}
          className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="username_kamu"
        />
        {errors.userId && <p className="mt-1 text-xs text-destructive">{errors.userId.message}</p>}
      </div>

      <div>
        <label htmlFor="brandName" className="block text-sm font-medium text-foreground mb-1.5">
          Nama Usaha
        </label>
        <input
          id="brandName"
          type="text"
          {...register('brandName')}
          className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Toko Kue Bu Ani"
        />
        {errors.brandName && <p className="mt-1 text-xs text-destructive">{errors.brandName.message}</p>}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          {...register('password')}
          className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="••••••"
        />
        {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>}
      </div>

      {serverError && (
        <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
      >
        {isSubmitting && (
          <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {isSubmitting ? 'Mendaftar...' : 'Daftar Sekarang'}
      </button>

      <p className="text-center text-sm text-muted-foreground">
        Sudah punya akun?{' '}
        <Link href="/login" className="text-primary font-medium hover:underline">
          Masuk
        </Link>
      </p>
    </form>
  );
}
