import Link from "next/link";

const Ac = ({ v }) => {
    return (
        <>
            <Link href={`../Featured/${v.id}`} className={`MtG w-full h-full min-h-[400px] relative cursor-pointer max-w-[60%] min-w-[60%] max-[800px]:max-w-[100%] overflow-hidden rounded-xl`}>
                <img className={` w-full h-full object-cover absolute`} src={`${v.image.src}`} alt={``} />
            </Link>
        </>
    )
};

export default Ac
