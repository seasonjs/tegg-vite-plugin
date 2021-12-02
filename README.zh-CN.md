[English](./README.md) | 简体中文

<img src="https://github.com//seasonjs/tools/blob/main/public/icon.svg?raw=true" alt="logo.png" width="150">

# @seasonjs/tegg-vite-plugin

使用 vite 和 egg 实现 ssr 或者 csr

### 只需两部即可启动

1. 使用插件默认配置，并配置`vite` 默认字段 这将会将vite的`root`根目录设置在`/client`:

```typescript
//config/config.default.ts
import {EggAppConfig, PowerPartial} from "egg";

const config: PowerPartial<EggAppConfig> = {
    vite: {}
}
export default config;

```

2. 添加 `tegg-vite-plugin` 到 `plugin.ts`

```typescript
//config/plugin.ts
import {EggPlugin} from 'egg';
import * as path from 'path';

const plugin: EggPlugin = {
    teggVite: {
        enable: true,
        package: '@seasonjs/tegg-vite-plugin',
    },
};

export default plugin;
```

### egg 配置文件的字段

`vite` 配置继承于 vite config 的 [InlineConfig](https://vitejs.dev/guide/api-javascript.html#inlineconfig) 类型,

细节可以参考： [vite doc:createserver](https://vitejs.dev/guide/api-javascript.html#createserver).

但是与之不同的是为了方便ssr，增加了 `teggSSR`字段:

```typescript

interface ViteConfig extends InlineConfig {
    teggSSR?: {
        html?: string //html 模板路径
        entry?: string //ssr js 服务文件路径
    }
}

```
## 开启 SSR

1. 添加 `vite`  的默认配置字段 将会使用默认的配置到 `/client`

如果你使用默认配置,将会吧入口设置到 `your-project-root/client/index.html`

并且使用默认的ssr入口渲染方法


```typescript
//config/config.default.ts
import {EggAppConfig, PowerPartial} from "egg";
import * as path from 'path';

const config: PowerPartial<EggAppConfig> = {
    vite: {
        server: {middlewareMode: 'ssr'},
    }
}
export default config;

```

你也可以自定义配置
```typescript
//config/config.default.ts
import {EggAppConfig, PowerPartial} from "egg";
import * as path from 'path';

const config: PowerPartial<EggAppConfig> = {
    vite: {
        server: {middlewareMode: 'ssr'},
        teggSSR: {
            html: path.reslove('../client/index.html'),// 你的项目/client/index.html
            entry: path.reslove('../client/ssr-entry.ts')// 你的项目/client/ssr-entry.ts
        }
    }
}
export default config;

```
2. 把你的处理方法放入Controller,如果你使用的是这个插件的默认ssr render：

*** [注意！！！]:  default handler 还没完全实现 ：） ***

```typescript
//controller/SSRController.ts
import {
    Context,
    EggContext,
    HTTPController,
    HTTPMethod,
    HTTPMethodEnum,
    HTTPQuery,
} from '@eggjs/tegg';
import { EggLogger } from 'egg';


@HTTPController()
export class SSRController {

    @HTTPMethod({
        method: HTTPMethodEnum.GET,
        path: '/*',
    })
    async hello(@Context() ctx: EggContext) {
        this.logger.info('access url: %s', ctx.url);
        ctx.viteSSRRender(ctx)
    }
}

```

除此之外我更建议你定制自己的处理方法，其实也并不复杂：

```typescript
//controller/SSRController.ts
import {
    Context,
    EggContext,
    HTTPController,
    HTTPMethod,
    HTTPMethodEnum,
    HTTPQuery,
} from '@eggjs/tegg';
import {Application, EggLogger} from 'egg';


@HTTPController()
export class SSRController {
    @Inject()
    private app: Application;

    @HTTPMethod({
        method: HTTPMethodEnum.GET,
        path: '/*',
    })
    async hello(@Context() ctx: EggContext) {
        this.logger.info('access url: %s', ctx.url);
        const url = ctx.req.originalUrl

        try {
            // 1. 读取 index.html
            let template = fs.readFileSync(
                path.resolve(__dirname, 'index.html'),
                'utf-8'
            )

            // 2. 应用 Vite HTML 转换。这将会注入 Vite HMR 客户端，
            //    同时也会从 Vite 插件应用 HTML 转换。
            //    例如：@vitejs/plugin-react-refresh 中的 global preambles
            template = await this.app.vite.transformIndexHtml(url, template)

            // 3. 加载服务器入口。vite.ssrLoadModule 将自动转换
            //    你的 ESM 源码使之可以在 Node.js 中运行！无需打包
            //    并提供类似 HMR 的根据情况随时失效。
            const {render} = await this.app.vite.ssrLoadModule('/src/entry-server.js')

            // 4. 渲染应用的 HTML。这假设 entry-server.js 导出的 `render`
            //    函数调用了适当的 SSR 框架 API。
            //    例如 ReactDOMServer.renderToString()
            const appHtml = await render(url)

            // 5. 注入渲染后的应用程序 HTML 到模板中。
            const html = template.replace(`<!--ssr-outlet-->`, appHtml)

            // 6. 返回渲染后的 HTML。
            ctx.status = 200;
            ctx.set('Content-Type', 'text/html');
            ctx.body = html;
        } catch (e) {
            // 如果捕获到了一个错误，让 Vite 来修复该堆栈，这样它就可以映射回
            // 你的实际源码中。
            app.vite.ssrFixStacktrace(e);
            ctx.logger.error(e);
            ctx.res.status(500);
            ctx.body = e.message;
        }
    }
}

```
## 支持

支持所有 node > 14.0.0 并且 egg > 2.0.0

## 贡献者

[@Cyberhan123](https://github.com/cyberhan123)

## 协议

[MIT](LICENSE)
Copyright © 2021, seasonjs
