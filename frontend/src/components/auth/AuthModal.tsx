import { useState } from 'react';
import type { FormEvent } from 'react';
import { LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AuthModal() {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isRegister) {
      if (!name.trim()) return setError('Name is required');
      if (!email.trim()) return setError('Email is required');
      if (password.length < 6) return setError('Password must be at least 6 characters');
    } else {
      if (!email.trim() || !password) return setError('Email and password are required');
    }

    setIsSubmitting(true);
    try {
      if (isRegister) {
        await register({ name: name.trim(), email: email.trim(), password });
      } else {
        await login({ email: email.trim(), password });
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Authentication failed';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto mt-10 max-w-md animate-slide-in px-4">
      <div className="card bg-white p-6 sm:p-8">
        <header className="mb-6 text-center">
          <h1 className="text-2xl font-black tracking-tight text-black">
            {isRegister ? 'Create an account' : 'Welcome back'}
          </h1>
          <p className="mt-1 font-mono text-xs text-neutral-600">
            {isRegister
              ? 'Sign up to start creating and organizing tasks'
              : 'Log in with your credentials to access your boards'}
          </p>
        </header>

        {error && (
          <div role="alert" className="mb-4 border-l-4 border-black bg-neutral-100 p-2.5 font-mono text-xs text-black">
            ✕ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {isRegister && (
            <div>
              <label htmlFor="auth-name" className="label mb-3 block">
                Your Name
              </label>
              <input
                id="auth-name"
                type="text"
                required
                autoFocus
                placeholder="Alex Mercer"
                maxLength={60}
                className="input text-sm"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          <div>
            <label htmlFor="auth-email" className="label mb-3 block">
              Email Address
            </label>
            <input
              id="auth-email"
              type="email"
              required
              autoFocus={!isRegister}
              placeholder="alex@example.com"
              maxLength={120}
              className="input text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="auth-password" className="label mb-3 block">
              Password
            </label>
            <input
              id="auth-password"
              type="password"
              required
              placeholder={isRegister ? 'At least 6 characters' : '••••••••'}
              minLength={6}
              maxLength={100}
              className="input text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn mt-3 w-full"
          >
            {isRegister ? (
              <>
                <UserPlus size={16} aria-hidden="true" />
                {isSubmitting ? 'Creating account…' : 'Create account'}
              </>
            ) : (
              <>
                <LogIn size={16} aria-hidden="true" />
                {isSubmitting ? 'Logging in…' : 'Log in'}
              </>
            )}
          </button>
        </form>

        <footer className="mt-6 border-t-2 border-neutral-200 pt-4 text-center">
          <p className="text-xs text-neutral-600">
            {isRegister ? 'Already have an account?' : "Don't have an account yet?"}{' '}
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError(null);
              }}
              className="font-bold text-black underline underline-offset-2 hover:text-neutral-700"
            >
              {isRegister ? 'Log in' : 'Sign up'}
            </button>
          </p>
        </footer>
      </div>
    </div>
  );
}
