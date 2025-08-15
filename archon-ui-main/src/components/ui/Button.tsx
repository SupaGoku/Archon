import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '../../lib/utils';

export type ColorOption = 'default' | 'primary' | 'secondary' | 'success' | 'danger' | 'warning';
export type SizeOption = 'sm' | 'md' | 'lg' | 'xl';
export type VariantOption = 'solid' | 'outline' | 'ghost';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children: React.ReactNode;
  color?: ColorOption;
  size?: SizeOption;
  variant?: VariantOption;
  disabled?: boolean;
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  color = 'default',
  size = 'md',
  variant = 'solid',
  disabled = false,
  fullWidth = false,
  className,
  ...props
}, ref) => {
  // Size mappings
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl'
  };

  // Color mappings for each variant
  const colorClasses = {
    solid: {
      default: 'bg-gray-600 hover:bg-gray-700 text-white border-gray-600',
      primary: 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600',
      secondary: 'bg-slate-600 hover:bg-slate-700 text-white border-slate-600',
      success: 'bg-green-600 hover:bg-green-700 text-white border-green-600',
      danger: 'bg-red-600 hover:bg-red-700 text-white border-red-600',
      warning: 'bg-amber-600 hover:bg-amber-700 text-white border-amber-600'
    },
    outline: {
      default: 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600',
      primary: 'bg-transparent hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-700',
      secondary: 'bg-transparent hover:bg-slate-50 dark:hover:bg-slate-900/20 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700',
      success: 'bg-transparent hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 dark:text-green-400 border-green-300 dark:border-green-700',
      danger: 'bg-transparent hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 border-red-300 dark:border-red-700',
      warning: 'bg-transparent hover:bg-amber-50 dark:hover:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-700'
    },
    ghost: {
      default: 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300',
      primary: 'bg-transparent hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400',
      secondary: 'bg-transparent hover:bg-slate-50 dark:hover:bg-slate-900/20 text-slate-600 dark:text-slate-400',
      success: 'bg-transparent hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 dark:text-green-400',
      danger: 'bg-transparent hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400',
      warning: 'bg-transparent hover:bg-amber-50 dark:hover:bg-amber-900/20 text-amber-600 dark:text-amber-400'
    }
  };

  const baseClasses = cn(
    'relative inline-flex items-center justify-center',
    'rounded-md font-medium',
    'transition-colors duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'focus:ring-gray-500 dark:focus:ring-gray-400',
    variant !== 'ghost' && 'border',
    sizeClasses[size],
    colorClasses[variant][color],
    fullWidth && 'w-full',
    disabled && 'opacity-50 cursor-not-allowed',
    className
  );

  return (
    <motion.button
      ref={ref}
      className={baseClasses}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      transition={{ duration: 0.15 }}
      {...props}
    >
      {children}
    </motion.button>
  );
});

Button.displayName = 'Button';

// Export the old name for backward compatibility
export const NeonButton = Button;

// Default export for better compatibility
export default Button;