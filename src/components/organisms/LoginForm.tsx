import React, { useState } from 'react';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';
import { AlertMessage } from '../molecules/AlertMessage';
import { authService } from '../../services/api';
import { useAuth } from '../../store/authStore';

interface LoginFormProps {
  onSuccess?: () => void;
  onRegisterClick: () => void;
}

export function LoginForm({ onSuccess, onRegisterClick }: LoginFormProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // Validaciones locales iniciales en español
    if (!email || !password) { 
      setError('Por favor, completa todos los campos requeridos'); 
      return; 
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Petición real al controlador de Spring Boot (/api/v1/auth/login)
      const tokens = await authService.login({ email, password });
      
      // Persiste los tokens y actualiza el estado global de usuario de forma síncrona
      login(tokens);
      
      // Ejecuta el callback para dar paso al DashboardLayout
      onSuccess?.();
    } catch (err) {
      // Captura excepciones controladas del backend (ej: Credenciales inválidas)
      setError(err instanceof Error ? err.message : 'Credenciales de acceso inválidas');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {error && <AlertMessage message={error} />}

      <Input
        label="Correo Electrónico"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="usuario@itm.edu.co"
        autoComplete="email"
      />

      <Input
        label="Contraseña"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
        autoComplete="current-password"
      />

      <Button type="submit" size="lg" loading={loading} className="w-full mt-2">
        Iniciar Sesión
      </Button>

      <p className="text-center text-sm text-slate-500">
        ¿No tienes una cuenta?{' '}
        <button
          type="button"
          onClick={onRegisterClick}
          className="text-teal-400 hover:text-teal-300 font-medium transition-colors"
        >
          Regístrate como abonado
        </button>
      </p>
    </form>
  );
}