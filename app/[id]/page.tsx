'use client'

import { useLayoutEffect, useState } from "react"

const RSM = () => {
    const [sh, setsh] = useState(false)
    useLayoutEffect(() => {
        setsh(true)
    }, [])
    return (
        <>
            {
                sh && (
                    <>
                        <iframe className=" w-full h-full fixed top-0 flex items-center justify-center z-[10000000000000000] left-0" src={`${window.location.origin}/resume.pdf`} frameBorder="0"></iframe>
                    </>
                )
            }
        </>
    )
}

export default RSM
