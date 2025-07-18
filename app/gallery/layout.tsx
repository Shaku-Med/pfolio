export default function GalleryLayout({
    children,
    modal
}: {
    children: React.ReactNode
    modal: React.ReactNode
}) {
    return (
        <>
            {modal}
            {children}
        </>
    )
}