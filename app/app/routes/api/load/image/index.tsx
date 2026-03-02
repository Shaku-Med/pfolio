export const loader = async ({ request }: { request: Request }) => {
  try {
    const url = new URL(request.url);
    let path = url.pathname.split('/api/load/image/')[1] || '';
    if (!path) {
      return new Response(null, { status: 400 });
    }
    if (path.includes('%')) {
      path = decodeURIComponent(path);
    }
    const owner = process.env.GITHUB_OWNER;
    const repo = process.env.GITHUB_REPO;
    if (!owner || !repo) {
      return new Response(null, { status: 500 });
    }
    const githubUrl = `https://github.com/${owner}/${repo}/raw/main/${path}`;
    const res = await fetch(githubUrl);
    if (!res.ok) {
      return new Response(null, { status: res.status });
    }
    const body = await res.arrayBuffer();
    const headers = new Headers();
    const contentType = res.headers.get('content-type');
    if (contentType) {
      headers.set('Content-Type', contentType);
    }
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    return new Response(body, { status: 200, headers });
  } catch (error) {
    console.error('Error loading image from GitHub:', error);
    return new Response(null, { status: 500 });
  }
};