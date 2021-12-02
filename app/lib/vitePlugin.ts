import {createServer as createViteServer, InlineConfig} from 'vite';
import * as path from 'path';
import * as c2k from 'koa2-connect';
import * as fs from 'fs';


export async function initVitePlugin(app) {
    let config: InlineConfig = {
        root: './client',
        configFile: path.resolve('./client/vite.config.ts'),
        server: {middlewareMode: 'html'},
    }
    try {
        if (!app.vite) {
            app.logger.info('[tegg-vite-plugin]', 'vite serve init');
            if (app.config.vite === false) {
                app.logger.info('[tegg-vite-plugin]', 'vite serve shutdown by config false');
            } else {
                if (app.config?.vite?.key?.()?.length > 0) {
                    config = app.config.vite;
                    app.logger.info('[tegg-vite-plugin]', 'vite serve will use custom config.');
                } else {
                    app.logger.info('[tegg-vite-plugin]', 'vite serve will use default config, dev serve root at client.');
                }
                app.vite = await createViteServer(config);
            }
        }
        app.use(c2k(app.vite.middlewares));
    } catch (e) {
        app.logger.error('[tegg-vite-plugin]', e);
    }
}

export async function defaultSSRRender(ctx) {
    const url = ctx.req.originalUrl;
    let root = ctx.config?.vite?.teggSSR?.html;
    let entry = ctx.config?.vite?.teggSSR?.entry

    //检查html渲染模板
    if (root) {
        ctx.logger.info('[tegg-vite-plugin]', 'defaultSSRRender set ssr index.html template by [config.vite.teggSSR.html] keyword and path is', root);
    } else {
        if (ctx.config?.vite?.root) {
            root = ctx.config?.vite?.root
            ctx.logger.info('[tegg-vite-plugin]', 'defaultSSRRender set ssr index.html template by [ctx.config.vite.root] and path is', root);
        } else {
            root = path.resolve('./client/index.html');
            ctx.logger.info('[tegg-vite-plugin]', 'defaultSSRRender set ssr index.html template by default at', root);
        }
    }

    if (entry) {
        ctx.logger.info('[tegg-vite-plugin]', 'defaultSSRRender set ssr index.html template by [config.vite.teggSSR.entry] keyword and path is', root);
    } else {
        ctx.logger.warn('[tegg-vite-plugin]', 'defaultSSRRender will use default ssr render entry');
        entry = path.resolve(__dirname, './entry-server.js')
    }
    try {
        // 1. 读取 index.html
        let template = fs.readFileSync(
            root,
            'utf-8'
        );

        // 2. 应用 Vite HTML 转换。这将会注入 Vite HMR 客户端，
        //    同时也会从 Vite 插件应用 HTML 转换。
        //    例如：@vitejs/plugin-react-refresh 中的 global preambles
        template = await ctx.app.vite.transformIndexHtml(url, template);

        // 3. 加载服务器入口。vite.ssrLoadModule 将自动转换
        //    你的 ESM 源码使之可以在 Node.js 中运行！无需打包
        //    并提供类似 HMR 的根据情况随时失效。


        const {render} = await ctx.app.vite.ssrLoadModule(entry)


        // 4. 渲染应用的 HTML。这假设 entry-server.js 导出的 `render`
        //    函数调用了适当的 SSR 框架 API。
        //    例如 ReactDOMServer.renderToString()
        const appHtml = await render(url);

        // 5. 注入渲染后的应用程序 HTML 到模板中。
        const html = template.replace(`<!--ssr-outlet-->`, appHtml);

        // 6. 返回渲染后的 HTML。
        ctx.status = 200;
        ctx.set('Content-Type', 'text/html');
        ctx.body = html;
    } catch
        (e) {
        // 如果捕获到了一个错误，让 Vite 来修复该堆栈，这样它就可以映射回
        // 你的实际源码中。
        ctx.app.vite.ssrFixStacktrace(e);
        ctx.logger.error('[tegg-vite-plugin]', e);
        ctx.res.status(500);
        ctx.body = e.message;
    }

}
