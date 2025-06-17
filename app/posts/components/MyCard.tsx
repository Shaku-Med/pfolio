'use client'
import React, { useCallback, useLayoutEffect, useState } from 'react'
import ImageCard from '@/components/ui/ImageCard'
import { Admin } from '@/app/contact/[id]/context/types'
import { Loader2 } from 'lucide-react'
import getPostServer from './getPostServer'
import { Post } from '../[id]/utils'

interface Paginations {
  currentPage: number,
  itemsPerPage: number,
  from: number,
  to: number,
  lastPostId: string
}

const MyCard = ({post, adminData, paginations}: {post: Post[], adminData: Admin, paginations: Paginations}) => {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [currentPagination, setCurrentPagination] = useState<Paginations>(paginations)

  const loadMorePosts = async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    try {
      const newPagination = {
        ...currentPagination,
        from: currentPagination.to + 1,
        to: currentPagination.to + currentPagination.itemsPerPage,
        currentPage: currentPagination.currentPage + 1
      };
      
      const newPosts = await getPostServer(newPagination);
      if (newPosts && newPosts.length > 0) {
        setPosts(prev => [...prev, ...newPosts]);
        setCurrentPagination(newPagination);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading more posts:', error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  const handleScrolling = useCallback(() => {
    if (
      window.innerHeight + document.documentElement.scrollTop
      === document.documentElement.offsetHeight
    ) {
      loadMorePosts();
    }
  }, [currentPagination, loading, hasMore]);

  useLayoutEffect(() => {
    setPosts(post);
    window.addEventListener('scroll', handleScrolling, {passive: true});
    return () => {
      window.removeEventListener('scroll', handleScrolling);
    };
  }, [post, handleScrolling]);

  return (
    <>
      <div className={`flex items-center justify-center gap-4 flex-col py-10`}>
        {posts?.map((post: Post, index: number) => (
          <ImageCard
            key={post.id || index}
            type={`image`}
            post={post}
            admin={adminData}
            routeURL={`/posts`}
          />
        ))}
        {loading && (
          <div className={`flex items-center justify-center gap-4`}>
            <Loader2 className={`animate-spin`} size={20} />
          </div>
        )}
        {!hasMore && posts.length > 0 && (
          <div className={`flex items-center justify-center gap-4 text-muted-foreground`}>
            No more posts to show
          </div>
        )}
        {posts?.length < 1 && !loading && (
          <div className={`flex items-center justify-center gap-4`}>
            <p>No posts found</p>
          </div>
        )}
      </div>
    </>
  )
}

export default MyCard
