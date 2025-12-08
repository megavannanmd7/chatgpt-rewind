import { type ReactNode, forwardRef } from 'react';
import './NeonCardBase.css';

interface Props {
  children: ReactNode;
  className?: string;
}

// wrap component with forwardRef
const NeonCardBase = forwardRef<HTMLDivElement, Props>(
  ({ children, className = "" }, ref) => {
  return (
    // Attach the ref to the actual styled div
    <div ref={ref} className={`neon-card-base ${className}`}>
      {children}
    </div>
  );
});

// Good practice for debugging
NeonCardBase.displayName = 'NeonCardBase';

export default NeonCardBase;