import React, { useState } from 'react';
import type { RegisterRequest } from '../../types';
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

// Validador local adaptado al idioma oficial del sistema
function validate(data: RegisterRequest): FormErrors {
  const errors: FormErrors = {};
  if (!data.nombre.trim()) errors.nombre = 'El nombre es obligatorio';
  if (!data.apellido.trim()) errors.apellido = 'El apellido es obligatorio';
  if (!data.documento.trim()) errors.documento = 'El documento de identidad es obligatorio';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = 'Correo electrónico inválido';
  if (!/^\d{7,10}$/.test(data.telefono)) errors.telefono = 'El teléfono debe contener entre 7 y 10 dígitos';
  if (data.password.length < 8) errors.password = 'La contraseña debe tener mínimo 8 caracteres';
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
      // Envío transaccional hacia el endpoint /api/v1/auth/register de Spring Boot
      const tokens = await authService.register(form);
      
      // Persiste la sesión de forma inmediata en el LocalStorage
      login(tokens);
      onSuccess?.();
    } catch (err) {
      // Captura excepciones de negocio del Backend (ej: Correo o Cédula duplicada)
      setServerError(err instanceof Error ? err.message : 'Error al procesar el registro del abonado');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {serverError && <AlertMessage message={serverError} />}

      <div className="grid grid-cols-2 gap-4">
        <Input 
          label="Nombre" 
          value={form.nombre} 
          onChange={handleChange('nombre')}
          error={errors.nombre} 
          placeholder="Juan" 
          autoComplete="given-name" 
        />
        <Input 
          label="Apellido" 
          value={form.apellido} 
          onChange={handleChange('apellido')}
          error={errors.apellido} 
          placeholder="Mazo" 
          autoComplete="family-name" 
        />
      </div>

      <Input 
        label="Documento de Identidad" 
        value={form.documento} 
        onChange={handleChange('documento')}
        error={errors.documento} 
        placeholder="1001234567" 
      />

      <Input 
        label="Correo Electrónico" 
        type="email" 
        value={form.email} 
        onChange={handleChange('email')}
        error={errors.email} 
        placeholder="juan.mazo@itm.edu.co" 
        autoComplete="email" 
      />

      <Input 
        label="Teléfono Celular" 
        type="tel" 
        value={form.telefono} 
        onChange={handleChange('telefono')}
        error={errors.telefono} 
        placeholder="3001234567" 
        autoComplete="tel" 
      />

      <Input 
        label="Contraseña" 
        type="password" 
        value={form.password} 
        onChange={handleChange('password')}
        error={errors.password} 
        placeholder="Mínimo 8 caracteres" 
        autoComplete="new-password" 
      />

      <Button type="submit" size="lg" loading={loading} className="w-full mt-2">
        Crear Cuenta de Abonado
      </Button>

      <p className="text-center text-sm text-slate-500">
        ¿Ya tienes una cuenta?{' '}
        <button 
          type="button" 
          onClick={onLoginClick}
          className="text-teal-400 hover:text-teal-300 font-medium transition-colors"
        >
          Inicia Sesión
        </button>
      </p>
    </form>
  );
}