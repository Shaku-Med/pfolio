import Link from 'next/link'
import React from 'react'
import Project from '../components/Pages/Home/Projects/Project'
import { Metadata } from 'next'
import Footer from '../components/Pages/Footer/Footer'

export const metadata: Metadata = {
    title: `Things I've Worked On || Featured Projects`,
    description: `This section showcases a selection of my notable projects and accomplishments. Explore my portfolio to see what I've created and achieved.`
}
const PG = ({ params }: any) => {
    return (
        <>
            <div className="clsmbd fixed top-0 left-0 overflow-auto w-full h-full ">
                <Project />
                <Footer />
            </div>
        </>
    )
}

export default PG
