import React from 'react';
import { cn } from '../../lib/utils';

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

interface AvatarFallbackProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Avatar: React.FC<AvatarProps> = ({ className, children, ...props }) => {
  return (
    <div
      className={cn(
        'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const AvatarFallback: React.FC<AvatarFallbackProps> = ({ className, children, ...props }) => {
  return (
    <div
      className={cn(
        'flex h-full w-full items-center justify-center rounded-full bg-muted font-medium',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};