'use client'
import { AnimatePresence, motion } from 'framer-motion'
import React, { useState } from 'react'

const Info = ({ v }) => {
    const [dl, setDl] = useState(false)
    const [show, setShow] = useState(null)


    let handleRM = () => {
        setShow(null);
        let all = document.querySelectorAll('*')
        all.forEach(e => {
            e.classList.remove('stopScroll')
            e.classList.remove('zIND')
        })
    };

    return (
        <>
            <AnimatePresence>
                { show && (
                    <motion.div
                        key="modal"
                        className="previewInfos z-50 p-2 flex items-center justify-center fixed top-0 left-0 w-full h-full"
                    >
                        <motion.div
                            onClick={handleRM}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="dim_S fixed top-0 left-0 w-full h-full bg-[var(--dim)] cursor-pointer"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            layoutId={`id_${show}`}
                            className="ontent_c z-[10000000000000] max-w-[500px] bg-[var(--muted)] w-full p-2 rounded-xl shadow-lg brd"
                        >
                            <div className="boldT bd text-center p-2 uppercase text-3xl">
                                Short Info
                            </div>
                            <p className="p-2 text-center">
                                You're seeing this because the project <b>Source Code</b> you're trying to access is not available in public use. <br />
                                Actual users are using these platform. I am so sorry for that.
                            </p>
                            <div className="optionYs p-2">
                                <div
                                    className="accbtn brd p-2 rounded-lg shadow-lg cursor-pointer text-center flex items-center justify-center"
                                    onClick={handleRM}
                                >
                                    Ok, Understood
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                onClick={() => {
                    setShow(v.id)
                    // setDl(true)
                    
                    let bd = document.querySelector('body')
                    if (bd) {
                        bd.classList.add(`stopScroll`)
                        let all = document.querySelectorAll('.btD')
                        all.forEach(e => {
                            if (e.className && typeof e.className === 'string' && !e.className.includes(`id_${v.id}`)) {
                              e.classList.add('zIND')
                            }
                        });
                    }
                }}
                layoutId={`id_${v.id}`}
                className="icc_1 cursor-pointer h-10 w-10 flex items-center justify-center brd p-2"
            >
                <i className="bi bi-info-circle" />
            </motion.div>
        </>
    )
};

export default Info
