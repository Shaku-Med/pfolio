import React, { useContext, useState } from 'react'
import { Connect } from '../Context/Context'
import { v4 as uuid } from 'uuid'
import {toast} from 'react-toastify'

function CV() {

    const {showcv, setshowcv} = useContext(Connect)

    const [d, setd] = useState(false)

    function Download() { 
        setd(true)
        fetch(`../CV.pdf`).then(res => res.blob()).then(res => { 
            let a = document.createElement('a')
            a.href = URL.createObjectURL(res)
            a.download = `Medzy_resume_${uuid()}`
            a.click()
            setd(false)
        }).catch(er => { 
            setd(false)
            toast.error(`Sorry, I was unable to process your download. Please try again.`)
        })
    }

  return (
      <div className="aidnofdoadi bg fixed top left-0 w-full h-full z-[1000000000]">
          <div className="closeCV flex items-center justify-between w-full sticky p-2 top-0 dg">
              <div onClick={d === false ? Download : e => {}} className="downladpd h-10 w-10 cursor-pointer flex items-center justify-center">
                  {
                      d === false ? <i className="fa fa-download"></i> :
                          <span className=' loading' />
                  }
              </div>
              <div className="hfirstpart uppercase">
                  My Resume
              </div>
              <div onClick={e => { 
                  setshowcv(false)
              }} className="clobtnadifnd h-10 w-10 flex items-center justify-center text-xl cursor-pointer">
                  <i className="fa fa-times"></i>
              </div>
          </div>
          <div className="padfaidnfoa w-full h-full max-h-[93.5%]">
              <iframe src={`../CV.pdf`} className=' w-full h-full' frameborder="0"></iframe>
          </div>
    </div>
  )
}

export default CV