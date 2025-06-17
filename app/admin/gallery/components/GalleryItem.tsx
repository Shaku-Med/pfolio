'use client'
import React, { useState } from 'react';
import Link from 'next/link';
import { Gallery } from '../../projects/page';
import {ErrorCard} from '@/app/posts/[id]/ErrorCard';
import NonHls from '@/app/contact/[id]/Body/components/FileHandler/NoNHls/NonHls';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface GalleryItemProps {
  gallery: Gallery;
}

interface FileData {
  type: string;
  url: string;
  thumbnail?: string[][];
}

const GalleryItem: React.FC<GalleryItemProps> = ({ gallery }) => {
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const renderMediaContent = (fileData: FileData, className?: string) => {
    if (fileData.type.startsWith('image')) {
      return (
        <NonHls 
          message={{
            file_object: {
              url: fileData.url,
              type: 'image/png',
              totalChunks: fileData.url?.length || 1
            },
            chat_id: `${gallery.id}`,
            user_id: `${gallery.user_id}`,
          }} 
          isPreview
          endpoint='/api/open/'
          className={cn(
            "absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110",
            className
          )}
        />
      );
    }

    const thumbnailUrl = fileData.thumbnail?.[0]?.[0]?.split('_').splice(0, 2).join('_') || '';
    return (
      <img 
        src={`/api/open/?url=${encodeURIComponent(thumbnailUrl)}&id=${gallery.user_id}&length=${fileData.thumbnail?.[0]?.length}&type=image/png`}
        alt={`${gallery.title} thumbnail`}
        className={cn(
          "absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110",
          className
        )}
      />
    );
  };

  const renderTags = () => {
    if (!gallery.tags?.length) return null;
    
    return gallery.tags.map((tag: string, index: number) => (
      <Badge 
        key={tag} 
        variant="secondary"
        className={cn(
          "mr-2 mb-2 transition-all duration-300 ease-out",
          "hover:scale-105 hover:shadow-lg",
          "bg-white/20 backdrop-blur-sm border-white/30 text-white",
          "hover:bg-white/30 hover:border-white/40",
          "animate-in fade-in slide-in-from-bottom-2"
        )}
        style={{ 
          animationDelay: `${index * 100}ms`,
          animationFillMode: 'both'
        }}
      >
        {tag}
      </Badge>
    ));
  };

  if (!gallery?.fileData) {
    return <ErrorCard title="Failed to Load" message="Gallery data is missing or invalid." />;
  }

  try {
    return (
      <Link 
        href={`/admin/gallery/${gallery.id}`}
        className="block w-full"
      >
        <div 
          className={cn(
            "relative w-full h-80 sm:h-96 md:h-[28rem] overflow-hidden rounded-xl",
            "group cursor-pointer transition-all duration-500 ease-out",
            "hover:shadow-2xl hover:shadow-black/25 hover:-translate-y-2",
            "animate-in fade-in slide-in-from-bottom-4 duration-700"
          )}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Background Image/Media */}
          <div className="absolute inset-0">
            {renderMediaContent(gallery.fileData)}
          </div>

          {/* Dark Overlay for better text readability */}
          <div className={cn(
            "absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent",
            "transition-opacity duration-300",
            isHovered ? "opacity-80" : "opacity-60"
          )} />

          {/* Glassy Content Overlay */}
          <div className={cn(
            "absolute inset-0 flex flex-col justify-end p-4 sm:p-6 md:p-8",
            "transition-all duration-300 ease-out"
          )}>
            
            {/* Main Content Container */}
            <div className={cn(
              "backdrop-blur-md bg-white/10 rounded-2xl p-4 sm:p-6 border border-white/20",
              "transition-all duration-500 ease-out",
              "hover:bg-white/15 hover:border-white/30",
              isHovered ? "translate-y-0 opacity-100" : "translate-y-2 opacity-95"
            )}>
              
              {/* Title */}
              <h3 className={cn(
                "text-white font-bold text-xl sm:text-2xl md:text-3xl mb-2",
                "transition-all duration-300",
                "group-hover:text-white/95",
                "drop-shadow-lg"
              )}>
                {gallery.title}
              </h3>

              {/* Description */}
              {gallery.description && (
                <p className={cn(
                  "text-white/90 text-sm sm:text-base md:text-lg mb-4",
                  "transition-all duration-300 leading-relaxed",
                  "group-hover:text-white",
                  "drop-shadow-md",
                  isHovered && "translate-x-1"
                )}>
                  {gallery.description}
                </p>
              )}

              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                {renderTags()}
              </div>
            </div>

            {/* Additional glassy accent */}
            <div className={cn(
              "absolute top-4 right-4 w-20 h-20 bg-white/5 rounded-full backdrop-blur-sm",
              "transition-all duration-500 ease-out",
              "border border-white/10",
              isHovered ? "scale-110 bg-white/10" : "scale-100"
            )} />
          </div>
        </div>
      </Link>
    );
  } catch (error) {
    console.error('Error rendering gallery item:', error);
    return <ErrorCard title="Failed to Load" message="An error occurred while rendering the gallery item." />;
  }
};

export default GalleryItem;