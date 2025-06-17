import React from 'react'
import About from '@/app/about/components/About';
import { getExperience, getFeaturedProjects, getSkills } from '@/app/about/components/GetInfos';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    absolute: `About Me - Mohamed Amara`
  },
  keywords: ['Mohamed Amara', 'Mohamed Amara Portfolio', 'Mohamed Amara About', 'Computer Science Student', 'CUNY Staten Island', 'AI Developer', 'Cybersecurity Expert', 'Full Stack Developer', 'Machine Learning Engineer', 'Software Engineer', 'Open Source Contributor', 'Tech Mentor', 'Python Developer', 'Web Developer', 'Clean Code Enthusiast', 'Staten Island Developer', 'Student Developer', 'Tech News Enthusiast'],
  description: `Meet Mohamed Amara - a Computer Science student at CUNY Staten Island who accidentally learned to code during the pandemic and got really good at it. Specializing in AI, cybersecurity, and full-stack development, I spend my days making computers do things they probably don't want to do (and call it software development). When I'm not writing clean code or mentoring fellow students, you'll find me diving into tech news, contributing to open-source projects, or fueling my coding sessions with coffee. Currently building smart and secure applications while figuring out how to make the digital world a little bit better, one line of code at a time.`,
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
    title: 'About Me - Mohamed Amara | Computer Science Student & AI Developer',
    description: 'Meet Mohamed - a Computer Science student who accidentally became a software developer during the pandemic. Now specializing in AI, cybersecurity, and full-stack development while mentoring fellow students and contributing to open-source projects.',
    url: 'https://medzyamara.dev/about',
    siteName: 'Mohamed Amara - Student Developer & Tech Enthusiast',
    images: [
      {
        url: `/Icons/web/OgImages/og-about.png`,
        width: 1200,
        height: 630,
        alt: 'About Mohamed Amara - Computer Science Student & AI Developer',
      },
    ],
    locale: 'en_US',
    type: 'profile',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Me - Mohamed Amara | The Accidental Developer',
    description: 'Computer Science student turned AI & cybersecurity enthusiast. Building smart, secure applications while helping fellow developers and contributing to open-source projects.',
    images: ['/Icons/web/OgImages/og-about.png'],
    creator: '@medzyamara',
    site: '@medzyamara',
  },
  alternates: {
    canonical: 'https://medzyamara.dev/about',
  },
  category: 'About Page',
  classification: 'Personal Profile',
  other: {
    'profile:first_name': 'Mohamed',
    'profile:last_name': 'Amara',
    'profile:username': 'medzyamara',
    'article:author': 'Mohamed Amara',
    'article:section': 'About',
  }
 }

const page = async () => {
  let featuredProjects = await getFeaturedProjects(4, ['id', 'title', 'description', 'technologies', 'previewLinks', 'sourceCodeLinks', 'programmingLanguages', 'status', 'featured', 'view', 'comments', 'date', 'thumbnail', 'user_id']);
  let experience = await getExperience(4, ['id', 'title', 'sub_title', 'company', 'position', 'start', 'end', 'is_present', 'description']);
  let skills = await getSkills(4, ['id', 'name', 'color', 'level']);

  return (
    <>
      <About experience={experience} projects={featuredProjects} skills={skills}/>
    </>
  )
}

export default page
