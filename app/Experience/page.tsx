import React from 'react'
import Resume from '../components/Pages/Home/Resume/Resume'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: ` My Experience || Mohamed Amara`,
    description: `Database System & Cyber Security Intern (CodePath) & Computer Lab Assistant`,
    openGraph: {
        description: "Database System & Cyber Security Intern (CodePath) & Computer Lab Assistant",
        images: [
            {
                url: `https://medzyamara.com/me1.jpg`,
            }
        ],
        title: "Medzy Amara | Portfolio",
    },
    twitter: {
        site: "@medzyamara",
        card: "summary_large_image",
        images: [
            {
                url: `https://medzyamara.com/me1.jpg`,
            }
        ]
    },
    icons: [
        {
            rel: `apple-touch-icon`,
            url: `https://medzyamara.com/me1.jpg`,
            type: `image/png`
        },
        {
            rel: `apple-touch-icon-pre`,
            url: `https://medzyamara.com/me1.jpg`,
            type: `image/png`
        }
    ],
}

const page = () => {
    return (
        <>
            <div className="clsmbd fixed top-0 left-0 overflow-auto w-full h-full ">
                <Resume />
            </div>
        </>
    )
};

export default page
