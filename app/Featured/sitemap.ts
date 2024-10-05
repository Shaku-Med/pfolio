import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    let ft = await fetch(`https://medzyamara.dev/featured.json`, { cache: `no-store` })
    let dt = await ft.json()
    return dt.map((v: any) => (
        {
            url: `https://medzyamara.dev/Featured/${v.id}`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 1,
        }
    ))
}