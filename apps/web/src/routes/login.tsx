import { createFileRoute } from '@tanstack/react-router';
import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { LoginForm } from '@/features/auth/components/LoginForm';

/** 01-01 Login */
export const Route = createFileRoute('/login')({
  component: () => (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  ),
});
