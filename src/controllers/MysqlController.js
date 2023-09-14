class MysqlController {
    /**
     * 创建新账户
     * @api {post} /weixin/mysql applyMysqlAccount
     */
    async applyMysqlAccount(ctx) {
        let openid = ''
        let username = ''
        let dbuser = ''
        let dbname = ''
        const { conn, escape } = ctx.mysql
        if (ctx.request.body && (!ctx.request.body.openid)) {
            ctx.body = {
                code: -1,
                mgs: 'openid 不存在'
            }
            return
        }
        openid = ctx.request.body.openid
        // 判断用户是否存在
        let [rows] = await conn.execute(`select * from mysql_user_info where open_id = '${openid}'`)
        if (rows.length !== 0) {
            rows.forEach(async item => {
                await conn.execute(`DELETE FROM mysql_user_info WHERE open_id = '${openid}'`)
            });
        }
        if (ctx.request.body && ctx.request.body.username) {
            username = ctx.request.body.username
        }
        [rows] = await conn.execute(`select db_user from mysql_user_info`)
        while (true) {
            dbuser = randomString(6)
            if (!rows.includes(dbuser)) {
                break;
            }
        }
        [rows] = await conn.execute(`select db_name from mysql_user_info`)
        while (true) {
            dbname = randomString(8)
            if (!rows.includes(dbname)) {
                break;
            }
        }
        const dbpassword = randomString(12, 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+-=')
        const createUserRes = await conn.execute(
            `INSERT INTO mysql_user_info 
            (
                username, 
                open_id, 
                db_name, 
                db_user, 
                db_password, 
                create_at,
                valid
            ) 
            VALUES 
            (
                '${username}', 
                '${openid}',
                '${dbname}',
                '${dbuser}',
                '${dbpassword}',
                '${getMysqlTypeDate()}',
                0
            );
            `)
        if (createUserRes[0].affectedRows === 1) {
            await conn.execute(`CREATE DATABASE IF NOT EXISTS ${dbname};`)
            await conn.execute(`grant all on ${dbname}.* to '${dbuser}'@'%' identified by '${dbpassword}' with grant option;`)
            await conn.execute(`flush privileges;`)
        }
        ctx.body = {
            code: 0,
            data: {
                host: '139.9.130.66',
                port: '3306',
                username: dbuser,
                password: dbpassword,
                database: dbname
            }
        }
    }
    /**
     * 获取账户信息
     * @api {post} /weixin/mysql/info getMysqlAccount
     */
    async getMysqlAccount(ctx) {
        if (ctx.request && (!ctx.request.body.openid)) {
            ctx.body = {
                code: -1,
                mgs: 'openid 不存在'
            }
            return
        }
        const { conn, escape } = ctx.mysql
        const [rows] = await conn.execute(`select * from mysql_user_info where open_id = ${escape(ctx.request.body.openid)}`)
        if (rows.length === 0) {
            ctx.body = {
                code: -1,
                mgs: '用户信息不存在'
            }
            return
        } else {
            ctx.body = {
                code: 0,
                data: rows[0]
            }
        }
    }
}


function randomString(length, chars) {
    chars = chars || 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
    let result = '';
    for (let i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}

function getMysqlTypeDate() {
    const date = new Date()
    const year = date.getFullYear()
    const month = date.getMonth()
    const day = date.getUTCDate()
    return `${year}-${month}-${day}`
}

module.exports = MysqlController

