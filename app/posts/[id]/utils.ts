import { format } from 'date-fns'

export const formatDate = (dateString: string): string => {
  try {
    return format(new Date(dateString), 'MMMM dd, yyyy • h:mm a')
  } catch (error) {
    console.error('Error formatting date:', error)
    return 'Unknown date'
  }
}

export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

export interface Post {
  id: string;
  text: string;
  location: string;
  post_file: any[];
  description: string;
  long_description?: string;
  tags: string[];
  likes: number;
  comments: number;
  shares: number;
  views: number;
  created_at: string;
  updated_at: string;
  author?: {
    name: string;
    avatar?: string;
  };
  user_id?: string;
  post_likes?: {
    user_id: string;
  }[];
} 