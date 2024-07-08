import React from 'react'
import Media from './Media'
// 
let Blog = ({ v }) => {
    return (
        <>
            {
                v && (
                    <div className="mSmtas  flex items-center justify-center gap-2 px-2">
                        <div className="imagMinaldifyzmdosn  w-full p-2 max-w-[1100px] flex flex-col items-center justify-center">
                        <h1 className="mTmgs  relative min-h-[400px] max-h-[400px] max[600px]:sticky top-0 z-[1000000000] w-full max-w-[1000px] rounded-xl shadow-lg brd overflow-hidden">
                          <Media v={v}/>
                        </h1>
                        <div className="titls_mainB  max-w-[1000px] w-full mt-10">
                                {
                                    v.project ?
                                        <div className="mainTs w-full">
                                <h1 className="boldT  text-3xl text-[var(--txt)] p-2 w-full">
                                    URL
                                </h1>
                                <a href={`${v.project}`} target={`_blank`} className="Mian txt brd p-2 px-10 text-lg w-full">
                                    {v.project}
                                </a>
                            </div> : ``
                            }
                                {
                                    v.code ?
                                        <div className="mainTs w-full">
                                <h2 className="boldT  text-3xl text-[var(--txt)] p-2 w-full">
                                    Project Code
                                </h2>
                                <a href={`${v.code}`} target={`_blank`} className="Mian txt brd p-2 px-10 text-lg w-full">
                                    {v.code}
                                </a>
                            </div> : ``
                            }
                            <div className="mainTs">
                                <div className="boldT  text-3xl text-[var(--txt)] p-2">
                                    Released
                                </div>
                                <div className="Mian brd p-2 px-10 text-lg">
                                    {v.time}
                                </div>
                            </div>
                            <div className="mainTs">
                                <div className="boldT  text-3xl text-[var(--txt)] p-2">
                                    Title
                                </div>
                                <div className="Mian brd p-2 px-10 text-lg">
                                    {v.title}
                                </div>
                            </div>
                            <div className="mDes">
                                <div className="boldT  text-3xl text-[var(--txt)] p-2">
                                    About Application
                                </div>
                                <div className="amdyian brd p-2 px-10 text-lg">
                                    {v.description}
                                </div>
                            </div>
                            <div className="mDes">
                                <div className="boldT  text-3xl text-[var(--txt)] p-2">
                                    About & Security
                                </div>
                                <div className="amdyian brd p-2 px-10 text-lg">
                                    {v.about.security}
                                </div>
                            </div>
                            <div className="mYSld">
                                <div className="boldT  text-3xl text-[var(--txt)] p-2">
                                    Language Used
                                </div>
                                <div className="mXmta">
                                    {
                                    (v.languages || []).map((val, key) => {
                                        return (
                                            <div key={key} className={`gsx p-2 brd`}>
                                                <i className="bi bi-dot" />
                                                <span> {val}</span>
                                            </div>
                                        )
                                    })
                                }
                                </div>
                            </div>
                            {/* <div className="mYSld px-5">
                                <div className="boldT  text-3xl text-[var(--txt)] p-2">
                                   Friends Reviews
                                </div>
                                <div className="mXmta timeStamps">
                                    {
                                    (v.reviews || []).map((val, key) => {
                                        return (
                                            <div key={key} className={`gsx bg-[var(--mainBg)] p-2 brd px-2 mt-4 rounded-lg shadow-lg`}>
                                                <div className="us_ers text-lg px-2 py-1">
                                                    {val.username}
                                                </div>
                                                <div className="mytmz text-sm bd px-2">
                                                    {val.country}
                                                </div>
                                                <div className="descriptions_ text-[var(--txt)] opacity-[.6] text-sm p-2">
                                                    {val.review}
                                                </div>
                                            </div>
                                        )
                                    })
                                }
                                </div>
                            </div> */}
                        </div>
                    </div>
                    </div>
                )
            }
        </>
    );
}

export default Blog
