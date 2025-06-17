import { MetadataRoute } from 'next'
import { DefaultObject } from '../DefaultObject'
import db from '@/lib/Database/Supabase/Base'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    try {
        if(!db) return []
        const { data: projects, error } = await db
            .from('projects')
            .select('id, title, description, date, programmingLanguages, thumbnail, sourceCodeLinks, previewLinks, status, featured, user_id, created_at')
            .order('created_at', { ascending: false })
            .limit(100)

        if(error) {
            console.error('Sitemap error:', error)
            return []
        }

        return projects.map((project) => ({
            url: `https://medzyamara.dev/projects/${project.id}`,
            lastModified: project.created_at ? new Date(project.created_at) : new Date(),
            changeFrequency: 'weekly' as const,
            priority: project.featured ? 0.9 : 0.7,
            title: project.title,
            description: project.description?.slice(0, 160) 
        }))
    }
    catch (error) {
        console.error('Sitemap generation failed:', error)
        return DefaultObject()
    }
}