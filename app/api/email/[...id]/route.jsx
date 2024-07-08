import Objects from "@/app/Functions/Object";
import { headers } from "next/headers"
//
import nodemailer from 'nodemailer'

let transport = nodemailer.createTransport({
    host: `${process.env.HOST}`,
    port: 587,
    secure: false,
    auth: {
        user: `${process.env.USER}`,
        pass: `${process.env.PASS}`,
    },
});

// 
// export let dynamic = 'force-dynamic'

export async function POST(request, response) {
  try {
    let a = headers().get('session_id')
    let body = await request.json()

    // Add parameters to the unAuth function. Ex: unAuth(status, message)... for your use...
    let unAuth = () => {
      return Response.json({
        success: false,
        status: 401,
        message: `Un Authorized Access.`
      }, { status: 401 })
    };

    if (a && body && typeof body === 'object') {
    let au = headers().get('user-agent').split(/\s+/).join('');
    let d = JSON.parse(Objects.encDec(body.a, `${au}+${process.env.Y}+${a}`, true))
    if (d) {
      if (au === d.uid) {
          
        let formatRegex = /(\n|\r\n|\r|\s{2,})/g;
        let formatReplace = {
            '\n': '<br>',
            '\r\n': '<br>',
            '\r': '<br>',
            '  ': '&nbsp;&nbsp;'
        }

        let ip = headers().get('true-client-ip') ? headers().get('true-client-ip') : headers().get('cf-connecting-ip') ? headers().get('cf-connecting-ip') : headers().get('x-forwarded-for') ? headers().get('x-forwarded-for') : headers().get('remote-addr') ? headers().get('remote-addr') : `NO IP FOUND`;

        await transport.sendMail({
            from: '"Medzy | PortFolio" '+ process.env.USER +'',
            to: process.env.TO,
            subject: body.subject,
            text: `New message from your website...`,                                                                                                                                                   // Could have used MAP.
            html: ` <h1>Respond Name: <br> ${body.name}</h1> <h2>Respond Email: <br> ${body.email}</h2>  <br> <hr> ${body.message} <br> <hr> <h2>Date: ${body.date}</h2> <hr> <h1>DEVICE INFO: </h1> <p>${JSON.stringify(body.device).replace(formatRegex, (matched) => formatReplace[matched])}</p> <hr> <h1>IP ADDRESS: <br> ${ip}</h1> <br> <hr>`
        })
            
        return Response.json({success: true})

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
  catch (e) {
     return Response.json({success: false}, {status: 500})
  }
};