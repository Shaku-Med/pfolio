'use client'
import React, { useEffect, useState } from 'react'

const Media = ({ v }) => {
    const [error, seterror] = useState(null)

    let MediaS = async () => {
        try {
            if ("mediaSession" in navigator) {
                navigator.mediaSession.metadata = new MediaMetadata({
                    title: v.title,
                    artist: v.description,
                    album: `Medzy Amara | Playing`,
                    artwork: [
                        {
                            src: v.image.src,
                            sizes: "96x96",
                            type: "image/png",
                        },
                        {
                            src: v.image.src,
                            sizes: "128x128",
                            type: "image/png",
                        },
                        {
                            src: v.image.src,
                            sizes: "192x192",
                            type: "image/png",
                        },
                        {
                            src: v.image.src,
                            sizes: "256x256",
                            type: "image/png",
                        },
                        {
                            src: v.image.src,
                            sizes: "384x384",
                            type: "image/png",
                        },
                        {
                            src: v.image.src,
                            sizes: "512x512",
                            type: "image/png",
                        },
                    ],
                });
            }
        }
        catch {}
    };

    return (
        <>
            {
                !error ?
                    <>
                        {
                            v.hasOwnProperty('video') && v.video ?
                                <video onLoad={MediaS} onPlay={MediaS} onPause={MediaS} onError={e => seterror(true)} controls playsInline poster={v.image.src} className={` w-full h-full absolute top-0 left-0 object-contain bg-black`} src={v.video} alt="" /> :
                                <img onError={e => seterror(true)} className={` w-full h-full absolute top-0 left-0 object-contain bg-black`} src={v.image.src} alt={`${v.title}`} />
                        }
                    </> :
                    <>
                        <div className="w-full h-full absolute top-0 left-0 flex items-center justify-center p-2 text-center bg-[var(--border)]">
                            <div className="CCtInfo text-xl uppercase">
                                <span className={`opacity-[.6]`}>
                                    Sorry! we had trouble loading this media.
                                </span>
                                <br />
                                <div className="sad text-6xl mt-2">
                                    😔
                                </div>
                            </div>
                        </div>
                    </>
            }
        </>
    )
};

export default Media
