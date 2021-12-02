const VITE = Symbol('application#vite-server');
export default {
    get vite() {
        return this[VITE];
    },
    set vite(value) {
        this[VITE] = value;
    }
};
