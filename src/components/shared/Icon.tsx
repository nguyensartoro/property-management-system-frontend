import React from 'react';
import type { IconProps } from 'lucide-react';

interface IconComponentProps extends Omit<IconProps, 'ref'> {
  icon: React.ComponentType<IconProps>;
  size?: number;
  color?: string;
  className?: string;
  title?: string;
  'aria-label'?: string;
}

const Icon: React.FC<IconComponentProps> = (props: IconComponentProps) => {
  const {
    icon: IconElement,
    size = 20,
    color = 'currentColor',
    className = '',
    title,
    'aria-label': ariaLabel,
    ...rest
  } = props;
  return (
    <IconElement
      size={size}
      color={color}
      className={className}
      title={title}
      aria-label={ariaLabel}
      {...rest}
    />
  );
};

export default Icon; 