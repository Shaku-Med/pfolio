import Btn from "@/app/Functions/Btn";
import Link from "next/link";

let DBTN = () => {
    return (
        <>
            <Link href={`../resume`}>
                <Btn attributes={{
                    className: `smBtn flex mt-2 item-center justify-center gap-2 brd p-4 rounded-2xl`,
                    layoutId: `resume`,
                }}>
                    <i className="bi bi-download" />
                    <span>Download Resume/CV</span>
                </Btn>
            </Link>
        </>
    );
};

export default DBTN