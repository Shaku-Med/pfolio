import { MetadataRoute } from 'next'
import { DefaultObject } from '../DefaultObject'
import db from '@/lib/Database/Supabase/Base'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    try {
        if(!db) return []
        const { data: galleries, error } = await db
            .from('gallery')
            .select('id, title, description, tags, fileData, created_at, user_id')
            .order('created_at', { ascending: false })
            .limit(100)

        if(error) {
            console.error('Sitemap error:', error)
            return []
        }

        return galleries.map((gallery) => ({
            url: `https://medzyamara.dev/gallery/${gallery.id}`,
            lastModified: gallery.created_at ? new Date(gallery.created_at) : new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.7,
            title: gallery.title,
            description: gallery.description?.slice(0, 160) 
        }))
    }
    catch (error) {
        console.error('Sitemap generation failed:', error)
        return DefaultObject()
    }
}