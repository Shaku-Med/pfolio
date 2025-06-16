import { Metadata } from 'next'
import { baseUrl } from './Url'

const SEO = (): Metadata => {
  return {
    metadataBase: new URL(`${baseUrl}`),
    title: {
      default: 'Mohamed Amara - Software Developer & AI Engineer',
      template: '%s | Mohamed Amara'
    },
    description: 'Software Developer and Computer Science student at College of Staten Island. Specializing in AI/ML development, web applications, mobile apps, and desktop solutions. Available for hire.',
    applicationName: 'Mohamed Amara Portfolio',
    keywords: [
      'Mohamed Amara', 'software developer', 'AI engineer', 'machine learning', 'web development',
      'mobile development', 'desktop applications', 'College of Staten Island', 'computer science',
      'full stack developer', 'AI training', 'machine learning models', 'software engineering',
      'freelance developer', 'hire developer', 'portfolio', 'React', 'Next.js', 'Python',
      'JavaScript', 'TypeScript', 'artificial intelligence', 'data science', 'app development'
    ],
    authors: [{ name: 'Mohamed Amara', url: `${baseUrl}` }],
    creator: 'Mohamed Amara',
    publisher: 'Mohamed Amara',
    category: 'Technology',
    classification: 'Portfolio Website',
    referrer: 'origin-when-cross-origin',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    robots: {
      index: true,
      follow: true,
      nocache: false,
      googleBot: {
        index: true,
        follow: true,
        noimageindex: false,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: `${baseUrl}`,
      languages: {
        'en-US': `${baseUrl}`,
        'en': `${baseUrl}/en`,
        'x-default': `${baseUrl}`,
      },
      media: {
        'only screen and (max-width: 600px)': `${baseUrl}/mobile`,
      },
      types: {
        'application/rss+xml': `${baseUrl}/rss.xml`,
      },
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: `${baseUrl}`,
      siteName: 'Mohamed Amara Portfolio',
      title: 'Mohamed Amara - Software Developer & AI Engineer',
      description: 'Computer Science student and Software Developer specializing in AI/ML, web development, and cross-platform applications. Available for exciting projects and opportunities.',
      emails: ['medzyamara@gmail.com'],
      countryName: 'United States',
      ttl: 604800,
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: 'Mohamed Amara - Software Developer Portfolio',
          type: 'image/png',
          secureUrl: `${baseUrl}/og-image.png`,
        },
        {
          url: '/Icons/web/profile-photo.jpg',
          width: 512,
          height: 512,
          alt: 'Mohamed Amara Profile Photo',
          type: 'image/jpeg',
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Mohamed Amara - Software Developer & AI Engineer',
      description: 'CS student at College of Staten Island. Building AI solutions, web apps, and cross-platform applications. Let\'s connect!',
      creator: '@medzyamara',
      site: '@medzyamara',
      images: {
        url: '/og-image.png',
        alt: 'Mohamed Amara Developer Portfolio',
        width: 1200,
        height: 630,
      },
    },
    appLinks: {
      web: {
        url: `${baseUrl}`,
        should_fallback: true,
      },
    },
    archives: [`${baseUrl}/projects`],
    assets: [`${baseUrl}/assets`],
    bookmarks: [`${baseUrl}/bookmarks`],
    manifest: 'manifest.json',
    appleWebApp: {
      capable: true,
      title: 'Mohamed Amara',
      statusBarStyle: 'black-translucent',
      startupImage: [
        {
          url: '/Icons/web/apple-touch-startup-image-768x1004.png',
          media: '(device-width: 768px) and (device-height: 1024px)',
        },
        {
          url: '/Icons/web/apple-touch-startup-image-1536x2008.png',
          media: '(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)',
        },
      ],
    },
    abstract: 'Mohamed Amara is a Software Developer and Computer Science student specializing in AI/ML development and cross-platform applications.',
    other: {
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'black-translucent',
      'mobile-web-app-capable': 'yes',
      'msapplication-TileImage': '/Icons/web/icon-144.png',
      'msapplication-config': '/Icons/web/browserconfig.xml',
      'color-scheme': 'light dark',
      'supported-color-schemes': 'light dark',
      'rating': 'general',
      'distribution': 'global',
      'revisit-after': '7 days',
      'language': 'EN',
      'target': 'all',
      'audience': 'all',
      'coverage': 'Worldwide',
      'directory': 'submission',
      'copyright': '© 2025 Mohamed Amara. All rights reserved.',
      'designer': 'Mohamed Amara',
      'owner': 'Mohamed Amara',
      'url': baseUrl,
      'identifier-URL': baseUrl,
      'shortlink': baseUrl,
      'pagename': 'Mohamed Amara Portfolio',
      'HandheldFriendly': 'True',
      'MobileOptimized': '320',
      'article:author': 'Mohamed Amara',
      'profile:first_name': 'Mohamed',
      'profile:last_name': 'Amara',
      'profile:username': 'MohamedAmara',
      'skills': 'Software Development, AI/ML, Web Development, Mobile Development, Desktop Applications',
      'education': 'College of Staten Island',
      'availability': 'Available for hire',
      'location': 'Staten Island, New York',
    },
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: 'any' },
        { url: '/Icons/web/icon-192.png', type: 'image/png', sizes: '192x192' },
        { url: '/Icons/web/icon-512.png', type: 'image/png', sizes: '512x512' }
      ],
      apple: [
        { url: '/Icons/web/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
        { url: '/Icons/web/icon-192-maskable.png', sizes: '192x192', type: 'image/png' },
        { url: '/Icons/web/icon-512-maskable.png', sizes: '512x512', type: 'image/png' }
      ],
      other: [
        { rel: 'mask-icon', url: '/Icons/web/safari-pinned-tab.svg', color: '#000000' }
      ]
    }
  }
}

export default SEO