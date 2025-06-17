import { getPost } from "@/app/about/components/GetInfos"
import { ErrorCard } from "./[id]/ErrorCard"

import db from "@/lib/Database/Supabase/Base";
import { Post } from "./[id]/utils"
import { Admin } from "@/app/contact/[id]/context/types"
import MyCard from "./components/MyCard";
import { Metadata } from "next";


export const metadata: Metadata = {
  title: {
    absolute: 'Posts - Mohamed Amara | Medzy Amara'
  },
  description: "Dive into Mohamed Amara's thoughts on AI development, cybersecurity trends, software engineering best practices, and the latest in tech. From machine learning insights to coding tutorials, security tips to industry observations - join me on my journey through the ever-evolving world of technology.",
  keywords: [
    'Mohamed Amara blog',
    'AI development blog',
    'cybersecurity insights',
    'software engineering posts',
    'machine learning articles',
    'tech blog',
    'coding tutorials',
    'programming insights',
    'computer science blog',
    'developer thoughts',
    'tech trends',
    'security best practices',
    'full stack development blog',
    'student developer blog',
    'CUNY tech blog',
    'Staten Island developer blog',
    'open source insights',
    'tech mentorship',
    'clean code practices',
    'industry observations'
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
    title: 'Posts - Mohamed Amara | Tech Insights & Developer Stories',
    description: 'Explore Mohamed\'s latest thoughts on AI, cybersecurity, software development, and tech trends. From practical tutorials to industry insights, discover perspectives from a student developer\'s journey.',
    url: 'https://medzyamara.dev/posts',
    siteName: 'Mohamed Amara - Developer Blog',
    images: [
      {
        url: `/Icons/web/OgImages/og-posts.png`,
        width: 1200,
        height: 630,
        alt: 'Mohamed Amara Blog Posts - AI, Security & Development Insights',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Posts - Mohamed Amara | Where Code Meets Commentary',
    description: 'Follow Mohamed\'s journey through AI development, cybersecurity, and software engineering. Real insights from a student developer navigating the tech world.',
    images: ['/Icons/web/OgImages/og-posts.png'],
    creator: '@medzyamara',
    site: '@medzyamara',
  },
  alternates: {
    canonical: 'https://medzyamara.dev/posts',
  },
  category: 'Technology Blog',
  classification: 'Blog',
  other: {
    'profile:first_name': 'Mohamed',
    'profile:last_name': 'Amara',
    'profile:username': 'medzyamara',
    'article:author': 'Mohamed Amara',
    'article:section': 'Technology',
    'blog:author': 'Mohamed Amara',
  }
 }

const page = async () => {
  try {
    if(!db) return <ErrorCard title="Error" message="Connection failed!" />
    // 
    const currentPage = 1;
    const itemsPerPage = 6;
    const from = (currentPage - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;
    // 
    let posts = await getPost(4, [`id`, `text`, `location`, `post_file`, `description`, `tags`, `likes`, `comments`, `shares`, `views`, `user_id`, `created_at`, `updated_at`], {from, to})
    if(!posts || posts.length === 0) return <ErrorCard title="Error" message="No posts found" />
    // 
    let {data: admin, error: adminError} = await db.from('admin').select('*')
    if(adminError || !admin) return <ErrorCard title="Error" message={`Looks like there's no owner of this website!`} />
    let adminData = (admin[0] as unknown) as Admin
    // 

    // console.log(from)

    let paginations = {
      currentPage,
      itemsPerPage,
      from,
      to,
      lastPostId: ((posts as unknown) as Post[])[posts.length - 1]?.id?.toString() || ''
    }

    return (
      <>
        <MyCard paginations={paginations} post={(posts as unknown) as Post[]} adminData={adminData} />
      </>
    )
  }
  catch {
    return <ErrorCard title="Error" message="Something went wrong" />
  }
}

export default page
