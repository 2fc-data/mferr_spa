import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { UserPlus, User, Mail, Lock, ShieldCheck, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { api } from '@/services/api';

const signupSchema = z.object({
  name: z.string().min(2, { message: 'Nome deve ter pelo menos 2 caracteres' }),
  username: z.string().min(3, { message: 'Username deve ter pelo menos 3 caracteres' }),
  email: z.string().email({ message: 'Email inválido' }),
  document: z.string().min(11, { message: 'Documento inválido (CPF/CNPJ)' }),
  password: z.string().min(6, { message: 'A senha deve ter pelo menos 6 caracteres' }),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupSchema>;

export const Signup: React.FC = () => {
  const [submissionStatus, setSubmissionStatus] = useState<{ type: 'success' | 'error' | null, message: string | null }>({ type: null, message: null });
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      username: '',
      email: '',
      document: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    setSubmissionStatus({ type: null, message: null });
    try {
      const { confirmPassword, ...signupData } = data;
      await api.post('/users', signupData);
      setSubmissionStatus({ type: 'success', message: 'Usuário cadastrado com sucesso!' });
      form.reset();
    } catch (error: unknown) {
      console.error(error);
      const axiosError = error as any;
      setSubmissionStatus({
        type: 'error',
        message: axiosError?.response?.data?.message || axiosError.message || 'Erro ao cadastrar usuário. Tente novamente.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-4xl min-w-[300px] shadow-elegant border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="space-y-1 text-center sm:text-left pt-6 px-6">
          <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
            <div className="p-2 rounded-xl bg-accent/20 text-accent">
              <UserPlus className="w-6 h-6" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">Criar Novo Usuário</CardTitle>
          </div>
          <CardDescription className="text-muted-foreground text-base font-medium">
            Preencha os dados abaixo para cadastrar um novo acesso ao sistema.
          </CardDescription>
        </CardHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <CardContent className="grid grid-cols-1 xl:grid-cols-2 gap-x-8 gap-y-6 px-6">
              {/* Name Field */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <User className="w-4 h-4 text-accent" /> Nome Completo
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: João Silva" {...field} className="rounded-xl border-border/50 focus:ring-accent" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Username Field */}
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <User className="w-4 h-4 text-accent" /> Nome de Usuário
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: joao.silva" {...field} className="rounded-xl border-border/50 focus:ring-accent" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email Field */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-accent" /> E-mail
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="joao@exemplo.com" type="email" {...field} className="rounded-xl border-border/50 focus:ring-accent" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Document Field */}
              <FormField
                control={form.control}
                name="document"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-accent" /> CPF / CNPJ
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="000.000.000-00" {...field} className="rounded-xl border-border/50 focus:ring-accent" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password Field */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-accent" /> Senha
                    </FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••" {...field} className="rounded-xl border-border/50 focus:ring-accent" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Confirm Password Field */}
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-accent" /> Confirmar Senha
                    </FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••" {...field} className="rounded-xl border-border/50 focus:ring-accent" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>

            <CardFooter className="flex flex-col gap-4 border-t pt-6">
              <Button
                type="submit"
                className="w-full lg:w-auto min-w-[200px] h-12 rounded-xl text-base font-semibold transition-all duration-300 active:scale-95"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  'Cadastrar Usuário'
                )}
              </Button>

              {submissionStatus.message && (
                <div className={`w-full p-4 rounded-xl text-sm font-medium border animate-in fade-in slide-in-from-top-2 ${submissionStatus.type === 'success'
                  ? 'bg-green-500/10 text-green-500 border-green-500/20'
                  : 'bg-destructive/10 text-destructive border-destructive/20'
                  }`}>
                  {submissionStatus.message}
                </div>
              )}
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
};
