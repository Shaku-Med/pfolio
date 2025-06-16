export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const url = searchParams.get('url')
    
        if (!url) {
            return new Response('No URL provided', { status: 400 })
        }
    
        const response = await fetch(url)
        const blob = await response.blob()
    
        return new Response(blob, {
            headers: {
                'Content-Type': response.headers.get('Content-Type') || 'application/pdf'
            }
        })
    }
    catch {
        return new Response('Error fetching document', { status: 500 })
    }
}
