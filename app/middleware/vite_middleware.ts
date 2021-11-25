import {Context} from 'egg'
import {createServer as createViteServer} from 'vite'

export default async function (ctx: Context, next) {
    const {app, config} = ctx;
    // 以中间件模式创建 Vite 应用，这将禁用 Vite 自身的 HTML 服务逻辑
    // 并让上级服务器接管控制
    // 如果你想使用 Vite 自己的 HTML 服务逻辑（将 Vite 作为
    // 一个开发中间件来使用），那么这里请用 'html'
    if (!app.viteDevServe) {
        let inlineConfig = {}
        //如果有配置则传递给vite
        if (config.vite) {
            inlineConfig = config
        }
        app.viteDevServe = await createViteServer(inlineConfig);
    } else {
        await next();
    }
    // if (config.vite.server.middlewareMode==='ssr'){
    //     // 1. 读取 index.html
    //     let template = fs.readFileSync(
    //         path.resolve(__dirname, 'index.html'),
    //         'utf-8'
    //     )
    //     // 2. 应用 Vite HTML 转换。这将会注入 Vite HMR 客户端，
    //     //    同时也会从 Vite 插件应用 HTML 转换。
    //     //    例如：@vitejs/plugin-react-refresh 中的 global preambles
    //     template = await  app.viteDevServe.transformIndexHtml(url, template)
    //
    //     // 3. 加载服务器入口。vite.ssrLoadModule 将自动转换
    //     //    你的 ESM 源码使之可以在 Node.js 中运行！无需打包
    //     //    并提供类似 HMR 的根据情况随时失效。
    //     const { render } = await  app.viteDevServe.ssrLoadModule('/src/entry-server.js')
    //
    //     // 4. 渲染应用的 HTML。这假设 entry-server.js 导出的 `render`
    //     //    函数调用了适当的 SSR 框架 API。
    //     //    例如 ReactDOMServer.renderToString()
    //     const appHtml = await render(url)
    //
    //     // 5. 注入渲染后的应用程序 HTML 到模板中。
    //     const html = template.replace(`<!--ssr-outlet-->`, appHtml)
    //
    // }

    await next();
}


