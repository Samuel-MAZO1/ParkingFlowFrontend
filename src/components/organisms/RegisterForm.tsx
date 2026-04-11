import React, { useState } from 'react';
import { RegisterRequest } from '../../types';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';
import { AlertMessage } from '../molecules/AlertMessage';
import { authService } from '../../services/api';
import { useAuth } from '../../store/authStore';

interface RegisterFormProps {
  onSuccess?: () => void;
  onLoginClick: () => void;
}

type FormErrors = Partial<Record<keyof RegisterRequest, string>>;

function validate(data: RegisterRequest): FormErrors {
  const errors: FormErrors = {};
  if (!data.nombre.trim()) errors.nombre = 'Required';
  if (!data.apellido.trim()) errors.apellido = 'Required';
  if (!data.documento.trim()) errors.documento = 'Required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = 'Invalid email';
  if (!/^\d{7,10}$/.test(data.telefono)) errors.telefono = 'Must be 7-10 digits';
  if (data.password.length < 8) errors.password = 'At least 8 characters';
  return errors;
}

export function RegisterForm({ onSuccess, onLoginClick }: RegisterFormProps) {
  const { login } = useAuth();
  const [form, setForm] = useState<RegisterRequest>({
    nombre: '', apellido: '', documento: '', email: '', telefono: '', password: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(field: keyof RegisterRequest) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    setServerError('');
    try {
      const tokens = await authService.register(form);
      login(tokens);
      onSuccess?.();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {serverError && <AlertMessage message={serverError} />}

      <div className="grid grid-cols-2 gap-4">
        <Input label="First Name" value={form.nombre} onChange={handleChange('nombre')}
          error={errors.nombre} placeholder="John" autoComplete="given-name" />
        <Input label="Last Name" value={form.apellido} onChange={handleChange('apellido')}
          error={errors.apellido} placeholder="Doe" autoComplete="family-name" />
      </div>

      <Input label="ID / Document" value={form.documento} onChange={handleChange('documento')}
        error={errors.documento} placeholder="1234567890" />

      <Input label="Email" type="email" value={form.email} onChange={handleChange('email')}
        error={errors.email} placeholder="you@example.com" autoComplete="email" />

      <Input label="Phone" type="tel" value={form.telefono} onChange={handleChange('telefono')}
        error={errors.telefono} placeholder="3001234567" autoComplete="tel" />

      <Input label="Password" type="password" value={form.password} onChange={handleChange('password')}
        error={errors.password} placeholder="••••••••" autoComplete="new-password" />

      <Button type="submit" size="lg" loading={loading} className="w-full mt-2">
        Create Account
      </Button>

      <p className="text-center text-sm text-slate-500">
        Already have an account?{' '}
        <button type="button" onClick={onLoginClick}
          className="text-teal-400 hover:text-teal-300 font-medium transition-colors">
          Sign in
        </button>
      </p>
    </form>
  );
}