import React, { useContext, useLayoutEffect } from 'react'
// import * as THREE from 'three'
// import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import { isMobile } from 'react-device-detect'
import TH from './TH'
import T from './T'
import { Connect } from '../../../../Context/Context'


function Three() {

     const { theme, settheme } = useContext(Connect);

    useLayoutEffect(() => {

        // const scene = new THREE.Scene()
        // //

        // const geometry = new THREE.SphereGeometry(3, 64, 64)
        // const material = new THREE.MeshPhongMaterial({
        //     color: 'yellow',
        //     roughness: 0
        // })

        // const mesh = new THREE.Mesh(geometry, material);
        // scene.add(mesh)

        // // Size

        // let size = { 
        //     width: window.innerWidth,
        //     heigth: window.innerHeight,
        //     background: 'white'
        // }


        // // light
        // let light = new THREE.PointLight('#fff', 20, 200)
        // light.position.set(30, 0, 20)
        // scene.add(light)
        // //

        // const camera = new THREE.PerspectiveCamera(55, size.width / size.heigth, .1, 100)
        // camera.position.z = 10
        // scene.add(camera)

        
        // const canvas = document.querySelector('.threed')
        // const rander = new THREE.WebGL1Renderer({ canvas })
        // rander.setSize(size.width, size.heigth)
        // // rander.setClearColor(0x000, 0)
        // // rander.setPixelRatio(isMobile === true ? 10 : 1)
        // rander.setClearColor(0x000000, 0)
        // rander.render(scene, camera)
        // rander.autoClear = true
        
        // // controls

        // const controls = new OrbitControls(camera, canvas)
        // controls.enableDamping = true
        // controls.autoRotate = true
        // controls.enableZoom = true
        // controls.enablePan = false
        // controls.autoRotateSpeed = 10
        // // render
        

        // window.addEventListener('resize', (e) => {
        //     size.width = window.innerWidth
        //     size.heigth = window.innerHeight
        //     // 
        //     camera.updateProjectionMatrix()
        //     camera.aspect = size.width / size.heigth
        //     rander.setSize(size.width, size.heigth)
        // })

        // const loop = () => {
        //     controls.update()
        //     camera.updateProjectionMatrix()
        //     camera.aspect = size.width / size.heigth
        //     rander.setSize(size.width, size.heigth)
        //     rander.render(scene, camera)
        //     window.requestAnimationFrame(loop)
        // };

        // loop()
        
        
        //  let tm = window.matchMedia('(prefers-color-scheme: dark)')
        
        // function INOAID(state) { 
        //     Particles.init({
        //         selector: '#bgs',
        //         option: {
        //             background: {
        //                 color: {
        //                     value: state
        //                 }
        //             }
        //         }
        //     });
        // }
        
        // tm.addEventListener('change', e => { 
        //     if (e.matches) { 
        //         INOAID('#fff')
        //     }
        //     else { 
        //        INOAID('#000')
        //     }
        // })
        // if ( theme === 'system') { 
        //     if (tm.matches) { 
        //         INOAID('#fff')
        //     }
        //     else { 
        //        INOAID('#000')
        //     }
        // }

    }, []);


    

    return (
        <div className="aidnfoda fixed h-full w-full z-[-1]">
            <div className="partaidnfoad z-20">
                <T/>
            </div>
            {/* <div className="partaidnfoad">
                <canvas id='bgs' />
            </div> */}
            {/* <div className="canvaidnoa fixed top-0">
                <canvas className='threed w-full h-full'></canvas>
            </div> */}
        </div>
    );
}

export default Three