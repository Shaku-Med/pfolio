import React from 'react'
import ContactHome from './components/Home/Home'
import SetToken from '../Auth/IsAuth/Token/SetToken'
import { headers } from 'next/headers'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    absolute: 'Contact Me - Mohamed Amara | Medzy Amara'
  },
  description: "Ready to collaborate? Get in touch with Mohamed Amara for AI development, cybersecurity consulting, full-stack web applications, or just to chat about tech. Whether you need a smart solution built, a security audit, or want to discuss your next big idea, I'm here to help turn your vision into reality.",
  keywords: [
    'Contact Mohamed Amara',
    'Hire Mohamed Amara',
    'AI developer contact',
    'cybersecurity consultant',
    'full stack developer hire',
    'software engineer contact',
    'Mohamed Amara collaboration',
    'tech consultation',
    'freelance developer',
    'student developer hire',
    'project collaboration',
    'Staten Island developer',
    'CUNY developer contact',
    'machine learning consultant',
    'web development services',
    'mobile app developer contact'
  ],
  authors: [{ name: 'Mohamed Amara' }],
  creator: 'Mohamed Amara',
  publisher: 'Mohamed Amara',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'Contact Me - Mohamed Amara | Let\'s Build Something Amazing',
    description: 'Ready to turn your ideas into reality? Contact Mohamed for AI development, cybersecurity solutions, full-stack applications, or tech consultation. Available for projects, collaborations, and exciting opportunities.',
    url: 'https://medzyamara.dev/contact',
    siteName: 'Mohamed Amara - Developer & Tech Consultant',
    images: [
      {
        url: `/Icons/web/OgImages/og-contact.png`,
        width: 1200,
        height: 630,
        alt: 'Contact Mohamed Amara - AI Developer & Security Expert',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Mohamed Amara | Your Next Tech Partner',
    description: 'Looking for an AI developer, security expert, or full-stack engineer? Let\'s connect and discuss how we can bring your project to life with clean code and innovative solutions.',
    images: ['/Icons/web/OgImages/og-contact.png'],
    creator: '@medzyamara',
    site: '@medzyamara',
  },
  alternates: {
    canonical: 'https://medzyamara.dev/contact',
  },
  category: 'Contact Information',
  classification: 'Contact Page',
  other: {
    'profile:first_name': 'Mohamed',
    'profile:last_name': 'Amara',
    'profile:username': 'medzyamara',
    'business:contact_data:locality': 'Staten Island',
    'business:contact_data:region': 'New York',
    'business:contact_data:country_name': 'United States',
  }
 }
const page = async () => {
  let h = await headers()
  let token = await SetToken({
    expiresIn: `1h`,
    algorithm: `HS512`,
  })

  return (
    <>
      <ContactHome token={token}/>
    </>
  )
}

export default page
