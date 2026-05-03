import { RegisterForm } from '@/components/auth/register-form';

export const metadata = { title: 'Daftar — BakersGo' };

export default function RegisterPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-xl bg-primary flex items-center justify-center">
            <span className="text-white font-bold text-xl">B</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">BakersGo</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Buat akun baru
          </p>
        </div>
        <RegisterForm />
      </div>
    </main>
  );
}
