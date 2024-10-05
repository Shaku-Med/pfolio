// ROUTE NOT IN USE FOR NOW.
import Objects from "@/app/Functions/Object";
import { headers } from "next/headers"
//

// export let dynamic = 'force-dynamic'

export async function POST(request, response) {
  try {
    let a = headers().get('session_id')
    let body = await request.json()

    let unAuth = () => {
      return Response.json({
        status: 401,
        message: `Un Authorized Access.`
      }, { status: 401 })
    };

    let what = process.env.NODE_ENV === 'production' ? `https://medzyamara.dev/` : `http://localhost:3000/`;

    if (headers().get('referer') === what) {
      if (a && body && typeof body === 'object') {
      let au = headers().get('user-agent').split(/\s+/).join('');
      let d = JSON.parse(Objects.encDec(body.a, `${au}+${process.env.API_Y}+${a}`, true))
      if (d) {
        if (new Date(d.exp) > new Date()) {
          return unAuth();
        }
        else {
           return unAuth() // I'm not telling the hacker that their token has expired, so I could make them think that they're dealing with the samething.
        }
      }
      else {
        return unAuth()
      }
    }
    else {
      return unAuth()
    }
    }
    else {
      return unAuth()
    }
  }
  catch {
     return Response.json('Request Failed.', {status: 500})
  }
};