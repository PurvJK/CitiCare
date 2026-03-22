import { useState } from 'react';
import { ComplaintImage } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { X, ChevronLeft, ChevronRight, Camera, CheckCircle, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageGalleryProps {
  images: ComplaintImage[];
  className?: string;
}

export function ImageGallery({ images, className }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<ComplaintImage | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const beforeImages = images.filter((img) => img.type === 'before');
  const afterImages = images.filter((img) => img.type === 'after');

  const openLightbox = (image: ComplaintImage, allImages: ComplaintImage[]) => {
    setSelectedImage(image);
    setCurrentIndex(allImages.findIndex((img) => img.id === image.id));
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    const totalImages = images.length;
    if (direction === 'prev') {
      setCurrentIndex((prev) => (prev === 0 ? totalImages - 1 : prev - 1));
    } else {
      setCurrentIndex((prev) => (prev === totalImages - 1 ? 0 : prev + 1));
    }
    setSelectedImage(images[direction === 'prev' 
      ? (currentIndex === 0 ? images.length - 1 : currentIndex - 1)
      : (currentIndex === images.length - 1 ? 0 : currentIndex + 1)
    ]);
  };

  if (images.length === 0) {
    return (
      <div className={cn('rounded-lg border border-dashed border-border bg-secondary/30 p-8 text-center', className)}>
        <ImageIcon className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">No images uploaded</p>
      </div>
    );
  }

  const ImageGrid = ({ imgs, label, icon: Icon, variant }: { 
    imgs: ComplaintImage[], 
    label: string, 
    icon: typeof Camera,
    variant: 'before' | 'after'
  }) => {
    if (imgs.length === 0) return null;

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className={cn(
            'h-8 w-8 rounded-lg flex items-center justify-center',
            variant === 'before' ? 'bg-warning/10' : 'bg-success/10'
          )}>
            <Icon className={cn(
              'h-4 w-4',
              variant === 'before' ? 'text-warning' : 'text-success'
            )} />
          </div>
          <div>
            <h4 className="text-sm font-medium">{label}</h4>
            <p className="text-xs text-muted-foreground">{imgs.length} image(s)</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {imgs.map((image) => (
            <div
              key={image.id}
              className="relative group aspect-square rounded-lg overflow-hidden border border-border bg-secondary cursor-pointer hover:ring-2 hover:ring-accent transition-all"
              onClick={() => openLightbox(image, images)}
            >
              <img
                src={image.url}
                alt={image.caption || 'Complaint image'}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-[10px] text-background truncate">{image.caption}</p>
              </div>
              <Badge
                variant={variant === 'before' ? 'warning' : 'success'}
                className="absolute top-2 right-2 text-[10px]"
              >
                {variant === 'before' ? 'Before' : 'After'}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={cn('space-y-6', className)}>
      <ImageGrid 
        imgs={beforeImages} 
        label="Issue Reported" 
        icon={Camera}
        variant="before"
      />
      <ImageGrid 
        imgs={afterImages} 
        label="Issue Resolved" 
        icon={CheckCircle}
        variant="after"
      />

      {/* Lightbox Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl p-0 bg-foreground/95 border-none">
          <DialogTitle className="sr-only">Image Preview</DialogTitle>
          <div className="relative">
            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 text-background hover:bg-background/20"
              onClick={() => setSelectedImage(null)}
            >
              <X className="h-5 w-5" />
            </Button>

            {/* Navigation */}
            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-background hover:bg-background/20"
                  onClick={() => navigateImage('prev')}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-background hover:bg-background/20"
                  onClick={() => navigateImage('next')}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}

            {/* Image */}
            <div className="flex items-center justify-center min-h-[400px] max-h-[80vh] p-8">
              {selectedImage && (
                <img
                  src={selectedImage.url}
                  alt={selectedImage.caption || 'Complaint image'}
                  className="max-w-full max-h-full object-contain rounded-lg"
                />
              )}
            </div>

            {/* Image Info */}
            {selectedImage && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-foreground to-transparent p-6 pt-12">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={selectedImage.type === 'before' ? 'warning' : 'success'}>
                        {selectedImage.type === 'before' ? 'Issue Reported' : 'Issue Resolved'}
                      </Badge>
                      <Badge variant="secondary" className="capitalize">
                        {selectedImage.uploadedByRole.replace('_', ' ')}
                      </Badge>
                    </div>
                    {selectedImage.caption && (
                      <p className="text-sm text-background/80">{selectedImage.caption}</p>
                    )}
                    <p className="text-xs text-background/60 mt-1">
                      Uploaded on {new Date(selectedImage.uploadedAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <p className="text-sm text-background/60">
                    {currentIndex + 1} / {images.length}
                  </p>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
