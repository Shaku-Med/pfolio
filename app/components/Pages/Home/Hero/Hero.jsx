import React from 'react'
import DBTN from '../../../CV/DBTN';
import Logo from '@/app/Logo'
import StarField from './StarField'
// 
let Hero = () => {
    let t = Math.floor(Math.random() * (6 - 1 + 1))
    return (
        <div id='home' className={`aidnodfnoda flex h-full w-full bd relative`}>
            <div className="starWars absolute top-0 left-0 w-full h-full">
                <StarField gid={`starfield`} />
            </div>
            {/*  */}
            <div className={`containerSquiz transition-all min-[1400px]:scale-[1.1] relative w-full max-w-[1100px] transition-all min-[1400px]:max-w-[70%] flex items-center justify-between max-[800px]:flex-col mainHITE max-[800px]:mt-20 max-[600px]:mt-12 max-[800px]:p-5 p-10`}>
                <div className="LMnt h-full w-full flex items-center justify-center">
                    <div className={`firstbaidfdofndaod relative w-full p-2 h-full flex items-start justify-center gap-2 flex-col`}>
                        <div className="cntnsts transition-all min-[1400px]:scale-[1.3] h-full flex items-start p-2 justify-center flex-col w-fit">
                            <h5 className="ainfoda sapAnim p-2 text-sm font-mono">
                                Hi, My name is
                            </h5>
                            <h1 className="ainfoda flex items-start justify-start flex-col font-bold text-[var(--txt)] text-[5rem] max-[900px]:text-[4rem]">
                                <span className={`sapAnim`}>Mohamed</span>
                                <span className={`mt-[-35px] sapAnim max-[900px]:mt-[-25px]`}>Amara.</span>
                            </h1>
                            <div className="aidnfoda sapAnim font-light text-lg max-[800px]:text-sm">
                                <div>As a passionate software engineering student,</div>
                                <div>I specialize in crafting innovative, user-centric tools.</div>
                            </div>
                            <div className="pLt mt-2">
                                <DBTN />
                            </div>
                        </div>

                        <div className="skiLs transition-all min-[1400px]:scale-[1.2] transition-all min-[1400px]:mt-[-20px] w-full brd justify-between p-2 flex items-start gap-2 text-sm max-[800px]:text-xs">
                            <div className="lefMpath">
                                Highly skilled at progressive <br /> enhancement, design systems <br /> & UI Engineering.
                            </div>
                            <div className="rPts">
                                Proven experience building <br /> successful products for clients <br /> acrosss several countries.
                            </div>
                        </div>

                    </div>
                </div>
                <div className={`pictureaidfdofa transition-all min-[1400px]:scale-[1.4] animate__bounceInUp max-[800px]:mt-20 max-[800px]:mb-10 relative flex items-center justify-center gap-2 h-full w-full`}>
                    <div className="imgaifndofa flex items-center justify-center top-[-15rem] left-0 h-full w-full z-[1000]">
                        <div className="yaineas absolute bottom-0 left-0 w-full h-full">
                            <Logo className={` bottom-[40px] w-full h-full left-[-50px]`} />
                        </div>
                        <div className="ahinkeas  top-[0rem] z-[1000000000] max-[800px]:h-[20rem] max-[800px]:w-[20rem] h-[25rem] w-[25rem]">
                            <img className={` w-full h-full object-cover`} src={`./ME/me${t > 0 ? t : 1}.png`} alt="" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Hero