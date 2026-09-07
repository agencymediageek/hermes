'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import AppLogo from '@/components/ui/AppLogo';
import {
  Eye,
  EyeOff,
  Shield,
  GitBranch,
  Cloud,
  Cpu,
  Loader2,
  Copy,
  Check,
  ArrowRight,
  Lock,
  Zap,
} from 'lucide-react';

interface LoginFormData {
  email: string;
  password: string;
  remember: boolean;
}

const DEMO_CREDENTIALS = {
  email: 'rafael@hermesdev.io',
  password: 'Herm3s#Eng!ne',
};

const MOCK_VALID_EMAIL = 'rafael@hermesdev.io';
const MOCK_VALID_PASSWORD = 'Herm3s#Eng!ne';

export default function LoginPageClient() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>({
    defaultValues: { email: '', password: '', remember: false },
  });

  const handleCopy = async (field: 'email' | 'password') => {
    const value = field === 'email' ? DEMO_CREDENTIALS.email : DEMO_CREDENTIALS.password;
    await navigator.clipboard.writeText(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleAutofill = () => {
    setValue('email', DEMO_CREDENTIALS.email);
    setValue('password', DEMO_CREDENTIALS.password);
  };

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    // BACKEND INTEGRATION: POST /api/auth/login with { email, password }
    await new Promise((res) => setTimeout(res, 1400));
    if (data.email === MOCK_VALID_EMAIL && data.password === MOCK_VALID_PASSWORD) {
      toast.success('Authenticated — welcome back, Rafael.');
      router.push('/projects-dashboard');
    } else {
      setIsLoading(false);
      setError('root', {
        message: 'Invalid credentials — use the demo accounts below to sign in',
      });
    }
    setIsLoading(false);
  };

  const handleCloudflareSso = () => {
    // BACKEND INTEGRATION: Redirect to Cloudflare Access SSO endpoint
    toast.info('Redirecting to Cloudflare Access…');
  };

  const infraBadges = [
    { id: 'badge-github', icon: <GitBranch size={13} />, label: 'GitHub' },
    { id: 'badge-cloudflare', icon: <Cloud size={13} />, label: 'Cloudflare' },
    { id: 'badge-docker', icon: <Cpu size={13} />, label: 'Docker' },
    { id: 'badge-n8n', icon: <Zap size={13} />, label: 'n8n' },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-[52%] xl:w-[55%] relative flex-col justify-between p-12 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0D0D1A] via-[#0A0A0F] to-[#0A0A0F]" />
        <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(ellipse 60% 50% at 30% 40%, rgba(124,58,237,0.25) 0%, transparent 70%)' }} />
        <div className="absolute inset-0 opacity-20" style={{ background: 'radial-gradient(ellipse 40% 40% at 70% 70%, rgba(6,182,212,0.2) 0%, transparent 70%)' }} />

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <AppLogo size={40} />
            <span className="text-xl font-semibold tracking-tight text-foreground">Hermes</span>
          </div>

          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-4">Private Engineering Platform</p>
            <h1 className="text-hero mb-5 text-foreground">
              Your AI<br />
              <span className="gradient-text">engineering cockpit.</span>
            </h1>
            <p className="text-base text-muted-foreground leading-relaxed max-w-md">
              Manage workspaces, run AI agents, review code, and deploy — all connected to your own infrastructure. Dev isolated from prod, always.
            </p>
          </div>

          {/* Feature highlights */}
          <div className="space-y-3 mb-10">
            {[
              { id: 'feat-ws', icon: <Cpu size={15} />, text: 'Isolated Docker workspaces per project' },
              { id: 'feat-agent', icon: <Zap size={15} />, text: 'Persistent AI agents via OpenRouter' },
              { id: 'feat-gate', icon: <Shield size={15} />, text: 'Approval gate for merges & deploys' },
              { id: 'feat-preview', icon: <Cloud size={15} />, text: 'Preview URLs via Cloudflare Tunnel' },
            ].map((feat) => (
              <div key={feat.id} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                  {feat.icon}
                </div>
                <span className="text-sm text-muted-foreground">{feat.text}</span>
              </div>
            ))}
          </div>

          {/* Infrastructure badges */}
          <div className="flex flex-wrap gap-2">
            {infraBadges.map((badge) => (
              <span
                key={badge.id}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-secondary/60 border border-border rounded-full text-xs text-muted-foreground"
              >
                {badge.icon}
                {badge.label}
              </span>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 border border-primary/20 rounded-lg w-fit">
            <Shield size={13} className="text-primary" />
            <span className="text-xs text-primary font-medium">Protected by Cloudflare Access</span>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 bg-background relative">
        <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'radial-gradient(circle, var(--foreground) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

        <div className="relative z-10 w-full max-w-[400px]">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <AppLogo size={32} />
            <span className="font-semibold text-lg tracking-tight">Hermes</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-1">Sign in</h2>
            <p className="text-sm text-muted-foreground">Internal tool — access restricted to team members</p>
          </div>

          {/* Cloudflare SSO */}
          <button
            onClick={handleCloudflareSso}
            className="btn-secondary w-full mb-6"
          >
            <Cloud size={16} className="text-accent" />
            Continue with Cloudflare Access
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">or sign in with credentials</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {/* Root error */}
            {errors.root && (
              <div className="flex items-start gap-2 px-3 py-3 bg-danger/10 border border-danger/30 rounded-lg fade-in">
                <Lock size={14} className="text-danger mt-0.5 shrink-0" />
                <p className="text-xs text-danger leading-relaxed">{errors.root.message}</p>
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@hermesdev.io"
                className="input-base w-full px-3 py-2.5 text-sm"
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address' },
                })}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-danger">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  className="input-base w-full px-3 py-2.5 text-sm pr-10"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 8, message: 'Password must be at least 8 characters' },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-danger">{errors.password.message}</p>
              )}
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2">
              <input
                id="remember"
                type="checkbox"
                className="w-4 h-4 rounded border-border bg-input accent-primary cursor-pointer"
                {...register('remember')}
              />
              <label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                Keep me signed in for 30 days
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full mt-2"
              style={{ minHeight: 42 }}
            >
              {isLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  Sign in to Hermes
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Demo credentials box */}
          <div className="mt-6 p-4 bg-secondary/40 border border-border rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Demo Credentials</p>
              <button
                onClick={handleAutofill}
                className="text-xs text-primary hover:text-primary/80 transition-colors font-medium flex items-center gap-1"
              >
                <ArrowRight size={11} />
                Autofill
              </button>
            </div>
            <div className="space-y-2">
              {/* Email row */}
              <div className="flex items-center justify-between gap-2 px-3 py-2 bg-background/60 rounded border border-border">
                <div className="min-w-0">
                  <p className="text-2xs text-muted-foreground mb-0.5">Email</p>
                  <p className="text-xs font-mono text-foreground truncate">{DEMO_CREDENTIALS.email}</p>
                </div>
                <button
                  onClick={() => handleCopy('email')}
                  className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                  aria-label="Copy email"
                >
                  {copiedField === 'email' ? <Check size={13} className="text-success" /> : <Copy size={13} />}
                </button>
              </div>
              {/* Password row */}
              <div className="flex items-center justify-between gap-2 px-3 py-2 bg-background/60 rounded border border-border">
                <div className="min-w-0">
                  <p className="text-2xs text-muted-foreground mb-0.5">Password</p>
                  <p className="text-xs font-mono text-foreground truncate">{DEMO_CREDENTIALS.password}</p>
                </div>
                <button
                  onClick={() => handleCopy('password')}
                  className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                  aria-label="Copy password"
                >
                  {copiedField === 'password' ? <Check size={13} className="text-success" /> : <Copy size={13} />}
                </button>
              </div>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Access issues? Contact{' '}
            <a href="mailto:ops@hermesdev.io" className="text-primary hover:underline">
              ops@hermesdev.io
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}