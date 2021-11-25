import {Application} from "egg";
import vite_middleware from "./app/middleware/vite_middleware";
import c2k from 'koa2-connect'

export default class App {
    private readonly app: Application;

    constructor(app: Application) {
        this.app = app;
    }

    configDidLoad() {
        this.app.use(vite_middleware)
        if (this.app.viteDevServe) {
            this.app.use(c2k(this.app.viteDevServe.middlewares))
        }
    }

}
