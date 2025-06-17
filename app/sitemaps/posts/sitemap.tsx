import { MetadataRoute } from 'next'
import { DefaultObject } from '../DefaultObject'
import db from '@/lib/Database/Supabase/Base'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    try {
        if(!db) return []
        const { data: posts, error } = await db
            .from('posts')
            .select('id, text, description, created_at, updated_at, views, likes, comments, shares')
            .order('created_at', { ascending: false })
            .limit(100)

        if(error) {
            console.error('Sitemap error:', error)
            return []
        }

        return posts.map((post) => ({
            url: `https://medzyamara.dev/posts/${post.id}`,
            lastModified: post.updated_at ? new Date(post.updated_at) : new Date(post.created_at),
            changeFrequency: 'weekly' as const,
            priority: post.views > 1000 ? 0.9 : 0.7,
            title: post.text?.slice(0, 60),
            description: post.description?.slice(0, 160)
        }))
    }
    catch (error) {
        console.error('Sitemap generation failed:', error)
        return DefaultObject()
    }
}