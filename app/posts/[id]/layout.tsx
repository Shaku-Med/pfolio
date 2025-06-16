import { Metadata } from "next"

export const metadata: Metadata = {
    title: {
        absolute: `Post Page`
    }
}
export default function PostLayout({children}: {children: React.ReactNode}) {
    return (
        <>
            {children}
        </>
    )
}
