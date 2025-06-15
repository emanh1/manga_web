import { useState, useCallback } from 'react';

interface FormField<T> {
  value: T;
  error?: string;
}

export interface FormState {
  [key: string]: FormField<string>;
}

interface UseFormProps {
  initialValues: { [key: string]: string };
  onSubmit: (values: { [key: string]: string }) => Promise<void>;
  validate?: (values: { [key: string]: string }) => { [key: string]: string };
}

export function useForm({ initialValues, onSubmit, validate }: UseFormProps) {
  const [formState, setFormState] = useState<FormState>(
    Object.keys(initialValues).reduce((acc, key) => {
      acc[key] = { value: initialValues[key] };
      return acc;
    }, {} as FormState)
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleChange = useCallback((name: string, value: string) => {
    setFormState(prev => ({
      ...prev,
      [name]: { ...prev[name], value, error: undefined }
    }));
    setSubmitError(null);
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const values = Object.keys(formState).reduce((acc, key) => {
      acc[key] = formState[key].value;
      return acc;
    }, {} as { [key: string]: string });

    if (validate) {
      const errors = validate(values);
      const hasErrors = Object.keys(errors).length > 0;

      if (hasErrors) {
        setFormState(prev => {
          const newState = { ...prev };
          Object.keys(errors).forEach(key => {
            newState[key] = { ...newState[key], error: errors[key] };
          });
          return newState;
        });
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  }, [formState, onSubmit, validate]);

  return {
    formState,
    isSubmitting,
    submitError,
    handleChange,
    handleSubmit
  };
}
