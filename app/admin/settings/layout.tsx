export default function SettingsLayout({ children, settings_sidebar }: { children: React.ReactNode, settings_sidebar: React.ReactNode }) {
    return (
        <div className=" flex justify-center items-center">
            <div className="flex container">
                {settings_sidebar}
                <main className="flex-1 p-2 lg:p-8">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}