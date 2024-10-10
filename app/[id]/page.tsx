'use client'

import { useLayoutEffect, useState } from "react"

const RSM = () => {
    const [sh, setsh] = useState(``)
    useLayoutEffect(() => {
        let findR = async () => {
            try {
                let f = await fetch(`${window.location.origin}/resume.pdf`)
                let b = await f.blob()
                // 
                let url = URL.createObjectURL(b)
                setsh(url)
            }
            catch {
                setsh(``)
            }
        }

        findR()
    }, [])
    return (
        <>
        {/* onLoad={e => URL.revokeObjectURL(sh)} */}
            {
                sh && sh.trim().length > 0 && (
                    <>
                        <iframe className=" w-full h-full fixed top-0 flex items-center justify-center z-[10000000000000000] left-0" src={sh} frameBorder="0"></iframe>
                    </>
                )
            }
        </>
    )
}

export default RSM
