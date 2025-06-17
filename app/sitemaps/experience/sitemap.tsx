import { MetadataRoute } from 'next'
import { DefaultObject } from '../DefaultObject'
import db from '@/lib/Database/Supabase/Base'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    try {
        if(!db) return []
        const { data: experiences, error } = await db
            .from('experience')
            .select('id, title, sub_title, company, position, start, end, is_present, description, location, type, created_at')
            .order('created_at', { ascending: false })

        if(error) {
            console.error('Experience sitemap error:', error)
            return []
        }

        return experiences.map((exp) => ({
            url: `https://medzyamara.dev/experience/${exp.id}`,
            lastModified: new Date(exp.created_at),
            changeFrequency: 'monthly' as const,
            priority: exp.is_present ? 0.9 : 0.7,
            title: `${exp.position} at ${exp.company}`,
            description: exp.description?.slice(0, 160) || `${exp.position} at ${exp.company} - ${exp.sub_title}`
        }))
    }
    catch (error) {
        console.error('Experience sitemap generation failed:', error)
        return DefaultObject()
    }
}