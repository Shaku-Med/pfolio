import { isMobile } from 'react-device-detect'
import DrawerDemo from './Nav_pv'
import JavaScriptObfuscator from 'javascript-obfuscator'
import Objects from '@/app/Functions/Object'
// 
import { v4 as uuid } from 'uuid'
import { headers } from 'next/headers';
import Script from 'next/script'
import Link from 'next/link'
// 
export default async function Nav(){

    // let date = new Date()
    // let au = headers().get('user-agent').split(/\s+/).join('')
    // let uid = uuid().split('-').join('').toUpperCase()
    // let obS = {
    //     exp: date.setSeconds(date.getSeconds() + 20),
    // }
    
    // let h = Objects.encDec(JSON.stringify(obS), `${au}+${process.env.Y}+${uid}`)
    // let obf = JavaScriptObfuscator.obfuscate(
    //     `
    //         let _0xK = async (id) => {
    //         try {
    //             window.session_id = '${uid}'
    //             let ax = await fetch('/api/v/'+ window.session_id +'', {
    //                 headers: {
    //                     session_id: ''+ window.session_id +''
    //                 },
    //                 method: "POST",
    //                 body: JSON.stringify({a: id})
    //             });
    //             let d = await ax.json()
    //             if (d) {
                    
    //             }
    //             else {
    //                 return null
    //             }
    //         }
    //         catch (e) {
    //             return null
    //         }
    //     };

    //     _0xK('${h}')

    //     `
    // ).getObfuscatedCode()
    

    return (
        <>
            <Link href={`../`} className="logopart navvs  left-12 fixed max-[600px]:top-5 top-10 flex items-center justify-center gap-1">
                <img src={`https://medzyamara.com/fav.svg`} className="loaidnfd rounded-full bg-[var(--muted)] dark:bg-[var(--mainBg)] h-16 min-w-16 w-16 min-h-16 flex items-center justify-center text-xl" />
            </Link>
            
            <div className="clbtns navvs fixed max-[600px]:top-5 top-10 right-12">
                <DrawerDemo/>
            </div>

            {/* <header className='heads z-[100000000000] p-2 fixed flex items-center justify-center w-full pt-2 pb-2 pl-4 pr-4' id='header'>
                <div className='ainoadinf bg rounded-md flex items-center justify-between gap-2 w-full max-w-[1200px] p-6 max-[600px]:p-4'>
                </div>
            </header> */}
        </>
    );
};

// export default Nav