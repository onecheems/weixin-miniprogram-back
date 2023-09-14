const Koa = require('koa')
const EnforceHttps = require('koa-sslify').default

const DolphinRouter = require('dolphin-router')
const http = require('http')
const https = require('https')
const fs = require('fs')
const path = require('path')
const mysql2 = require('mysql2/promise')

const app = new Koa()
// 全局异常处理
app.use(async (ctx, next) => {
    try {
        await next()
    } catch(err) {
        ctx.body = {
            code: -1,
            msg: err.message
        }
    }
})
app.use(async (ctx, next) => {
    const conn = await mysql2.createConnection({
        host: 'localhost',
        port: 3306,
        user: 'root',
        database: 'weixin',
        password: 'f9yihLiai=E2'
    })
    const wrapper = {
        conn,
        escape: mysql2.escape
    }
    ctx.mysql = wrapper
    await next()
})
// app.use(EnforceHttps())
app.use(DolphinRouter.koaBody())
    .use(DolphinRouter.routes())
    .use(DolphinRouter.allowedMethods())
// TODO: 443 端口不可用原因？？
http.createServer(app.callback()).listen(80, () => console.log('https://weixin.api.futureruntime.com'))
https.createServer({
    key: fs.readFileSync('./sources/certificate/7994580_weixin.api.futureruntime.com.key'),
    cert: fs.readFileSync('./sources/certificate/7994580_weixin.api.futureruntime.com.pem')
}, app.callback()).listen(3000, () => console.log('https://weixin.api.futureruntime.com'))