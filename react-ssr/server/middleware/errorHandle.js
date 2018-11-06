import { getJWTpayload } from '../util'

const errorHandle = async (ctx, next) => {
  try {
    // 获取jwt
    const token = ctx.header.authorization;
    if (token) {
      try {
        // 解密payload，获取用户名和ID
        ctx.payload = await getJWTpayload(token)
      } catch (err) {
        console.log('token verify fail: ', err)
      }
    }
    await next()
  } catch (err) {
    if (err.status === 401) {
      ctx.status = 401
      ctx.body = {
        errMsg: 'token失效',
        code: 2,
        data: null
      }
    } else {
      throw err
    }
  }
}
export default errorHandle