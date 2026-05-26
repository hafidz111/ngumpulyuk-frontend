import { AuthSplitLayout } from '../components/auth-split-layout';
import { useGoogleAuthSubmit } from '../hooks/use-google-auth-submit';
import { SignupForm } from '../../components/signup-form';

export default function RegisterPage() {
  const { signInWithGoogleCredential, isGoogleLoading } = useGoogleAuthSubmit();

  return (
    <AuthSplitLayout>
      <SignupForm
        onGoogleCredential={(cred) => void signInWithGoogleCredential(cred)}
        isGoogleLoading={isGoogleLoading}
      />
    </AuthSplitLayout>
  );
}
