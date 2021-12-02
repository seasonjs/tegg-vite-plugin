import {InlineConfig, ViteDevServer} from "vite";

declare module 'egg' {
    interface ViteApplication {
        vite: ViteDevServer;
    }

    interface ViteContext {
        viteSSRRender: (ctx) => Promise<void>;
    }

    interface Application extends ViteApplication {


    }

    interface Context extends ViteContext {
    }

    interface ViteConfig extends InlineConfig {
        teggSSR?: {
            html?: string
            entry?: string
        }
    }

    interface EggAppConfig extends NewEggAppConfig {
        vite?: ViteConfig | boolean
    }
}
