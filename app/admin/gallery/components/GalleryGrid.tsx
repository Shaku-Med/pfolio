'use client'
import React, { useEffect, useRef, useState, Suspense } from 'react';
import GalleryItem from './GalleryItem';
import { Gallery } from '@/app/admin/projects/page';
import { Loader2, Plus } from 'lucide-react';
import FallBackLoad from './FallBackLoad';
import Link from 'next/link';
import { Button } from "@/components/ui/button";

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-16 space-y-6">
    <div className="text-center space-y-2">
      <h3 className="text-2xl font-semibold tracking-tight">Gallery not found</h3>
      <p className="text-muted-foreground">Get started by adding your first gallery item</p>
    </div>
    <Button asChild>
      <Link href="/admin/gallery/new" className="gap-2">
        <Plus className="w-4 h-4" />
        Add Item
      </Link>
    </Button>
  </div>
);

interface GalleryGridProps {
  initialItems: Gallery[];
  loadMore: (page: number) => Promise<Gallery[]>;
}

const GalleryGrid: React.FC<GalleryGridProps> = ({ initialItems, loadMore }) => {
  const [items, setItems] = useState<Gallery[]>(initialItems);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      async (entries) => {
        if (entries[0].isIntersecting && !loading && hasMore) {
          setLoading(true);
          const nextPage = page + 1;
          const newItems = await loadMore(nextPage);
          
          if (newItems.length === 0) {
            setHasMore(false);
          } else {
            setItems(prev => [...prev, ...newItems]);
            setPage(nextPage);
          }
          setLoading(false);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [page, loading, hasMore, loadMore]);

  return (
    <div className="container mx-auto px-4">
      <Suspense fallback={<FallBackLoad />}>
        {items.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items?.map((item, key) => (
              <GalleryItem
                key={key}
                gallery={item}
              />
            ))}
          </div>
        )}
      </Suspense>
      
      {/* Loading indicator and observer target */}
      <div ref={observerTarget} className="h-10 flex items-center justify-center mt-8">
        {loading && (
          <Loader2 className='w-8 h-8 animate-spin'/>
        )}
      </div>
    </div>
  );
};

export default GalleryGrid; 