import React, { useState } from 'react';
import { AuthLayout } from '../components/templates/AuthLayout';
import { LoginForm } from '../components/organisms/LoginForm';
import { RegisterForm } from '../components/organisms/RegisterForm';

interface AuthPageProps {
  onAuthenticated: () => void;
}

export function AuthPage({ onAuthenticated }: AuthPageProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');

  return (
    <AuthLayout
      title={mode === 'login' ? 'Welcome back' : 'Create account'}
      subtitle={
        mode === 'login'
          ? 'Sign in to access the parking system'
          : 'Register as a monthly subscriber'
      }
    >
      {mode === 'login' ? (
        <LoginForm
          onSuccess={onAuthenticated}
          onRegisterClick={() => setMode('register')}
        />
      ) : (
        <RegisterForm
          onSuccess={onAuthenticated}
          onLoginClick={() => setMode('login')}
        />
      )}
    </AuthLayout>
  );
}