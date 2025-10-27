'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, UseFormReturn, FormProvider } from 'react-hook-form';
import { z } from 'zod';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getErrorMessage, hasError } from '@/lib/form-utils';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface FormProps<T extends z.ZodType<any, any>> {
  schema: T;
  onSubmit: (data: z.infer<T>) => void | Promise<void>;
  defaultValues?: Partial<z.infer<T>>;
  children: (form: UseFormReturn<z.infer<T>>) => React.ReactNode;
  className?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function Form<T extends z.ZodType<any, any>>({
  schema,
  onSubmit,
  defaultValues,
  children,
  className,
}: FormProps<T>) {
  const form = useForm<z.output<T>>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    defaultValues: defaultValues as any,
  });

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={cn('space-y-6', className)}>
        {children(form)}
      </form>
    </FormProvider>
  );
}

interface FormFieldProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
}

export function FormField({ form, name, label, type = 'text', placeholder }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        type={type}
        placeholder={placeholder}
        {...form.register(name)}
        aria-invalid={hasError(form, name)}
        aria-describedby={hasError(form, name) ? `${name}-error` : undefined}
      />
      {hasError(form, name) && (
        <p id={`${name}-error`} className="text-sm text-destructive" role="alert">
          {getErrorMessage(form, name)}
        </p>
      )}
    </div>
  );
}
