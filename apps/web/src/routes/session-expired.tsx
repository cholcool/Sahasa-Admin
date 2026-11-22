import { createFileRoute } from '@tanstack/react-router';
import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { LoginForm } from '@/features/auth/components/LoginForm';

/** 01-05 Login after the session timed out */
export const Route = createFileRoute('/session-expired')({
  component: () => (
    <AuthLayout>
      {/* TODO: prefill with the email of the user whose session expired */}
      <LoginForm expired defaultEmail="sales01@sahasa.co.th" />
    </AuthLayout>
  ),
});
