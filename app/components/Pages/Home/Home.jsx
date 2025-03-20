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
                    <div className='aidfnoad snap-start border-t'>
                       
                    <div class="flex flex-col space-y-6 w-full max-w-lg p-6">
                        <div class="space-y-2">
                            <h2 class="text-xl font-semibold text-gray-800">My Musical Journey</h2>
                            <p class="text-gray-600">Do you know I do music too? Check out my latest tracks and follow me to stay updated on new releases.</p>
                        </div>
                        
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
                        
                        <div class="flex items-center justify-between">
                            <div class="flex items-center space-x-2">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
                            </svg>
                            <span class="text-sm text-gray-600">New tracks released monthly</span>
                            </div>
                            <a href="https://open.spotify.com/artist/0n7maaPRkmcz9CEJupVCT1" target='_blank' class="text-sm font-medium text-gray-800 hover:text-gray-600">View more</a>
                        </div>
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