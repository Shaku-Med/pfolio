'use client'
import { ToastContainer } from 'react-toastify';

const Tost = () => {
    return (
        <>
            <ToastContainer closeOnClick draggable position='bottom-center' style={{ zIndex: 100000000000000 }} theme={'dark'} />
        </>
    )
};

export default Tost
