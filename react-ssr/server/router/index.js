import koaRouter from 'koa-router'

const apiRouter = koaRouter()

apiRouter.get('/', (ctx, next) => {
  ctx.body = `
    <!doctype html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport"
            content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="ie=edge">
      <title>Document</title>
    </head>
    <body>
    <div id="root"><!-- app --></div>
    </body>
    </html>
  `
})

export default apiRouter
