import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export const useLogin = () => {
  const navigate = useNavigate();
  const { signIn, isSigningIn } = useAuth();

  const handleSubmit = async (email: string, password: string) => {
    const { error } = await signIn(email, password);

    if (error) {
      toast({
        title: 'שגיאה',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'הצלחה',
        description: 'התחברת בהצלחה!',
      });
      navigate('/dashboard');
    }
  };

  return {
    handleSubmit,
    isSigningIn,
  };
};
