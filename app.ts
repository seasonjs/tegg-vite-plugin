import { Application } from 'egg';
import { initVitePlugin } from './lib'

export default class App {
  readonly app: Application;

  constructor(app: Application) {
    this.app = app;
    initVitePlugin(this.app)
  }
}
