import { MetadataRoute } from 'next'
import { DefaultObject } from '../DefaultObject'
import db from '@/lib/Database/Supabase/Base'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    try {
        if(!db) return []
        const { data: skills, error } = await db
            .from('skills')
            .select('id, name, description, level, created_at')
            .order('created_at', { ascending: false })

        if(error) {
            console.error('Skills sitemap error:', error)
            return []
        }

        return skills.map((skill) => ({
            url: `https://medzyamara.dev/skills/${skill.id}`,
            lastModified: new Date(skill.created_at),
            changeFrequency: 'monthly' as const,
            priority: skill.level >= 80 ? 0.9 : 0.7,
            title: skill.name,
            description: skill.description?.slice(0, 160)
        }))
    }
    catch (error) {
        console.error('Skills sitemap generation failed:', error)
        return DefaultObject()
    }
}