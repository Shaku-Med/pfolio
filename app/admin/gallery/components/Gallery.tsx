'use client'
import React from 'react';
import GalleryGrid from './GalleryGrid';
import { Gallery } from '@/app/admin/projects/page';
import LoadMoreImage from './Action/LoadMoreImage';

interface GalleryComponentProps {
  initialItems: Gallery[];
  itemsPerPage?: number;
}

const GalleryComponent: React.FC<GalleryComponentProps> = ({ initialItems, itemsPerPage = 12 }) => {
  const loadMore = async (page: number) => {
    const from = (page - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;
    
    let galleries = await LoadMoreImage(itemsPerPage, from, to)
    return galleries || []
  };

  return (
    <div className="py-8">
      <GalleryGrid initialItems={initialItems} loadMore={loadMore} />
    </div>
  );
};

export default GalleryComponent; 