'use client'
import { useEffect, useLayoutEffect, useState } from 'react';
import './App.css';
import { Connect } from './Context/Context';
import Three from './Pages/Home/Hero/Three/Three';
import Home from './Pages/Home/Home';
import Nav from './Pages/Nav/Nav';
import Typewriter from 'typewriter-effect';
import TH from './Pages/Home/Hero/Three/TH';
import { isMobile } from 'react-device-detect';
import Prev from './Pages/Home/Prev/Prev';
import PV from './Pages/Home/Prev/PV';
import { v4 as uuid } from 'uuid'
import Footer from './Pages/Footer/Footer';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CV from './CV/CV';
import { Medzy } from 'medenc';

function App({en}) {

  // 
  const [loading, setloading] = useState(false)
  useLayoutEffect(() => { 
    setTimeout(() => {
      setloading(true)
    }, 3000);
  }, [])


  // 

  const [theme, settheme] = useState('system')

    const [state, setState] = useState(false)
    let name = 'theme'
    let dbv = 1
    let storename = 'ThemeStore'

    function HasIndexDB() { 
        if ('indexedDB' in window) { 
            return true
        }
        else { 
            return false
        }
    }

    function RST(st, backup) { 
        return st !== null && st !== undefined ? st : backup
    }

    function ADDBODY(th, db) { 
        if (db !== null && db !== undefined) { 
            document.body.classList.remove(db)
            document.body.classList.add(th)
        }
        else { 
            document.body.classList.add(th)
        }
    }

    function LOCS(st) { 
        
        let db = localStorage.getItem(name);
        if (db !== null) { 
            if (st !== null && st !== undefined) { 
                localStorage.setItem(name, RST(st, st))
            }
            settheme(RST(st, st !== null && st !== undefined ? st : db))
            ADDBODY(RST(st, st !== null && st !== undefined ? st : db), db)
        }
        else { 
            localStorage.setItem(name, RST(st, theme))
            settheme(RST(st, theme))
            ADDBODY(RST(st, theme))
        };
    }
  
  useLayoutEffect(() => {
    LOCS()
  }, [state]);

  // 

  const [sh, setsh] = useState(false)
  const [pv, setpv] = useState(null)
  const [pv2, setpv2] = useState(null)

  const [scroll, setscroll] = useState(0);

  const [reset, setreset] = useState(0);

  const [result, setresult] = useState([])


  const [ms, setms] = useState([]);
  // 

  useLayoutEffect(() => {
    let loc = localStorage.getItem('messages')
    if (loc !== undefined && loc !== null && loc !== '') {
      let spl = loc.split('')
      if (spl[0].includes('[')) {
        let tos = JSON.parse(loc)
        let tod = tos.sort((a, b) => new Date(b.date) - new Date(a.date))
        setms(tod)
      }
    }
  }, [reset]);

  const [showcv, setshowcv] = useState(false)

  return (
    <>
      <Connect.Provider value={{ showcv, setshowcv, ms, setms, en, reset, setreset, pv, setpv, pv2, setpv2, theme, settheme, sh, setsh }}>
         <>
              <div className="aidnoaiida">
                <div className={`aidnfoa ainiainoia8 overflow-x-hidden overflow-y-auto h-full fixed top-0 ${sh === true ? 'left-[-50%] scale-[.90]' : 'left-0'} aidnfoaiodaioa801 w-full`}>
                  <Nav />
                    <Home />
                </div>
                  {/* {
                    showcv === true ? 
                      <CV/> : ''
                } */}
                  
                {/*  */}

                <div  className={`aiandofsedc overflow-x-hidden overflow-y-auto w-full ${pv2 !== null ? 'z-20' : 'z-50'} bg  items-start justify-start h-full fixed top-0 aidnfoaiodaioa801 ${sh === true && pv !== null ? 'right-0' : 'right-[-100%]'} ${pv2 !== null ? 'right-[50px] scale-[.90]' : ''} `}>
                  {
                    pv !== null ? pv.includes('url') ?
                      <div className="iandofndoap sticky z-50 top-0 bg justify-between gap-2 items-center flex w-full p-2">
                          
                        <div className="aidnfodad">
                          Preview
                        </div>
                        
                        <div className="aidnfoafdpaid input w-full max-w-[300px] flex items-center justify-center gap-2 p-2">
                          <div className="aidnfoad">
                            <i className="fa fa-search"></i>
                          </div>
                          <div className="inaodnfoda">
                            https://github.com/
                          </div>
                        </div>
                          
                        <div className="bingadfidnfao">
                          <div onClick={e => {
                            setsh(false)
                            setTimeout(() => {
                              setpv(null)
                            }, 1000);
                          }} className="aidnfodaitm cursor-pointer text-[1rem] rounded-full h-5 w-5 flex items-center justify-center gap-2 bg-[gray]">
                            <i className="fa fa-times"></i>
                          </div>
                        </div>

                      </div>
                      :
                      <div className="aidnfaodio sticky top-0 z-50 dg flex items-center justify-between gap-2 p-2">
                        <div className="maxprev text-[1.5rem] font-bold">
                          Preview
                        </div>
                        <div onClick={e => {
                          setsh(false)
                          setTimeout(() => {
                            setpv(null)
                          }, 1000);
                        }} className="aidnfodaitm cursor-pointer text-[1.5rem] h-10 w-10 flex items-center justify-center gap-2 bg-[gray]">
                          <i className="fa fa-times"></i>
                        </div>
                      </div> : ''
                  }
                  <Prev scroll={scroll} />
                  <div className="hpd h-20" />
                </div>
                  
                {/*  */}

                <div className={` fixed z-[100000] w-full h-full ${pv2 !== null && sh === true ? 'right-0' : 'right-[-100%]'}  dg`}>
                  <div className="iandofndoap sticky z-50 top-0 bg justify-between gap-2 items-center flex w-full p-2">
                          
                      <div onClick={e => { 
                        window.open(`${pv2}`, `_blank`)
                    }} className="aidnfodad h-10 w-10 flex items-center justify-center p-2 cursor-pointer">
                     <i className="fa fa-external-link"></i>
                    </div>
                        
                    <div className={`aidnfoafdpaid input w-full max-w-[400px] max-[600px]:max-w-[300px] flex items-center justify-center gap-2 p-2`}>
                      <div className="aidnfoad">
                        <i className="fa fa-search"></i>
                      </div>
                      <div className="inaodnfoda">
                        {pv2}
                      </div>
                    </div>
                          
                    <div className="bingadfidnfao">
                      <div onClick={e => {
                          if (pv === null) { 
                          setsh(false)
                        }
                        setpv2(null)
                      }} className="aidnfodaitm cursor-pointer text-[1rem] rounded-full h-5 w-5 flex items-center justify-center gap-2 bg-[gray]">
                        <i className="fa fa-times"></i>
                      </div>
                    </div>

                  </div>
                    {
                      pv2 !== null ? 
                        <PV scroll={scroll} /> : ''
                  }
                  <div className="hpd h-20" />
                </div>
                  

              </div>
            </>
        <ToastContainer position='bottom-center' style={{zIndex: 100000000000000}} theme={theme === 'system' ? 'colored' : theme} />
      </Connect.Provider>
    </>
  );
}

export default App;
