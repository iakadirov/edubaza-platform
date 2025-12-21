import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ContainerProps {
  children: ReactNode;
  className?: string;
  backgroundClassName?: string;
  /**
   * Уровень контейнера:
   * - 'wrapper' - внешний контейнер (1200px, padding 30px)
   * - 'content' - контентный контейнер с фоном (1140px, padding 24px, border-radius 24px)
   * - 'inner' - внутренний контейнер (1092px, без padding)
   * - 'full' - все три уровня (по умолчанию)
   */
  level?: 'wrapper' | 'content' | 'inner' | 'full';
}

/**
 * Container component с трехуровневой системой из дизайн-системы EduMap:
 * 
 * 1. Container Wrapper (1200px max-width, 30px padding)
 * 2. Container Content (1140px max-width, 24px padding, border-radius 24px, фон #f7fcfe)
 * 3. Container Inner (1092px max-width, без padding)
 * 
 * @example
 * // Все три уровня (по умолчанию)
 * <Container>
 *   <h1>Content</h1>
 * </Container>
 * 
 * @example
 * // Только wrapper
 * <Container level="wrapper">
 *   <div>Content</div>
 * </Container>
 * 
 * @example
 * // Content с кастомным фоном
 * <Container level="content" backgroundClassName="bg-white">
 *   <div>Content</div>
 * </Container>
 */
export function Container({ 
  children, 
  className,
  backgroundClassName,
  level = 'full'
}: ContainerProps) {
  if (level === 'wrapper') {
    return (
      <div className={cn("container-wrapper", className)}>
        {children}
      </div>
    );
  }

  if (level === 'content') {
    return (
      <div className={cn(
        "container-content",
        backgroundClassName,
        className
      )}>
        {children}
      </div>
    );
  }

  if (level === 'inner') {
    return (
      <div className={cn("container-inner", className)}>
        {children}
      </div>
    );
  }

  // Full level (default) - все три уровня
  return (
    <div className="container-wrapper">
      <div className={cn(
        "container-content",
        backgroundClassName
      )}>
        <div className={cn("container-inner", className)}>
          {children}
        </div>
      </div>
    </div>
  );
}

