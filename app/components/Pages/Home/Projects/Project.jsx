import Item from './Item'

let Project = () => {
    return (
        <>
            <div  className={`profHm  relative p-2 flex items-center justify-between flex-col h-full bd overflow-hidden`}>
                <div className={`MlTpt w-full max-w-[1000px] h-full`}>
                    <h1 className={`bildAb sapAnim text-[var(--txt)] text-5xl font-bold p-4 capitalize mt-2 mb-2`}>
                        Things I've built
                    </h1>
                    <Item featured={true} />
                </div>
            </div>
        </>
    );
};

export default Project