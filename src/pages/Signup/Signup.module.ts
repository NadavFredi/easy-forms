import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export const useSignup = () => {
  const navigate = useNavigate();
  const { signUp, isSigningUp } = useAuth();

  const handleSubmit = async (email: string, password: string) => {
    const { error } = await signUp(email, password);

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: 'Account created! Please check your email to verify your account.',
      });
      navigate('/dashboard');
    }
  };

  return {
    handleSubmit,
    isSigningUp,
  };
};

