import React from 'react'
import About from '../components/Pages/Home/About/About'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: `About Me || Mohamed Amara`,
    description: `Hey there! I'm Mohamed, and I love creating stuff that lives on devices and the internet. My journey into software development kicked off in 2019 during the COVID-19 pandemic. I began with Python and, over time, explored various areas, getting hooked on programming. This curiosity led me to dive into app development, web development, and machine learning.`,
    openGraph: {
        description: `Hey there! I'm Mohamed, and I love creating stuff that lives on devices and the internet. My journey into software development kicked off in 2019 during the COVID-19 pandemic. I began with Python and, over time, explored various areas, getting hooked on programming. This curiosity led me to dive into app development, web development, and machine learning.`,
        images: [
            {
                url: `https://medzyamara.com/me1.jpg`,
            }
        ],
        title: `Medzy Amara | Portfolio`,
    },
    twitter: {
        site: `@medzyamara`,
        card: `summary_large_image`,
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
            <div className="clsmbd fixed top-0 left-0 overflow-auto w-full h-full">
                <About />
            </div>
        </>
    )
};

export default page
