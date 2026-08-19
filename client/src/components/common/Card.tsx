import React from 'react';
import { cn } from '../../utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hover = false,
  ...props
}) => {
  return (
    <div
      className={cn(
        'rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition-all duration-150',
        hover && 'hover:border-slate-300 hover:shadow-sm',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
