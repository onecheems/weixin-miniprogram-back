const axios = require('axios')

class WeixinController {
    /**
     * @api {post} /weixin/auth auth
     */
    async auth(ctx) {
        const js_code = ctx.request.body.code
        console.log(ctx.request.body)
        console.log(ctx.request.query)
        if (!js_code) {
            ctx.body = {
                code: -1,
                mgs: '请求的 code 不存在'
            }
            return
        }
        const params = Object.assign({ js_code }, {
            appid: 'wx2e92f1b259b3a4c0',
            secret: '0f49ad4644e40bb309dafdf70affac77',
            grant_type: 'authorization_code'
        })
        const { data } = await axios.get('https://api.weixin.qq.com/sns/jscode2session', { params })
        console.log(data)
        ctx.body = {
            code: 0,
            msg: '请求成功',
            data
        }
    }
}
module.exports = WeixinController