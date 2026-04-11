import React from 'react';
import { Input } from '../atoms/Input';

interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
  leftIcon?: React.ReactNode;
  autoComplete?: string;
}

export function FormField({ label, ...inputProps }: FormFieldProps) {
  return <Input label={label} {...inputProps} />;
}