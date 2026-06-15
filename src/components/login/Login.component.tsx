import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { SEO } from '../SEO/SEO';
import { zodResolver } from '@hookform/resolvers/zod';
import { authService, loginSchema, type LoginCredentials } from '@/services/auth.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

import { useNavigate } from 'react-router-dom';
import { LogIn, KeyRound, Mail, Loader2 } from 'lucide-react';
import { inputCls, labelCls } from '@/components/ui/FormField';

interface LoginProps {
  isOpen?: boolean;
  onClose?: (open: boolean) => void;
  onForgotPassword?: () => void;
}

export const Login: React.FC<LoginProps> = ({
  isOpen = true,
  onClose,
  onForgotPassword,
}) => {
  const [submissionStatus, setSubmissionStatus] = useState<string | null>(null);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const navigate = useNavigate();

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      sessionStorage.setItem('user', JSON.stringify(data.user));
      setSubmissionStatus('Login realizado com sucesso!');

      handleClose(false);

      const isAdmin = data.user?.profiles?.some((p: any) => p.id === 1);
      const isManager = data.user?.profiles?.some((p: any) => p.id === 2);

      if (isAdmin) {
        navigate('/Dashboard');
      } else if (isManager) {
        navigate('/Dashboard/users');
      } else {
        navigate('/Dashboard/users'); // Default fallback for other roles
      }
    },
    onError: (error: unknown) => {
      console.error(error);
      const axiosError = error as any;
      setSubmissionStatus(`Erro: ${axiosError?.response?.data?.message || axiosError.message || 'Credenciais inválidas'}`);
    }
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: authService.forgotPassword,
    onSuccess: () => {
      setSubmissionStatus('Se este e-mail estiver cadastrado, um link de recuperação foi enviado.');
      setIsForgotPassword(false);
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

  const handleForgotPassword = () => {
    if (onForgotPassword) {
      onForgotPassword();
    } else {
      setIsForgotPassword(true);
    }
    setSubmissionStatus(null);
  };

  const form = useForm<LoginCredentials>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = (data: LoginCredentials) => {
    setSubmissionStatus('Autenticando…');
    loginMutation.mutate(data);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setSubmissionStatus('Processando solicitação…');
    forgotPasswordMutation.mutate(forgotEmail);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <SEO title={isForgotPassword ? "Recuperar Senha" : "Login"} robots="noindex, nofollow" />
      <DialogContent className="sm:max-w-[440px] border-white/10 shadow-2xl bg-card/95 backdrop-blur-xl sm:rounded-[2rem] p-0 overflow-hidden">
        <div className="bg-gradient-to-br from-primary/10 via-transparent to-primary/5 p-8">
          <DialogHeader className="mb-8">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-[1.25rem] flex items-center justify-center mb-4 shadow-inner">
               {isForgotPassword ? <Mail className="w-8 h-8 text-primary" /> : <LogIn className="w-8 h-8 text-primary" />}
            </div>
            <DialogTitle className="text-3xl font-black tracking-tight text-center">
              {isForgotPassword ? "Recuperar Senha" : "Login"}
            </DialogTitle>
            <DialogDescription className="text-center pt-2">
              <span className={cn(labelCls, "bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60")}>
                {isForgotPassword ? "Instruções por e-mail" : "Área Administrativa"}
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="w-full mx-auto">
            {!isForgotPassword ? (
              <>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem className="space-y-1.5">
                          <label className={labelCls}>Usuário ou E-mail</label>
                          <FormControl>
                            <div className="relative group">
                              <Input 
                                placeholder="nome@exemplo.com…" 
                                {...field} 
                                className={cn(inputCls, "pl-11")} 
                                autoComplete="username"
                              />
                              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem className="space-y-1.5">
                          <label className={labelCls}>Senha</label>
                          <FormControl>
                            <div className="relative group">
                              <Input 
                                type="password" 
                                placeholder="••••••••" 
                                {...field} 
                                className={cn(inputCls, "pl-11")} 
                                autoComplete="current-password"
                              />
                              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex flex-col gap-4 pt-2">
                      <Button 
                        type="submit" 
                        className="h-12 font-black uppercase tracking-widest text-xs rounded-2xl shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] transition-all" 
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Autenticando…
                          </>
                        ) : 'Acessar Sistema'}
                      </Button>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        className="h-12 font-bold uppercase tracking-widest text-[10px] rounded-2xl border border-white/5 hover:bg-white/5" 
                        onClick={() => {
                          form.reset();
                          setSubmissionStatus(null);
                        }}
                      >
                        Limpar Campos
                      </Button>
                    </div>
                  </form>
                </Form>
                <div className="flex items-center justify-center mt-8">
                  <Button 
                    variant="link" 
                    onClick={handleForgotPassword} 
                    className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors hover:no-underline"
                  >
                    Esqueceu sua senha?
                  </Button>
                </div>
              </>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className={labelCls}>Seu E-mail Cadastrado</label>
                  <div className="relative group">
                    <Input
                      type="email"
                      placeholder="exemplo@email.com…"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className={cn(inputCls, "pl-11")}
                      required
                      autoComplete="email"
                    />
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  </div>
                </div>
                <div className="flex flex-col gap-4 pt-2">
                  <Button 
                    type="submit" 
                    className="h-12 font-black uppercase tracking-widest text-xs rounded-2xl shadow-lg shadow-primary/20 active:scale-[0.98] transition-all" 
                    disabled={forgotPasswordMutation.isPending}
                  >
                    {forgotPasswordMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Enviando…
                      </>
                    ) : 'Enviar Link de Recuperação'}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-12 font-bold uppercase tracking-widest text-[10px] rounded-2xl border border-white/5"
                    onClick={() => setIsForgotPassword(false)}
                  >
                    Voltar para Login
                  </Button>
                </div>
              </form>
            )}

            {submissionStatus && (
              <div className={cn(
                "mt-8 p-4 rounded-2xl text-center text-sm font-bold animate-in fade-in zoom-in-95 duration-300 shadow-inner",
                submissionStatus.includes('Erro') 
                  ? "bg-destructive/10 text-destructive border border-destructive/20" 
                  : "bg-primary/10 text-primary border border-primary/20"
              )}>
                {submissionStatus.includes('Invalid credentials') 
                  ? 'Usuário ou senha incorretos. Por favor, tente novamente.' 
                  : submissionStatus}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
