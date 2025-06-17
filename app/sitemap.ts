import { MetadataRoute } from 'next'
import { DefaultObject } from './sitemaps/DefaultObject'

export default function sitemap(): MetadataRoute.Sitemap {
    return DefaultObject()
}