import React, { useContext } from 'react'
import { Connect } from '../../../Context/Context';
import About from '../About/About';
import T from '../Hero/Three/T';
import Project from '../Projects/Project';
import Resume from '../Resume/Resume';
import Contact from '../Contact/Contact';
import Hero from '../Hero/Hero';

function Prev({scroll}) {
    const { sh, setsh, pv, setpv } = useContext(Connect);

    return (
        <>
            <div className="aidnfaoi h-full">
                {
                    pv!== null && pv.includes('about') ? 
                        <About scroll={scroll} state={true} /> : 
                        pv!== null && pv.includes('project') ? 
                            <Project/> : 
                            pv!== null && pv.includes('resume') ? 
                                <Resume /> : 
                                 pv!== null && pv.includes('contact') ? 
                                    <Contact /> : 
                                    pv!== null && pv.includes('home') ? 
                                        <Hero /> : 
                                        <>
                                            <div className="aidfnoad text-[4rem] flex items-center justify-center">
                                                Wrong path.
                                            </div>
                                        </>
                }
                
          </div>
        </>
    );
}

export default Prev