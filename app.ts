import { Application } from 'egg';
import { initVitePlugin } from './app/lib'

export default class App {
  readonly app: Application;

  constructor(app: Application) {
    this.app = app;
    initVitePlugin(this.app)
  }
}
