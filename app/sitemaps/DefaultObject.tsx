import { MetadataRoute } from 'next'

export const DefaultObject = (): MetadataRoute.Sitemap => {
    return [
        {
            url: 'https://medzyamara.dev',
            lastModified: new Date(),
            changeFrequency: 'yearly' as const,
            priority: 1,
        },
        {
            url: 'https://medzyamara.dev/about',
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        },
        {
            url: 'https://medzyamara.dev/projects',
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        },
        {
            url: 'https://medzyamara.dev/contact',
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        },
        {
            url: 'https://medzyamara.dev/posts',
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.7,
        },
        {
            url: 'https://medzyamara.dev/gallery',
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.7,
        },
        {
            url: 'https://medzyamara.dev/download',
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.6,
        },
        {
            url: 'https://medzyamara.dev/music',
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.7,
        },
        {
            url: 'https://medzyamara.dev/resume',
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.8,
        },
        {
            url: 'https://medzyamara.dev/experience',
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        },
        {
            url: 'https://medzyamara.dev/skills',
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.8,
        }
    ]
}