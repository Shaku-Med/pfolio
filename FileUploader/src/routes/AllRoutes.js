const { EncryptCombine } = require("../Lock/Combine")
const { decrypt, encrypt } = require("../Lock/Enc")
const errorHandler = require("../middleware/error")
// Require an access token for all routes.
// Not telling the attacker what happened. (Just returning a "Something went wrong") Message.
// Hacking works along side with knowing how humans thinkg.
const AllRoutes = (req, res, next) => {
    try {
        const au = req.headers['user-agent']?.split(/\s+/).join('')
        let MX = () => {
            try {
                let accessToken = req.headers['access-token']

                if(!accessToken){
                    return errorHandler({
                        message: `You are not allowed to access this resource.`
                    }, req, res, next, 401)
                }
                let vr = decrypt(`${accessToken}`, `${process.env.PRIVATE_K}+${au}`)

                if(!accessToken){
                    return errorHandler({
                        message: `Access Denied`
                    }, req, res, next, 402)
                }

                if(!vr){
                    return errorHandler({
                        message: `Request Denied and not Allowed.`
                    }, req, res, next, 403)
                }
                vr = JSON.parse(vr)
                if(new Date(vr.expire) < new Date()){
                    return errorHandler({
                        message: `Access Denied`
                    }, req, res, next, 404)
                }

                
               return next()
            }
            catch (e) {
                console.log(e)
                return errorHandler({
                    message: `Something went wrong.`
                }, req, res, next, 401)
            }
        }
        if(req.originalUrl === '/'){
            if(req.method === "POST"){
                if(req.body.token){
                    let d = decrypt(`${req.body.token}`, `${process.env.KEY_LOCK}+${au}`)

                    if(d === process.env.FILE_TOKEN){
                        let token = EncryptCombine({
                            token: process.env.FILE_TOKEN,
                            userAgent: au,
                            referer: req.headers['referer'],
                        }, [
                            `${process.env.KEY_LOCK}`,
                            `${au}`,
                            `${process.env.PRIVATE_KEY_LOCK}`,
                        ], {
                            expiresIn: '1m',
                            algorithm: 'HS512',
                        })
                        // 
                        let dt = new Date()
                        let uploadToken = encrypt(JSON.stringify({
                            expire: dt.setMinutes(dt.getMinutes() + 10)
                        }), `${process.env.PRIVATE_K}+${au}`)
                        // 
                        return res.status(token ? 200 : 401).send({
                            token: token,
                            uploadToken: uploadToken
                        })
                    }
                    else {
                        return errorHandler({
                            message: `Something went wrong.`
                        }, req, res, next, 401)
                    }
                }
                else {
                    return errorHandler({
                        message: `Something went wrong.`
                    }, req, res, next, 401)
                }
            }
            else {
                res.status(401).send({
                    message: ` Welcome to the underworld my man.`,
                    access: false,
                    error: true,
                })
            }
        }
        else {
            return MX()
        }
    }
    catch (e) {
        console.log(e)
        return errorHandler({
            message: `Something went wrong.`
        }, req, res, next)
    }
}

module.exports = AllRoutes