import Footer from '@/app/components/Pages/Footer/Footer'
import Item from '@/app/components/Pages/Home/Projects/Item'
import { Metadata, ResolvingMetadata } from 'next'
import Link from 'next/link'
import React from 'react'


type Props = {
    params: { id: string }
    searchParams: { [key: string]: string | string[] | undefined }
}

type Project = {
    id: number;
    featured: boolean;
    ranking: number;
};

const fnc = async (
    featured: boolean,
    id: string | number | undefined,
    projects: Project[]
): Promise<Project[]> => {
    try {
        const response = await fetch(`https://medzyamara.com/featured.json`, { cache: 'no-store' });
        const data: Project[] = await response.json();

        if (data) {
            if (featured) {
                if (id) {
                    const parsedId = typeof id === 'string' ? parseInt(id) : id;
                    const filteredProject = data.find((project) => project.id === parsedId && project.featured);
                    if (filteredProject) {
                        return [filteredProject];
                    } else {
                        return [];
                    }
                } else {
                    return data.filter((project) => project.featured).sort((a, b) => a.ranking - b.ranking);
                }
            } else {
                return []
            }
        } else {
            return [];
        }
    } catch {
        return [];
    }

    return [];
};

export async function generateMetadata(
    { params, searchParams }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const id = params.id
    let projects: Project[] = []
    let d = await fnc(true, id, projects)
    // 
    if (d.length > 0) {
        return {
            title: `${d[0].title} | Medzy Amara`,
            description: `${d[0].description}`,
            openGraph: {
                description: `${d[0].description}`,
                images: [
                    {
                        url: `https://medzyamara.com/${d[0].image.src.split('../')[1]}`,
                    }
                ],
                title: `${d[0].title} | Medzy Amara`,
            },
            twitter: {
                title: `${d[0].title} | Medzy Amara`,
                description: `${d[0].description}`,
                site: "@medzyamara",
                card: "summary_large_image",
                images: [
                    {
                        url: `https://medzyamara.com/${d[0].image.src.split('../')[1]}`,
                    }
                ]
            },
        }
    }
    else {
        return {
            title: `Featured Project`
        }
    }
}

export default async function ({ params }: any) {
    return (
        <>
            <div className="clsmbd fixed top-0 left-0 overflow-auto w-full h-full">
                <Item id={params.id} projects={false} featured={true} />
                <Footer />
            </div>
        </>
    )
}