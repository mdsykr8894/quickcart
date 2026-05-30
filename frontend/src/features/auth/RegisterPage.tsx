import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../app/useAuth';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { Lock } from 'lucide-react';

const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await register({
        username,
        email,
        firstName,
        lastName,
        password
      });
      alert('Registration successful! Please sign in with your new account.');
      navigate('/login');
    } catch (err: any) {
      setError(err?.message || 'Registration failed. Please verify your details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-[2rem] shadow-sm p-5 sm:p-8 lg:p-10 w-full space-y-6">
      <div className="space-y-1.5">
        <h2 className="text-2xl font-bold text-slate-950">Create your account</h2>
        <p className="text-sm text-slate-500">Join QuickCart and start placing demo orders.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200/50 text-red-700 text-xs font-semibold px-4 py-3 rounded-lg flex items-center space-x-2">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="First Name"
            placeholder="John"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            className="h-12 rounded-xl border-slate-200 focus-visible:ring-orange-500"
          />
          <Input
            label="Last Name"
            placeholder="Doe"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            className="h-12 rounded-xl border-slate-200 focus-visible:ring-orange-500"
          />
        </div>

        <Input
          label="Username"
          placeholder="john_doe"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          autoComplete="username"
          className="h-12 rounded-xl border-slate-200 focus-visible:ring-orange-500"
        />

        <Input
          label="Email Address"
          type="email"
          placeholder="john@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          className="h-12 rounded-xl border-slate-200 focus-visible:ring-orange-500"
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          helperText="Must be at least 8 characters with numbers & symbols."
          autoComplete="new-password"
          className="h-12 rounded-xl border-slate-200 focus-visible:ring-orange-500"
        />

        <Button type="submit" className="h-12 rounded-xl text-base w-full font-bold" isLoading={isSubmitting}>
          Create Account
        </Button>
      </form>

      <div className="pt-4 border-t border-slate-100 text-xs text-slate-500 flex justify-between items-center">
        <span>Already have an account?</span>
        <Link to="/login" className="font-bold text-orange-600 hover:underline">
          Sign In &rarr;
        </Link>
      </div>

      <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
        <Lock className="w-3.5 h-3.5 text-slate-300" />
        <span>Protected with HttpOnly cookies</span>
      </div>
    </div>
  );
};

export default RegisterPage;
