'use client'
import React, { useEffect, useRef } from 'react'
import { v4 as uuid } from 'uuid'
import {motion} from 'framer-motion'

const Btn = ({attributes, children }) => {
    const btnRef = useRef(null);
    let uid = uuid();
    let id = `myBtn_${uid}`;

    // if (attributes.hasOwnProperty('className')) {
    //     attributes.className = `${attributes.className} ${id}`;
    // }

    useEffect(() => {
        const btn = btnRef.current;
        if (btn) {
            const handleMouseMove = (e) => {

                btn.style.transition = `none`;
                btn.classList.remove(`animate__shakeX`);

                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const offsetX = (x - centerX) / 10;
                const offsetY = (y - centerY) / 10;
                document.documentElement.style.setProperty('--box_x', `${offsetX}px`);
                document.documentElement.style.setProperty('--box_y', `${offsetY}px`);
                // 
                btn.style.marginLeft = `${offsetX}px`
                // btn.style.marginTop = `${offsetY}px`
            };

            const handleMouseLeave = () => {
                document.documentElement.style.setProperty('--box_x', '0px');
                document.documentElement.style.setProperty('--box_y', '0px');
                btn.classList.add(`animate__shakeX`)
                btn.style.transition = `.3s ease-in-out`
                btn.style.marginLeft = `0px`;
            };

            btn.addEventListener('mousemove', handleMouseMove);
            btn.addEventListener('mouseleave', handleMouseLeave);

            return () => {
                btn.removeEventListener('mousemove', handleMouseMove);
                btn.removeEventListener('mouseleave', handleMouseLeave);
            };
        }
    }, []);

    try {
        return (
            <motion.div {...attributes} ref={btnRef} className={`${id} ${attributes.className}`}>
                {children ? children : `Open Message Box`}
            </motion.div>
        );
    }
    catch {
        return (
            <motion.div {...attributes}>
                {children ? children : `Open Message Box`}
            </motion.div>
        );
    }
};

export default Btn;
