import React from 'react';
import { Button } from './button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './card';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md'
}: ModalProps) {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <Card className={`relative w-full mx-4 shadow-xl bg-card text-card-foreground border border-border ${sizeClasses[size]}`}>
        <CardHeader className="border-b border-border/50">
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        
        <CardContent className="bg-card/95">
          {children}
        </CardContent>
        
        {footer && (
          <CardFooter className="border-t border-border/50">
            {footer}
          </CardFooter>
        )}
      </Card>
    </div>
  );
}

// Convenience component for simple modals with close button
export function SimpleModal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md'
}: Omit<ModalProps, 'footer'>) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size={size}
      footer={
        <Button onClick={onClose} className="ml-auto">
          Close
        </Button>
      }
    >
      {children}
    </Modal>
  );
}
