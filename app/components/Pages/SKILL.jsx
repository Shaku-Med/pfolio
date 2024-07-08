import React from 'react'
import { isMobile } from 'react-device-detect'

function SKILL() {
  return (
      <div className="aidfnoadod  flex-col w-full h-full max-[850px]:mt-[50px] flex items-center justify-center ">
          
          <div className="aidnfoinadfd max-w-[800px] w-full">
                  <div className="proraidfndsli w-full text-center mt-4">
                <div className={`paofski font-bold pt-2 pb-2 ${isMobile === false ? 'text-3xl mt-[40px]' : 'text-2xl'}`}>
                    Professional Skillset
                </div>
                <div className="butadifnaod w-full flex items-center justify-center">
                    <div className="aodnfoando w-full items-center">
                        <button className="btn disabled shadow-md w-full">Java 80%</button>
                        <button className="btn disabled shadow-md w-full">C++ 75%</button>
                        <button className="btn disabled shadow-md w-full">Python 90%</button>
                        <button className="btn disabled shadow-md w-full">Javascript 100%</button>
                        <button className="btn disabled shadow-md w-full">Node.JS 100%</button>
                        <button className="btn disabled shadow-md w-full">React.JS 100%</button>
                        <button className="btn disabled shadow-md w-full">HTML 100%</button>
                        <button className="btn disabled shadow-md w-full">CSS 100%</button>
                        <button className="btn disabled shadow-md w-full">PHP 60%</button>
                        <button className="btn disabled shadow-md w-full">UI / UX / DESIGN 80%</button>
                        <button className="btn disabled shadow-md w-full">React Native 90%</button>
                        <button className="btn disabled shadow-md w-full">Git 100%</button>
                        <button className="btn disabled shadow-md w-full">TypeScript 80%</button>
                        <button className="btn disabled shadow-md w-full">SQL 90%</button>
                        <button className="btn disabled shadow-md w-full">MONGO_DB 70%</button>
                    </div>
                </div>
            </div>
              </div>
          <div className="aidnfoinadfd max-w-[800px] w-full">
                  <div className="proraidfndsli w-full text-center mt-4">
                <div className={`paofski font-bold pt-2 pb-2 ${isMobile === false ? 'text-3xl mt-[40px]' : 'text-2xl'}`}>
                    Tools I use
                </div>
                <div className="butadifnaod w-full flex items-center justify-center">
                    <div className="aodnfoando w-full items-center">
                        <button className="btn disabled shadow-md w-full">PhotoShop</button>
                        <button className="btn disabled shadow-md w-full">Canvas</button>
                        <button className="btn disabled shadow-md w-full">Android Studio</button>
                        <button className="btn disabled shadow-md w-full">VS code</button>
                        <button className="btn disabled shadow-md w-full">Figma</button>
                    </div>
                </div>
            </div>
          </div>
          
          <div className="aidnfoinadfd max-w-[800px] w-full">
                  <div className="proraidfndsli w-full text-center mt-4">
                <div className={`paofski font-bold pt-2 pb-2 ${isMobile === false ? 'text-3xl mt-[40px]' : 'text-2xl'}`}>
                    Packages I normally use.
                </div>
                <div className="butadifnaod w-full flex items-center justify-center">
                    <div className="aodnfoando w-full items-center">
                        <button title='Created by me.' className="btn disabled shadow-md w-full">Device Detector (NPM) - (MINE)</button>
                        <button className="btn disabled shadow-md w-full">Toastify</button>
                        <button className="btn disabled shadow-md w-full">React Linkify</button>
                        <button className="btn disabled shadow-md w-full">OPENAI</button>
                        <button className="btn disabled shadow-md w-full">Crypto & My own (Encryption)</button>
                    </div>
                </div>
            </div>
              </div>

    </div>
  )
}

export default SKILL