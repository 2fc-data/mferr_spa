import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';

interface NewPasswordFormData {
  password: string;
  confirmPassword: string;
}

interface NewPasswordProps {
  isOpen?: boolean;
  onClose?: (open: boolean) => void;
  onBackToLogin?: () => void;
}

export const NewPassword: React.FC<NewPasswordProps> = ({
  isOpen = true,
  onClose,
  onBackToLogin
}) => {
  const { register, handleSubmit, formState: { errors }, watch } = useForm<NewPasswordFormData>();
  const [submissionStatus, setSubmissionStatus] = useState<string | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const resetPasswordMutation = useMutation({
    mutationFn: authService.resetPassword,
    onSuccess: () => {
      setSubmissionStatus('Senha redefinida com sucesso! Redirecionando para o login...');
      setTimeout(() => {
        handleBackToLogin();
      }, 3000);
    },
    onError: (error: any) => {
      setSubmissionStatus(`Erro: ${error?.response?.data?.message || error.message}`);
    }
  });

  const handleClose = (open: boolean) => {
    if (onClose) {
      onClose(open);
    } else {
      navigate('/');
    }
  };

  const handleBackToLogin = () => {
    if (onBackToLogin) {
      onBackToLogin();
    } else {
      navigate('/login');
    }
  };

  const onSubmit = async (data: NewPasswordFormData) => {
    if (!token) {
      setSubmissionStatus("Token de recuperação ausente ou inválido.");
      return;
    }
    resetPasswordMutation.mutate({ token, password: data.password });
  };

  const password = watch("password");

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px] sm:rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">Set New Password</DialogTitle>
          <DialogDescription className="text-center">
            Enter your new password below.
          </DialogDescription>
        </DialogHeader>
        <div className="w-full mx-auto p-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="password">New Password</Label>
              <Input id="password" type="password" {...register('password', { required: true })} />
              {errors.password && <span className="text-red-500">Required</span>}
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...register('confirmPassword', {
                  required: true,
                  validate: (value) => value === password || "Passwords do not match"
                })}
              />
              {errors.confirmPassword && <span className="text-red-500">{errors.confirmPassword.message}</span>}
            </div>
            <Button type="submit" className="w-full">Update Password</Button>
          </form>
          {submissionStatus && <p className="mt-4 text-center">{submissionStatus}</p>}
          <div className="flex items-center justify-between mt-6">
            <Button variant="link" onClick={() => handleClose(false)} className="text-sm font-medium text-primary hover:underline px-0">
              Voltar pra Home
            </Button>
            <Button variant="link" onClick={handleBackToLogin} className="text-sm font-medium text-primary hover:underline px-0">
              Voltar pra Login
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
