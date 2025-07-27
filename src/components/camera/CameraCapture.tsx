import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, X, RotateCcw, Download, Upload, Image as ImageIcon } from 'lucide-react';
import { TouchButton } from '../ui/TouchFriendlyComponents';

interface CameraCaptureProps {
  onCapture: (file: File, preview: string) => void;
  onClose: () => void;
  maxFileSize?: number; // in MB
  quality?: number; // 0.1 to 1.0
  aspectRatio?: 'square' | '4:3' | '16:9' | 'free';
  allowMultiple?: boolean;
  showPreview?: boolean;
}

interface CapturedImage {
  file: File;
  preview: string;
  id: string;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({
  onCapture,
  onClose,
  maxFileSize = 5, // 5MB default
  quality = 0.8,
  aspectRatio = 'free',
  allowMultiple = false,
  showPreview = true,
}) => {
  const [isActive, setIsActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [capturedImages, setCapturedImages] = useState<CapturedImage[]>([]);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if camera is supported
  const isCameraSupported = useCallback(() => {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }, []);

  // Start camera
  const startCamera = useCallback(async () => {
    if (!isCameraSupported()) {
      setError('Camera not supported on this device');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }

      setIsActive(true);
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Unable to access camera. Please check permissions.');
    } finally {
      setIsLoading(false);
    }
  }, [facingMode, isCameraSupported]);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsActive(false);
  }, [stream]);

  // Switch camera (front/back)
  const switchCamera = useCallback(() => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  }, []);

  // Capture photo
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions based on aspect ratio
    let { videoWidth, videoHeight } = video;
    let canvasWidth = videoWidth;
    let canvasHeight = videoHeight;

    switch (aspectRatio) {
      case 'square':
        const squareSize = Math.min(videoWidth, videoHeight);
        canvasWidth = squareSize;
        canvasHeight = squareSize;
        break;
      case '4:3':
        if (videoWidth / videoHeight > 4 / 3) {
          canvasWidth = videoHeight * (4 / 3);
          canvasHeight = videoHeight;
        } else {
          canvasWidth = videoWidth;
          canvasHeight = videoWidth * (3 / 4);
        }
        break;
      case '16:9':
        if (videoWidth / videoHeight > 16 / 9) {
          canvasWidth = videoHeight * (16 / 9);
          canvasHeight = videoHeight;
        } else {
          canvasWidth = videoWidth;
          canvasHeight = videoWidth * (9 / 16);
        }
        break;
    }

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Calculate crop position for centering
    const cropX = (videoWidth - canvasWidth) / 2;
    const cropY = (videoHeight - canvasHeight) / 2;

    // Draw the image
    context.drawImage(
      video,
      cropX, cropY, canvasWidth, canvasHeight,
      0, 0, canvasWidth, canvasHeight
    );

    // Convert to blob
    canvas.toBlob(
      (blob) => {
        if (!blob) return;

        // Check file size
        const fileSizeMB = blob.size / (1024 * 1024);
        if (fileSizeMB > maxFileSize) {
          setError(`Image size (${fileSizeMB.toFixed(1)}MB) exceeds limit of ${maxFileSize}MB`);
          return;
        }

        const file = new File([blob], `photo_${Date.now()}.jpg`, {
          type: 'image/jpeg',
        });

        const preview = canvas.toDataURL('image/jpeg', quality);
        const id = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const capturedImage: CapturedImage = { file, preview, id };

        if (allowMultiple) {
          setCapturedImages(prev => [...prev, capturedImage]);
        } else {
          setCapturedImages([capturedImage]);
          onCapture(file, preview);
        }
      },
      'image/jpeg',
      quality
    );
  }, [aspectRatio, quality, maxFileSize, allowMultiple, onCapture]);

  // Handle file input (for devices without camera)
  const handleFileInput = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    files.forEach(file => {
      // Check file size
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > maxFileSize) {
        setError(`File size (${fileSizeMB.toFixed(1)}MB) exceeds limit of ${maxFileSize}MB`);
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const preview = e.target?.result as string;
        const id = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const capturedImage: CapturedImage = { file, preview, id };

        if (allowMultiple) {
          setCapturedImages(prev => [...prev, capturedImage]);
        } else {
          setCapturedImages([capturedImage]);
          onCapture(file, preview);
        }
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    event.target.value = '';
  }, [maxFileSize, allowMultiple, onCapture]);

  // Remove captured image
  const removeImage = useCallback((id: string) => {
    setCapturedImages(prev => prev.filter(img => img.id !== id));
  }, []);

  // Confirm multiple captures
  const confirmCaptures = useCallback(() => {
    capturedImages.forEach(img => {
      onCapture(img.file, img.preview);
    });
  }, [capturedImages, onCapture]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Auto-start camera when component mounts
  useEffect(() => {
    if (isCameraSupported()) {
      startCamera();
    }
  }, [startCamera, isCameraSupported]);

  // Update camera when facing mode changes
  useEffect(() => {
    if (isActive) {
      stopCamera();
      setTimeout(startCamera, 100);
    }
  }, [facingMode]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black text-white safe-area-top">
        <TouchButton
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-white hover:bg-gray-800"
        >
          <X className="h-6 w-6" />
        </TouchButton>
        
        <h2 className="text-lg font-semibold">
          {allowMultiple ? `Photos (${capturedImages.length})` : 'Take Photo'}
        </h2>

        {isCameraSupported() && (
          <TouchButton
            variant="ghost"
            size="sm"
            onClick={switchCamera}
            className="text-white hover:bg-gray-800"
          >
            <RotateCcw className="h-6 w-6" />
          </TouchButton>
        )}
      </div>

      {/* Camera View */}
      <div className="flex-1 relative overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="text-white text-center">
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p>Starting camera...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="text-white text-center p-4">
              <p className="mb-4">{error}</p>
              {!isCameraSupported() && (
                <TouchButton
                  variant="primary"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choose from Gallery
                </TouchButton>
              )}
            </div>
          </div>
        )}

        {isActive && !error && (
          <>
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
            />
            
            {/* Aspect ratio overlay */}
            {aspectRatio !== 'free' && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="w-full h-full flex items-center justify-center">
                  <div 
                    className="border-2 border-white border-opacity-50"
                    style={{
                      aspectRatio: aspectRatio === 'square' ? '1/1' : 
                                  aspectRatio === '4:3' ? '4/3' : '16/9',
                      maxWidth: '90%',
                      maxHeight: '90%',
                    }}
                  />
                </div>
              </div>
            )}
          </>
        )}

        {/* Hidden canvas for capture */}
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple={allowMultiple}
          onChange={handleFileInput}
          className="hidden"
          capture="environment"
        />
      </div>

      {/* Preview Section */}
      {showPreview && capturedImages.length > 0 && (
        <div className="bg-black p-4">
          <div className="flex gap-2 overflow-x-auto">
            {capturedImages.map((img) => (
              <div key={img.id} className="relative flex-shrink-0">
                <img
                  src={img.preview}
                  alt="Captured"
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <button
                  onClick={() => removeImage(img.id)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="bg-black p-4 safe-area-bottom">
        <div className="flex items-center justify-center gap-4">
          {/* Gallery button */}
          <TouchButton
            variant="ghost"
            size="lg"
            onClick={() => fileInputRef.current?.click()}
            className="text-white hover:bg-gray-800"
          >
            <ImageIcon className="h-6 w-6" />
          </TouchButton>

          {/* Capture button */}
          <TouchButton
            variant="primary"
            size="lg"
            onClick={capturePhoto}
            disabled={!isActive || !!error}
            className="w-16 h-16 rounded-full bg-white text-black hover:bg-gray-200 disabled:opacity-50"
          >
            <Camera className="h-8 w-8" />
          </TouchButton>

          {/* Confirm button (for multiple captures) */}
          {allowMultiple && capturedImages.length > 0 ? (
            <TouchButton
              variant="primary"
              size="lg"
              onClick={confirmCaptures}
              className="text-white bg-green-600 hover:bg-green-700"
            >
              <Download className="h-6 w-6" />
            </TouchButton>
          ) : (
            <div className="w-12" /> // Spacer
          )}
        </div>

        {/* Instructions */}
        <div className="text-center mt-4">
          <p className="text-white text-sm opacity-75">
            {allowMultiple 
              ? `Tap camera to capture, then tap confirm when done`
              : 'Tap the camera button to take a photo'
            }
          </p>
        </div>
      </div>
    </div>
  );
};

// Hook for camera permissions
export const useCameraPermissions = () => {
  const [permission, setPermission] = useState<PermissionState>('prompt');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    const checkSupport = () => {
      setIsSupported(!!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia));
    };

    const checkPermission = async () => {
      if ('permissions' in navigator) {
        try {
          const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
          setPermission(result.state);
          
          result.addEventListener('change', () => {
            setPermission(result.state);
          });
        } catch (error) {
          console.log('Permission API not supported');
        }
      }
    };

    checkSupport();
    checkPermission();
  }, []);

  const requestPermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      setPermission('granted');
      return 'granted';
    } catch (error) {
      setPermission('denied');
      return 'denied';
    }
  }, []);

  return {
    permission,
    isSupported,
    requestPermission,
  };
};