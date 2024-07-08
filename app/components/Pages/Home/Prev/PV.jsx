import React, { useContext } from 'react'
import { Connect } from '../../../Context/Context'

function PV() {
    const { reset, setreset, pv, setpv, pv2, setpv2, theme, settheme, sh, setsh } = useContext(Connect)
    
  return (
      <>
          <iframe src={`${pv2}`} className=' w-full h-full max-h-[93%] top-0' frameborder="0"></iframe>
      </>
  )
}

export default PV