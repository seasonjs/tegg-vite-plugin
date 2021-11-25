import {Application, Context} from 'egg';
import {ViteDevServer} from "vite";

declare module 'egg' {
    interface ViteApplication {
        viteDevServe: ViteDevServer;
    }

    interface ViteContext {

    }

    interface Application extends ViteApplication {
    }

    interface Context extends ViteContext {
    }
}
