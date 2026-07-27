import { ReactNode, CSSProperties } from "react";

interface ContainerProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export default function Container({ children, className = "", style }: ContainerProps) {
  return (
    <div className={`site-container ${className}`} style={style}>
      {children}
    </div>
  );
}
