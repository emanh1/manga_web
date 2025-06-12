import toast from 'react-hot-toast';
import React from 'react';

type ToastType = 'success' | 'error' | 'loading' | 'custom';

interface ToastOptions {
  duration?: number;
  id?: string;
}

type ToastMessage = string | React.ReactNode;

const createClickableToast = (
  message: ToastMessage,
  type: ToastType = 'success',
  options: ToastOptions = {}
) => {
  const toastFn = {
    success: toast.success,
    error: toast.error,
    loading: toast.loading,
    custom: toast.custom,
  }[type];

  const toastId = toastFn(
    t =>
      React.createElement(
        'div',
        {
          className: 'cursor-pointer',
          onClick: () => toast.dismiss(t.id),
        },
        message
      ),
    {
      id: options.id,
      duration: options.duration || 5000,
    }
  );

  return toastId;
};

export const toastUtil = {
  success: (msg: ToastMessage, opts?: ToastOptions) => createClickableToast(msg, 'success', opts),
  error: (msg: ToastMessage, opts?: ToastOptions) => createClickableToast(msg, 'error', opts),
  loading: (msg: ToastMessage, opts?: ToastOptions) => createClickableToast(msg, 'loading', opts),
  custom: (msg: ToastMessage, opts?: ToastOptions) => createClickableToast(msg, 'custom', opts),
  dismiss: toast.dismiss,
};

