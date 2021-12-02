import {defaultSSRRender} from "../lib";

const VITE_SSR = Symbol('application#vite-SSR-render');

export default {
    get viteSSRRender() {
        return this[VITE_SSR] = defaultSSRRender;
    },
    // set viteSSRRender(value) {
    //     this[VITE_SSR] = value;
    // },
};
