import React, { useState, useCallback } from 'react';
import { Button } from './button';
import { toast } from './toast';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { logger } from '@/lib/logger';


interface ImageUploadProps {
  value?: string;
  onChange: (url: string, file?: File) => void;
  onRemove?: () => void;
  disabled?: boolean;
  maxSize?: number; // in MB
  acceptedFormats?: string[];
  aspectRatio?: string;
  className?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  onRemove,
  disabled = false,
  maxSize = 5,
  acceptedFormats = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  aspectRatio = 'aspect-video',
  className = ''
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const validateFile = useCallback((file: File): boolean => {
    // Check file type
    if (!acceptedFormats.includes(file.type)) {
      toast.error(`File type not supported. Accepted formats: ${acceptedFormats.map(f => f.split('/')[1]).join(', ')}`);
      return false;
    }

    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`File size too large. Maximum size: ${maxSize}MB`);
      return false;
    }

    return true;
  }, [acceptedFormats, maxSize]);

  const handleFileUpload = useCallback(async (file: File) => {
    if (!validateFile(file)) return;

    setIsUploading(true);
    try {
      // Create a local URL for immediate preview
      const localUrl = URL.createObjectURL(file);
      onChange(localUrl, file); // Pass both preview URL and file
      toast.success('Image uploaded successfully');
    } catch (error) {

      toast.error('Failed to upload image');
      logger.error('Upload error', { error });
    } finally {
      setIsUploading(false);
    }
  }, [onChange, validateFile]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setDragActive(true);
    }
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  }, [handleFileUpload]);

  const handleRemove = () => {
    if (value) {
      URL.revokeObjectURL(value);
    }
    if (onRemove) {
      onRemove();
    } else {
      onChange('');
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {value ? (
        <div className="space-y-4">
          <div className={`${aspectRatio} bg-gray-100 rounded-lg overflow-hidden relative group`}>
            <img
              src={value}
              alt="Uploaded preview"
              className="w-full h-full object-cover"
            />
            {!disabled && (
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRemove}
                  className="bg-white"
                >
                  <X className="h-4 w-4 mr-2" />
                  Remove
                </Button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div
          className={`${aspectRatio} border-2 border-dashed rounded-lg transition-colors duration-200 ${
            dragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          onDragEnter={handleDragIn}
          onDragLeave={handleDragOut}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !disabled && document.getElementById('image-upload-input')?.click()}
        >
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            {isUploading ? (
              <>
                <Loader2 className="h-8 w-8 animate-spin mb-4" />
                <p className="text-sm">Uploading...</p>
              </>
            ) : (
              <>
                <ImageIcon className="h-12 w-12 mb-4" />
                <p className="text-sm font-medium mb-2">
                  {dragActive ? 'Drop image here' : 'Click to upload or drag and drop'}
                </p>
                <p className="text-xs text-gray-400">
                  {acceptedFormats.map(f => f.split('/')[1]).join(', ').toUpperCase()} up to {maxSize}MB
                </p>
              </>
            )}
          </div>
        </div>
      )}

      <input
        id="image-upload-input"
        type="file"
        accept={acceptedFormats.join(',')}
        onChange={handleFileSelect}
        disabled={disabled || isUploading}
        className="hidden"
      />

      {!value && (
        <Button
          type="button"
          variant="outline"
          onClick={() => document.getElementById('image-upload-input')?.click()}
          disabled={disabled || isUploading}
          className="w-full"
        >
          <Upload className="h-4 w-4 mr-2" />
          {isUploading ? 'Uploading...' : 'Choose Image'}
        </Button>
      )}
    </div>
  );
};

export default ImageUpload;
