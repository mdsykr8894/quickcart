import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../app/useAuth';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { Lock } from 'lucide-react';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const passwordInputRef = useRef<HTMLInputElement>(null);
  
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const loggedInUser = await login({ usernameOrEmail, password });
      if (loggedInUser) {
        if (loggedInUser.role === 'ADMIN') {
          navigate('/admin');
        } else {
          navigate('/shop');
        }
      } else {
        setError('Login failed. Please inspect your credentials and try again.');
        setPassword('');
        passwordInputRef.current?.focus();
      }
    } catch (err: any) {
      const errorMessage = err?.message || err?.response?.data?.message || 'Login failed. Please inspect your credentials and try again.';
      setError(errorMessage);
      setPassword('');
      passwordInputRef.current?.focus();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-[2rem] shadow-sm p-5 sm:p-8 lg:p-10 w-full space-y-6">
      <div className="space-y-1.5">
        <h2 className="text-2xl font-bold text-slate-950">Welcome back</h2>
        <p className="text-sm text-slate-500">Sign in to continue shopping securely.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200/50 text-red-700 text-xs font-semibold px-4 py-3 rounded-lg flex items-center space-x-2">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Username or Email"
          placeholder="user"
          value={usernameOrEmail}
          onChange={(e) => setUsernameOrEmail(e.target.value)}
          required
          autoComplete="username"
          className="h-12 rounded-xl border-slate-200 focus-visible:ring-orange-500"
        />

        <Input
          label="Password"
          type="password"
          ref={passwordInputRef}
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          className="h-12 rounded-xl border-slate-200 focus-visible:ring-orange-500"
        />

        <Button type="submit" className="h-12 rounded-xl text-base w-full font-bold" isLoading={isSubmitting}>
          Sign In
        </Button>
      </form>

      <div className="pt-4 border-t border-slate-100 text-xs text-slate-500 flex justify-between items-center">
        <span>Don't have an account?</span>
        <Link to="/register" className="font-bold text-orange-600 hover:underline">
          Create Account &rarr;
        </Link>
      </div>

      <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
        <Lock className="w-3.5 h-3.5 text-slate-300" />
        <span>Protected with HttpOnly cookies</span>
      </div>
    </div>
  );
};

export default LoginPage;
