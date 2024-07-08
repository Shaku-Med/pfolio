import React from 'react'
import DBTN from '../../../CV/DBTN';

let Resume = () => {
    return (
        <>
            <div  className={`profHm remay mainHITE bg-[var(--mainBg)] p-2 flex items-center justify-between flex-col h-full bd overflow-hidden`}>
                <div className={`MlTpt w-full max-w-[1000px] h-full`}>
                    <h1 className={`bildAb sapAnim text-[var(--txt)] text-5xl font-bold p-4 capitalize mt-2 mb-2`}>
                        experience
                    </h1>
                    <div className="timeStamps px-10 w-full">
                        <div className="path1 relative w-full p-2">
                            <div className="tdots sapAnim p-2 w-fit capitalize text-2xl font-bold text-[var(--txt)] opacity-[.6]">
                                Computer Lab Assistant
                            </div>
                            <div className="labS sapAnim sapAnim px-6 py-2 w-fit">
                                Nov 2023 - Feb 2024
                            </div>
                            <div className="TmLds px-10">
                                <div className="cont1 flex items-start justify-start gap-2 p-2">
                                    <i className="bi sapAnim bi-caret-right" />
                                    <span className={`sapAnim`}>Assisted students and professors with computer use <strong className='text-[var(--txt)]'>Software</strong> and enquipment such as <strong className='text-[var(--txt)]'>printers</strong> and <strong className='text-[var(--txt)]'>projectors.</strong></span>
                                </div>
                                <div className="cont1 flex items-start justify-start gap-2 p-2">
                                    <i className="bi sapAnim bi-caret-right" />
                                    <span className={`sapAnim`}>Maintained the front desk in the library lab and ensured <strong className='text-[var(--txt)]'>students</strong> followed computer lab's rules and protocols.</span>
                                </div>
                                <div className="cont1 flex items-start justify-start gap-2 p-2">
                                    <i className="bi sapAnim bi-caret-right" />
                                    <span className={`sapAnim`}>Operated the labs on campus by opening and closing them on a timely schedule.</span>
                                </div>
                            </div>
                        </div>
                        <div className="path1 relative w-full p-2">
                            <div className="tdots sapAnim p-2 w-fit capitalize text-2xl font-bold text-[var(--txt)] opacity-[.6]">
                               Cyber Security Intern (CodePath)
                            </div>
                            <div className="labS sapAnim px-6 py-2 w-fit">
                                Feb 2023 - Mar 2023
                            </div>
                            <div className="TmLds px-10">
                                <div className="cont1 flex items-start justify-start gap-2 p-2">
                                    <i className="bi sapAnim bi-caret-right" />
                                    <span className={`sapAnim`}>Learned about encryption, worked on sandbox play ground. These lectures helped me build my own <strong title={`Give it a try. Do not use for publishing.`} className="txt capitalize"><a target={`_blank`} href={`https://www.npmjs.com/package/encmed`}>JS (NPM)</a></strong> Encryption</span>
                                </div>
                                <div className="cont1 flex items-start justify-start gap-2 p-2">
                                    <i className="bi sapAnim bi-caret-right" />
                                    <span className={`sapAnim`}>Worked with other students to solve problems, and programmed code for both <span className={` text-red-500 `}>Red Team</span> and <span className={` text-blue-500`}>Blue Team</span></span>
                                </div>
                            </div>
                        </div>
                        <div className="path1 relative w-full p-2">
                            <div className="tdots sapAnim p-2 w-fit capitalize text-2xl font-bold text-[var(--txt)] opacity-[.6]">
                               Database System
                            </div>
                            <div className="labS sapAnim px-6 py-2 w-fit">
                                Sep 2024 - Mar 2024
                            </div>
                            <div className="TmLds px-10">
                                <div className="cont1 flex items-start justify-start gap-2 p-2">
                                    <i className="bi sapAnim bi-caret-right" />
                                    <span className={`sapAnim`}>Worked in a team with my colleges to work on a realtime networking platform (Facebook clone), which almost the whole class used during our class time.</span>
                                </div>
                                <div className="cont1 flex items-start justify-start gap-2 p-2">
                                    <i className="bi sapAnim bi-caret-right" />
                                    <span className={`sapAnim`}>We built advanced & secure database system, which I was the team Leader on the project till completion. <a target={`_blank`} href="https://github.com/Shaku-Med/class_project_csc226" className="txt capitalize">(code)</a></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Resume