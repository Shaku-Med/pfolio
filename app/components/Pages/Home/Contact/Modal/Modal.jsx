'use client'
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {marked} from 'marked';
// import DOMPurify from 'dompurify';
import ERR from '../ERR'
import * as device from 'react-device-detect'
import { toast } from 'react-toastify'
import {v4 as uuid} from 'uuid'

const Modal = ({ select, setselect, sid, h, className, dimClassName, boxClassName, children }) => {

    const [name, setname] = useState('');
    const [email, setemail] = useState('');
    const [input, setinput] = useState('');
    const [subject, setsubject] = useState('');
    // 
    const [isvalid, setisvalid] = useState(false);
    const [sub, setsub] = useState(null);

    const handleRM = () => {
        const allElements = document.querySelectorAll('*');
        setselect(null);
        allElements.forEach(element => {
            element.classList.remove('stopScroll');
            if (typeof element.className === 'string' && element.className.includes('navvs')) {
                element.style.zIndex = `1000000000000000000`;
            }
        });
    };

    const validateForm = () => {
        const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        if (input.trim().length > 0 && email.trim().length > 0 && name.trim().length > 0 && isEmailValid) {
            setisvalid(true);
        } else {
            setisvalid(false);
        }
    };

    const handleInput = (e) => {
        const rawText = e.target.value;
        setinput(rawText);
    };

    useEffect(() => {
        validateForm();
    }, [input, email, name]);

    const handleSubmit = async () => {
        try {
            if (isvalid && !sub) {
                setsub(true)
                // 
                let data = {
                    name,
                    email,
                    subject,
                    message: marked(input),
                    date: `${new Date().getTime()}+${new Date()}`,
                    device,
                    a: h
                };
                let ar = await fetch(`/api/email/${sid}`, {
                    method: `POST`,
                    body: JSON.stringify(data),
                    headers: {
                        session_id: sid
                    }
                })
                let tx = await ar.json()
                setsub(null)
                // 
                if (tx.success) {
                    setname('')
                    setemail('')
                    setinput('')
                    setsubject('')
                    // 
                    setisvalid(null)
                    // 
                    toast.success(`Message Sent.`)
                }
                else {
                    setisvalid(true)
                    toast.error(`Request Failed, Unable to send Message. Please try clicking on the Email below, medzyamara@gmail.com`)
                }
            }
            else {
                toast.error(`Sorry! Did you forget something? check if your email, name, or message is wrong.`)
            }
        }
        catch {
            toast.error(`Sorry! Request Failed.`)
        }
    };

    const wordCount = input.trim().split(/\s+/).length;
    const charCount = input.split(/\s+/).join('').trim().length;
    const lines = input.split(`\n`).length;

    return (
        <motion.div className={`${className ? className : `fixed overflow-hidden flex items-center justify-center p-2 top-0 left-0 w-full h-full z-[100000000000]`}`}>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleRM}
                className={`${dimClassName ? dimClassName : `modal_dim z-[-1] fixed bg-[var(--dim)] top-0 left-0 w-full h-full cursor-pointer`}`}
            />
            
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                layoutId={`${select}`}
                className={`${boxClassName ? boxClassName : `modalbox_h flex items-start justify-between flex-col h-fit overflow-auto w-full max-w-[1000px] rounded-xl max-h-[90%] bg-[var(--basebg)] z-[1000000000] brd`}`}
            >
                {
                    children ?
                        children :
                        <>
                            <div className="boldTxC bd w-full shadow-md flex items-center justify-between gap-2 p-2">
                                <div className="headLeft capitalize text-lg">
                                    Get In Touch
                                </div>
                                <i onClick={handleRM} className="bi bi-x-lg h-10 w-10 flex items-center justify-center brd bg-red-500 rounded-xl cursor-pointer hover:scale-[1.1] transition-all" />
                            </div>
                            <div className="editBd h-full overflow-auto w-full">
                                <div className="bold_ctner">
                                    <h1 className="tMt md:text-3xl text-2xl bd opacity-[.7] mt-2 text-center p-2 uppercase">
                                        Fill these out and press send.
                                    </h1>
                                </div>
                                <div className="otherInfo w-full flex sm:flex-wrap lg:flex-nowrap lg:flex-row items-center justify-center gap-2 p-4">
                                    <div className="textInputWrapper">
                                        <input
                                            onChange={(e) => setname(e.target.value)}
                                            value={name}
                                            autoFocus
                                            placeholder="Your Name (Required)"
                                            inputMode="text"
                                            type="text"
                                            className="textInput w-full"
                                        />
                                    </div>
                                    <div className="textInputWrapper">
                                        <input
                                            onChange={(e) => setemail(e.target.value)}
                                            value={email}
                                            placeholder="Response Email (Required)"
                                            inputMode="email"
                                            type="email"
                                            className="textInput w-full"
                                        />
                                    </div>
                                    <div className="textInputWrapper">
                                        <input
                                            onChange={(e) => setsubject(e.target.value)}
                                            value={subject}
                                            placeholder="Subject (Optional)"
                                            inputMode="text"
                                            type="text"
                                            className="textInput w-full"
                                        />
                                    </div>
                                </div>
                                <div className="apdyz w-full h-fit">
                                    <div className="textInputWrapper relative flex-col otherInfo w-full flex items-center justify-center gap-2 md:px-6 px-4">
                                        <div className="info_small text-[var(--txt)] opacity-[.6]">
                                            You can use markdown also.
                                        </div>
                                        <textarea
                                            onChange={handleInput}
                                            className="textInput w-full min-h-[200px] h-full resize-none outline-none"
                                            value={input}
                                            placeholder="Say something here. (Required)"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="subPart flex items-center justify-between gap-2 w-full p-4">
                                <div className="sub_Emojiy opacity-[.8]">
                                    {input.split(/\s+/).join('').trim().length < 1 ? `0` : wordCount} Words / {charCount} Characters / {lines} Lines {wordCount >= 30 ? <>: <span className="smtxt text-xs opacity-[.7]">🙌🏿 Looks like we've got something going on here.</span></> : ``}
                                </div>
                                <button
                                    onClick={isvalid && !sub ? handleSubmit : e => { }}
                                    className={`bg-blue-600 ${!isvalid ? 'dis' : ''} rtate_x p-2 min-w-10 min-h-10 w-10 h-10 rounded-full`}
                                    disabled={!isvalid}
                                >
                                    {
                                        !sub ?
                                            <i className="bi bi-send text-lg" /> :
                                            <>
                                                <div className="spinner center">
                                                    <div className="spinner-blade"></div>
                                                    <div className="spinner-blade"></div>
                                                    <div className="spinner-blade"></div>
                                                    <div className="spinner-blade"></div>
                                                    <div className="spinner-blade"></div>
                                                    <div className="spinner-blade"></div>
                                                    <div className="spinner-blade"></div>
                                                    <div className="spinner-blade"></div>
                                                    <div className="spinner-blade"></div>
                                                    <div className="spinner-blade"></div>
                                                    <div className="spinner-blade"></div>
                                                    <div className="spinner-blade"></div>
                                                </div>
                                            </>
                                    }
                                </button>
                            </div>
                        </>
                }
            </motion.div>
        </motion.div>
    );
};

export default Modal;
