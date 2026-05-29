'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import type { Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { UserProfile } from '@bakersgo/types';

const fieldCls =
  'w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#A0813A] focus:border-[#A0813A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

const profileSchema = z.object({
  userId: z
    .string()
    .min(3, 'Username minimal 3 karakter')
    .max(30, 'Username maksimal 30 karakter')
    .regex(/^[a-zA-Z0-9_]+$/, 'Hanya boleh huruf, angka, dan underscore'),
  brandName: z.string().min(1, 'Nama toko wajib diisi'),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Password saat ini wajib diisi'),
    newPassword: z.string().min(8, 'Password baru minimal 8 karakter'),
    confirmPassword: z.string().min(1, 'Konfirmasi password wajib diisi'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Password baru tidak cocok',
    path: ['confirmPassword'],
  });

type ProfileValues = z.infer<typeof profileSchema>;
type PasswordValues = z.infer<typeof passwordSchema>;

function ProfileCard({ user, onUpdated }: { user: UserProfile; onUpdated: (u: UserProfile) => void }) {
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema) as Resolver<ProfileValues>,
    defaultValues: { userId: user.userId, brandName: user.brandName },
  });

  async function onSubmit(values: ProfileValues) {
    setServerError('');
    setSuccess(false);
    const res = await fetch('/api/auth/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setServerError(body.message ?? 'Gagal menyimpan perubahan');
      return;
    }
    const updated: UserProfile = await res.json();
    onUpdated(updated);
    setSuccess(true);
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#A0813A] text-white text-xl font-bold">
          {user.brandName.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="text-base font-semibold text-foreground">Informasi Profil</h2>
          <p className="text-xs text-muted-foreground">Perbarui nama dan nama toko Anda</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email — read only */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Email
            <span className="ml-2 text-xs font-normal text-muted-foreground">(tidak dapat diubah)</span>
          </label>
          <input value={user.email} disabled className={fieldCls} />
        </div>

        {/* Username */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Username</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground select-none">@</span>
            <input
              {...register('userId')}
              className={`${fieldCls} pl-7`}
              placeholder="username"
              autoComplete="username"
            />
          </div>
          {errors.userId && <p className="mt-1 text-xs text-destructive">{errors.userId.message}</p>}
        </div>

        {/* Brand name */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Nama Toko</label>
          <input
            {...register('brandName')}
            className={fieldCls}
            placeholder="Nama toko Anda"
          />
          {errors.brandName && <p className="mt-1 text-xs text-destructive">{errors.brandName.message}</p>}
        </div>

        {serverError && (
          <p className="text-sm text-destructive">{serverError}</p>
        )}
        {success && (
          <p className="text-sm text-green-600">Profil berhasil diperbarui.</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting || !isDirty}
          className="rounded-xl bg-[#A0813A] px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </form>
    </div>
  );
}

function PasswordCard() {
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema) as Resolver<PasswordValues>,
  });

  async function onSubmit(values: PasswordValues) {
    setServerError('');
    setSuccess(false);
    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setServerError(body.message ?? 'Gagal mengganti password');
      return;
    }
    setSuccess(true);
    reset();
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
      <div>
        <h2 className="text-base font-semibold text-foreground">Ganti Password</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Password baru minimal 8 karakter</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Password Saat Ini</label>
          <input
            type="password"
            {...register('currentPassword')}
            className={fieldCls}
            autoComplete="current-password"
          />
          {errors.currentPassword && <p className="mt-1 text-xs text-destructive">{errors.currentPassword.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Password Baru</label>
          <input
            type="password"
            {...register('newPassword')}
            className={fieldCls}
            autoComplete="new-password"
          />
          {errors.newPassword && <p className="mt-1 text-xs text-destructive">{errors.newPassword.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Konfirmasi Password Baru</label>
          <input
            type="password"
            {...register('confirmPassword')}
            className={fieldCls}
            autoComplete="new-password"
          />
          {errors.confirmPassword && <p className="mt-1 text-xs text-destructive">{errors.confirmPassword.message}</p>}
        </div>

        {serverError && (
          <p className="text-sm text-destructive">{serverError}</p>
        )}
        {success && (
          <p className="text-sm text-green-600">Password berhasil diubah.</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl bg-[#A0813A] px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? 'Menyimpan...' : 'Ganti Password'}
        </button>
      </form>
    </div>
  );
}

export function SettingsForm() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { setUser(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {[0, 1].map((i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-6 animate-pulse h-48" />
        ))}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
        Gagal memuat profil. Pastikan Anda sudah login.
      </div>
    );
  }

  return (
    <div className="max-w-lg space-y-6">
      <ProfileCard user={user} onUpdated={setUser} />
      <PasswordCard />
    </div>
  );
}
