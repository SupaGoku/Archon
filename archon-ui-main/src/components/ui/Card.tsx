import React from 'react';
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  accentColor?: 'purple' | 'green' | 'pink' | 'blue' | 'cyan' | 'orange' | 'none';
  variant?: 'default' | 'bordered';
}
export const Card: React.FC<CardProps> = ({
  children,
  accentColor = 'none',
  variant = 'default',
  className = '',
  ...props
}) => {
  const accentColorMap = {
    purple: {
      line: 'before:bg-slate-400',
      border: 'border-slate-200 dark:border-slate-700',
      gradientFrom: 'from-slate-50 dark:from-slate-900/20',
      gradientTo: 'to-white dark:to-transparent'
    },
    green: {
      line: 'before:bg-green-600',
      border: 'border-green-200 dark:border-green-800',
      gradientFrom: 'from-green-50 dark:from-green-900/20',
      gradientTo: 'to-white dark:to-transparent'
    },
    pink: {
      line: 'before:bg-pink-600',
      border: 'border-pink-200 dark:border-pink-800',
      gradientFrom: 'from-pink-50 dark:from-pink-900/20',
      gradientTo: 'to-white dark:to-transparent'
    },
    blue: {
      line: 'before:bg-blue-600',
      border: 'border-blue-200 dark:border-blue-800',
      gradientFrom: 'from-blue-50 dark:from-blue-900/20',
      gradientTo: 'to-white dark:to-transparent'
    },
    cyan: {
      line: 'before:bg-cyan-600',
      border: 'border-cyan-200 dark:border-cyan-800',
      gradientFrom: 'from-cyan-50 dark:from-cyan-900/20',
      gradientTo: 'to-white dark:to-transparent'
    },
    orange: {
      line: 'before:bg-orange-600',
      border: 'border-orange-200 dark:border-orange-800',
      gradientFrom: 'from-orange-50 dark:from-orange-900/20',
      gradientTo: 'to-white dark:to-transparent'
    },
    none: {
      line: '',
      border: 'border-gray-200 dark:border-gray-700',
      gradientFrom: 'from-gray-50 dark:from-gray-900/20',
      gradientTo: 'to-white dark:to-transparent'
    }
  };
  const variantClasses = {
    default: 'border',
    bordered: 'border'
  };
  return <div className={`
        relative p-4 rounded-md backdrop-blur-sm
        bg-white dark:bg-gray-900
        ${variantClasses[variant]} ${accentColorMap[accentColor].border}
        shadow-sm hover:shadow-md
        transition-shadow duration-200
        ${accentColor !== 'none' ? `
          before:content-[""] before:absolute before:top-[0px] before:left-[0px] before:right-[0px] before:h-[1px] 
          ${accentColorMap[accentColor].line}
        ` : ''}
        ${className}
      `} {...props}>
      <div className="relative z-10">{children}</div>
    </div>;
};