import { UseFormReturn, FieldValues } from 'react-hook-form';

export function getErrorMessage<T extends FieldValues>(
  form: UseFormReturn<T>,
  fieldName: string
): string | undefined {
  const error = form.formState.errors[fieldName];
  return error?.message as string | undefined;
}

export function hasError<T extends FieldValues>(
  form: UseFormReturn<T>,
  fieldName: string
): boolean {
  return !!form.formState.errors[fieldName];
}
