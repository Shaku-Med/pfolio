import Hero from './Hero/Hero'
import About from './About/About'
import Project from './Projects/Project'
import Contact from './Contact/Contact'
import Resume from './Resume/Resume'
import Footer from '../Footer/Footer'
import { gsap } from 'gsap'
import {v4 as uuid} from 'uuid'
import Objects from '@/app/Functions/Object'
import { headers } from 'next/headers'
// import { AnimatePresence } from 'framer-motion'
// 
export default async function Home() {

    let au = headers().get('user-agent').split(/\s+/).join('')
    let uid = uuid().split('-').join('').toUpperCase()
    let obS = {
        uid: au,
    }
    
    let h = Objects.encDec(JSON.stringify(obS), `${au}+${process.env.API_Y}+${uid}`)

    return (
        <>
            {/* <AnimatePresence> */}
                {/* <div className="aidfnoda gScroll overflow-x-hidden h-full w-full overflow-y-auto"> */}
                    <div id='home' className="aidfndoaii  scls snap-start h-full w-full">
                        <Hero />
                    </div>
                    <div id="about" className="ianfdodnoa scls snap-start">
                        <About />
                    </div>
                    <div id="experience" className="aidfnoad scls snap-start">
                        <Resume />
                    </div>
                    <div id='project' className="aidfnoad snap-start nc_bg">
                        <Project />
                    </div>
                    <div id='contact' className="aidfnoad snap-start ">
                        <Contact sid={uid} h={h} />
                    </div>
                    <div class="flex flex-col space-y-4 w-full max-w-lg p-6">
                    <div class="text-lg font-medium text-gray-800">Do you know I do music too?</div>
                    <div class="w-full overflow-hidden shadow-lg rounded-xl">
                        <iframe 
                        src="https://open.spotify.com/embed/artist/0n7maaPRkmcz9CEJupVCT1?utm_source=generator" 
                        width="100%" 
                        height="152" 
                        frameBorder="0" 
                        allowFullScreen 
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                        loading="lazy"
                        style="border-radius: 12px;"
                        ></iframe>
                    </div>
                    </div>
                    <div id='footer' className="aidfnoad snap-start ">
                        <Footer />
                    </div>
                {/* </div> */}
            {/* </AnimatePresence> */}
        </>
    );
}