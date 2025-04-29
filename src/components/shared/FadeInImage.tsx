import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface FadeInImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  fallback?: React.ReactNode;
}

const FadeInImage: React.FC<FadeInImageProps> = ({
  src,
  alt,
  className = '',
  fallback = null,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  if (hasError && fallback) {
    return <>{fallback}</>;
  }

  return (
    <>
      {!isLoaded && !hasError && (
        <div 
          className={`bg-gray-100 animate-pulse ${className}`}
          style={{ aspectRatio: props.width && props.height ? `${props.width}/${props.height}` : 'auto' }}
        />
      )}
      <motion.img
        src={src}
        alt={alt}
        className={`${className} ${isLoaded ? 'block' : 'hidden'}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        {...props}
      />
    </>
  );
};

export default FadeInImage; 