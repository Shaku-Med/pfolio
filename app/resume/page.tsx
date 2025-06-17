import React from 'react'
import ClientResume from './Client/ClientResume'
import { Metadata } from 'next'

export const metadata: Metadata = {
 title: {
   absolute: `Resume/CV - Mohamed Amara`
 },
 description: `Meet Mohamed Amara - a multi-talented developer who builds everything from AI-powered apps to bulletproof security systems. Whether it's web, mobile, desktop, or teaching machines to be smart, I turn complex problems into elegant solutions (and occasionally into dad jokes during standups).`,
 keywords: ['Mohamed Amara resume', 'AI Engineer', 'Machine Learning Engineer', 'Cybersecurity Expert', 'Full Stack Developer', 'Mobile App Developer', 'Desktop Application Developer', 'Software Engineer', 'Web Developer', 'React Developer', 'Next.js Expert', 'TypeScript Master', 'Python AI Developer', 'Security Engineer', 'Cross-platform Developer', 'Flutter Developer', 'React Native Developer', 'Electron Developer', 'Neural Networks', 'Deep Learning', 'Penetration Testing', 'Ethical Hacker', 'Cloud Security', 'DevSecOps', 'tech polyglot', 'hire me please'],
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
   title: 'Resume/CV - Mohamed Amara | AI Whisperer & Security Guardian',
   description: 'Meet Mohamed - a versatile developer who builds AI models that actually work, secures systems like Fort Knox, and creates apps for every platform imaginable. From neural networks to mobile apps, from web security to desktop software - I speak all the languages (coding ones, mostly).',
   url: 'https://medzyamara.dev/resume',
   siteName: 'Mohamed Amara - Full-Stack Everything Developer',
   images: [
     {
       url: `/Icons/web/OgImages/og-resume.png`,
       width: 1200,
       height: 630,
       alt: 'Mohamed Amara Resume - AI Engineer, Security Expert & Multi-Platform Developer',
     },
   ],
   locale: 'en_US',
   type: 'profile',
 },
 twitter: {
   card: 'summary_large_image',
   title: 'Resume/CV - Mohamed Amara | The Swiss Army Knife of Developers',
   description: 'AI Engineer, Cybersecurity Expert & Full-Stack Developer who builds intelligent, secure, and user-friendly applications across all platforms. Currently teaching machines to be smart while keeping hackers at bay.',
   images: ['/Icons/web/OgImages/og-resume.png'],
   creator: '@medzyamara',
   site: '@medzyamara',
 },
 alternates: {
   canonical: 'https://medzyamara.dev/resume',
 },
 category: 'Professional Resume (Now With Extra Superpowers)',
 classification: 'Resume',
 other: {
   'profile:first_name': 'Mohamed',
   'profile:last_name': 'Amara',
   'profile:username': 'medzyamara',
 }
}

const page = () => {
 return (
   <>
     <ClientResume/>
   </>
 )
}

export default page