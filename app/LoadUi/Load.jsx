import React from 'react';

const Load = () => {
    return (
        <>
            <div className="load_ui fixed top-0 left-0 w-full h-full flex items-center justify-center z-[10000000000000000]">
                <div className="loader">
                    <div className="orbe" style={{ '--index': 0 }}></div>
                    <div className="orbe" style={{ '--index': 1 }}></div>
                    <div className="orbe" style={{ '--index': 2 }}></div>
                    <div className="orbe" style={{ '--index': 3 }}></div>
                    <div className="orbe" style={{ '--index': 4 }}></div>
                </div>
                    <div className="appLogo absolute w-20">
                        <img style={{background: 'transparent'}} src="../Icons/web/icon-512.png" alt="" />
                    </div>
            </div>
        </>
    );
}

export default Load;
