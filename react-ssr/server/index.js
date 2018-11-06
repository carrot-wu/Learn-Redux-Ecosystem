// entrance
import Koa from 'koa'
import logger from 'koa-logger'
import cors from 'koa2-cors'
import router from './router'
import errorHandle from './middleware/errorHandle'

const app = new Koa()

app
  .use(
    cors({
      allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
      allowMethods: ['GET', 'POST', 'DELETE'],
      credentials: true,
      exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'],
      maxAge: 5,
      origin: () => '*'
    })
  ).use(errorHandle).use(logger()).use(router.routes()).listen(7000)

app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
})
