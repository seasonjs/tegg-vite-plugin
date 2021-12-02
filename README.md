English | [简体中文](./README.zh-CN.md)

<img src="https://github.com//seasonjs/tools/blob/main/public/icon.svg?raw=true" alt="logo.png" width="150">

# @seasonjs/tegg-vite-plugin

<a href="https://www.npmjs.com/package/@seasonjs/tools"><img src="https://img.shields.io/npm/v/@seasonjs/tegg-vite-plugin.svg?sanitize=true" alt="Version"></a>
<a href="https://www.npmjs.com/package/@seasonjs/tools"><img src="https://img.shields.io/npm/l/@seasonjs/tegg-vite-plugin.svg?sanitize=true" alt="License"></a>

use vite and egg for ssr or csr

## 1. Enable this plugin just two step

This example not enable ssr by default,it just enable csr

1. Add `vite` filed to config by default will use default config it will set vite root dir at `/client`

```typescript
//config/config.default.ts
import {EggAppConfig, PowerPartial} from "egg";

const config: PowerPartial<EggAppConfig> = {
    vite: {}
}
export default config;

```
2. Add tegg-vite-plugin to `plugin.ts`

```typescript
//config/plugin.ts
import { EggPlugin } from 'egg';
import * as path from 'path';

const plugin: EggPlugin = {
  teggVite: {
    enable: true,
    package: '@seasonjs/tegg-vite-plugin',
  },
};

export default plugin;
```

## 2. egg config options

`vite` config filed extends `vite` config options by [InlineConfig](https://vitejs.dev/guide/api-javascript.html#inlineconfig) ,

detail see [vite doc:createserver](https://vitejs.dev/guide/api-javascript.html#createserver).

but there have add an new filed call `teggSSR`:
```typescript

 interface ViteConfig extends InlineConfig {
    teggSSR?: {
        html?: string //template html path
        entry?: string //ssr server js entry
    }
}

```

## 3. Enable SSR

1. Add `vite` filed to config by default will use default config it will set vite root dir at `/client`.

If you use default setting,it will set html path to `your-project-root/client/index.html`

and use ssr-entry by this plugin default render function:


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

or you can set by custom:
```typescript
//config/config.default.ts
import {EggAppConfig, PowerPartial} from "egg";
import * as path from 'path';

const config: PowerPartial<EggAppConfig> = {
    vite: {
        server: {middlewareMode: 'ssr'},
        teggSSR: {
            html: path.reslove('../client/index.html'),//path to your-project/client/index.html
            entry: path.reslove('../client/ssr-entry.ts')//path to your-project/client/ssr-entry.ts
        }
    }
}
export default config;

```
2. Put your render function to controller,if you want to use this plugin default handler:


__[Notie]:  default handler not ready for work__

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

Else I suggest you use your custom handle function It not complex:

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
            // 1. Read index.html
            let template = fs.readFileSync(
                path.resolve(__dirname, 'index.html'),
                'utf-8'
            )

            // 2. Apply Vite HTML transforms. This injects the Vite HMR client, and
            //    also applies HTML transforms from Vite plugins, e.g. global preambles
            //    from @vitejs/plugin-react-refresh
            template = await this.app.vite.transformIndexHtml(url, template)

            // 3. Load the server entry. vite.ssrLoadModule automatically transforms
            //    your ESM source code to be usable in Node.js! There is no bundling
            //    required, and provides efficient invalidation similar to HMR.
            const {render} = await this.app.vite.ssrLoadModule('/src/entry-server.js')

            // 4. render the app HTML. This assumes entry-server.js's exported `render`
            //    function calls appropriate framework SSR APIs,
            //    e.g. ReactDOMServer.renderToString()
            const appHtml = await render(url)

            // 5. Inject the app-rendered HTML into the template.
            const html = template.replace(`<!--ssr-outlet-->`, appHtml)

            // 6. Send the rendered HTML back.
            ctx.status = 200;
            ctx.set('Content-Type', 'text/html');
            ctx.body = html;
        } catch (e) {
            // If an error is caught, let Vite fix the stracktrace so it maps back to
            // your actual source code.
            app.vite.ssrFixStacktrace(e);
            ctx.logger.error(e);
            ctx.res.status(500);
            ctx.body = e.message;
        }
    }
}

```
## Support

Support all node > 14.0.0 and egg > 2.0.0

## Contributors

[@Cyberhan123](https://github.com/cyberhan123)

## License

[MIT](LICENSE)
Copyright © 2021, seasonjs
