import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ContainerProps {
  children: ReactNode;
  className?: string;
  backgroundClassName?: string;
}

/**
 * Container component with unified width system:
 * - Outer container: 1440px max-width with 24px padding
 * - Inner content: 1392px max-width with 24px padding
 * - Background: 1392px width
 * 
 * Usage:
 * <Container backgroundClassName="bg-blue-50">
 *   <h1>Content</h1>
 * </Container>
 */
export function Container({ 
  children, 
  className,
  backgroundClassName 
}: ContainerProps) {
  return (
    <div className="max-w-[1440px] mx-auto px-6">
      <div className={cn(
        "max-w-[1392px] mx-auto px-6",
        backgroundClassName,
        className
      )}>
        {children}
      </div>
    </div>
  );
}

