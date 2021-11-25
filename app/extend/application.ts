const SERVER = Symbol('application#vite-server');
export default {
    get viteDevServe() {
        return this[SERVER];
    },
    set viteDevServe(value) {
        this[SERVER] = value;
    },
}
