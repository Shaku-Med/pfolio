'use server'

import { getPost } from "@/app/about/page";
import db from "@/lib/Database/Supabase/Base"
import { Post } from "../[id]/utils";

interface Paginations {
    currentPage: number,
    itemsPerPage: number,
    from: number,
    to: number,
    lastPostId: string
}

const getPostServer = async (paginations: Paginations): Promise<Post[] | null> => {
  try {
    if(!db) return null;
    const posts = await getPost(4, [`id`, `text`, `location`, `post_file`, `description`, `tags`, `likes`, `comments`, `shares`, `views`, `user_id`, `created_at`, `updated_at`], {
      from: paginations.from,
      to: paginations.to
    });
    
    return (posts as unknown) as Post[];
  } catch (error) {
    return null;
  }
}

export default getPostServer
