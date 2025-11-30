import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSignup } from './Signup.module';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import Logo from '@/components/Logo';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { handleSubmit, isSigningUp } = useSignup();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmit(email, password);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-accent/20">
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 py-4">
          <Logo />
        </div>
      </nav>
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">צור חשבון</CardTitle>
          <CardDescription>התחל עם Easy Forms</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">אימייל</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">סיסמה</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSigningUp}>
              {isSigningUp ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  יוצר חשבון...
                </>
              ) : (
                'הירשם'
              )}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <span className="text-muted-foreground">כבר יש לך חשבון? </span>
            <Link to="/login" className="text-primary hover:underline">
              התחבר
            </Link>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

export default Signup;
