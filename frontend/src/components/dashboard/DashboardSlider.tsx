import { useEffect, useRef, useState } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import type { CarouselApi } from '@/components/ui/carousel';

/* Images from public folder – served at root (e.g. /road.jpg) */
const sliderImages = [
  { src: '/road.jpg', title: 'Road & Infrastructure' },
  { src: '/water.jpg', title: 'Water & Sanitation' },
  { src: '/street-light.jpg', title: 'Street Lighting' },
  { src: '/waste-manegment.jpg', title: 'Waste Management' },
  { src: '/park.jpg', title: 'Parks & Green Spaces' },
];

const AUTOPLAY_INTERVAL_MS = 2000;

export function DashboardSlider() {
  const [api, setCarouselApi] = useState<CarouselApi | null>(null);
  const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!api) return;
    autoplayRef.current = setInterval(() => {
      api.scrollNext();
    }, AUTOPLAY_INTERVAL_MS);
    return () => {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
        autoplayRef.current = null;
      }
    };
  }, [api]);

  return (
    <div className="rounded-xl overflow-hidden border border-border bg-card shadow-md">
      <div className="relative">
        <Carousel opts={{ align: 'start', loop: true }} setApi={setCarouselApi} className="w-full">
          <CarouselContent className="ml-0">
            {sliderImages.map((item, index) => (
              <CarouselItem key={index} className="pl-0 basis-full">
                <div className="relative aspect-[3/1] min-h-[140px] sm:min-h-[180px]">
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${item.src})` }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                    <p className="text-white font-semibold text-sm sm:text-base drop-shadow-lg">
                      {item.title}
                    </p>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-2 sm:left-4 h-8 w-8 sm:h-9 sm:w-9 border-2 border-white/80 bg-[#06038D]/90 text-white hover:bg-[#06038D] hover:text-white" />
          <CarouselNext className="right-2 sm:right-4 h-8 w-8 sm:h-9 sm:w-9 border-2 border-white/80 bg-[#06038D]/90 text-white hover:bg-[#06038D] hover:text-white" />
        </Carousel>
      </div>
    </div>
  );
}
