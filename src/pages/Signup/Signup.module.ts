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
        title: 'שגיאה',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'הצלחה',
        description: 'החשבון נוצר! אנא בדוק את האימייל שלך כדי לאמת את החשבון.',
      });
      navigate('/dashboard');
    }
  };

  return {
    handleSubmit,
    isSigningUp,
  };
};
