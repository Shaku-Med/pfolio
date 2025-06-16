export default function PostsLayout({children}: {children: React.ReactNode}) {
    return (
        <>
            <div className="flex items-start justify-center min-h-screen">
                <div className="container post_container lg:px-10 px-4 w-full">
                    {children}
                </div>
            </div>
        </>
    )
}
