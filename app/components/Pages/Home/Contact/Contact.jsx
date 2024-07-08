'use client'
import React, { useState } from 'react'
import Btn from '@/app/Functions/Btn'
import Modal from './Modal/Modal'
import { AnimatePresence } from 'framer-motion';
import Link from 'next/link';
// 
const Contact = ({sid, h}) => {
    const [select, setselect] = useState(null)
    //

     let handleADD = () => {
        let all = document.querySelectorAll('*')
        all.forEach(e => {
            e.classList.add('stopScroll')
            if (typeof e.className === 'string' && e.className.includes('navvs')) {
              e.style.zIndex = `-1`
            }
        })
    };
    
    return (
        <>
            {
                select && (
                    <AnimatePresence>
                        <Modal sid={sid} h={h} select={select} setselect={setselect} />
                    </AnimatePresence>
                )
            }
            <div  className={` p-2 flex items-center justify-between flex-col h-full`}>
                <div className={` w-full max-w-[1000px] p-2 h-full`}>
                    <h1 className={` text-center animate__fadeInUp text-[var(--txt)] text-5xl font-bold p-4 capitalize mt-4 mb-4`}>
                        Get In Touch
                    </h1>
                </div>
                <div className="getInt_me mt-[-15px] text-lg text-center p-2">
                    <p>
                        <span>I'm currently looking for an <span className={`text-[var(--txt)] `}>opportunity</span> to working with you.</span> <br />
                        <span>My inbox is always open.</span> <br />
                        <span> <span className='text-[var(--txt)]'>Hire</span> or say <span className='text-[var(--txt)]'>Hi</span> at any time, I'll be happy to respond.</span>
                    </p>
                    <div className="message_box_open flex-col gap-2 mt-10 flex items-center justify-center w-full">
                        <Btn attributes={{
                            className: `smBtn brd p-4`,
                            layoutId: `contact`,
                            onClick: e => {
                                setselect(`contact`)
                                handleADD()
                            }
                        }} />
                        <div className="ddev">
                            OR
                        </div>
                        <div className="mailBtnH txt">
                            <Link href={`mailto:medzyamara@gmail.com`} target='_blank'>
                                medzyamara@gmail.com
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
};

export default Contact
