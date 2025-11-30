import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  showText?: boolean;
  height?: number;
}

const Logo = ({ className, showText = true, height = 40 }: LogoProps) => {
  return (
    <Link
      to="/"
      className={cn(
        "flex items-center gap-3 hover:opacity-80 transition-opacity",
        className
      )}
    >
      <img
        src="/easyflow-logo.png"
        alt="Easy Flow Logo"
        className="h-auto"
        style={{ height: `${height}px` }}
      />
      {showText && (
        <span className="text-xl font-bold text-foreground">
          Easy Forms - בונה טפסים
        </span>
      )}
    </Link>
  );
};

export default Logo;

