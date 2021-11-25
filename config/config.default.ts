import {InlineConfig} from "vite";

const config: { vite: InlineConfig } = {
    vite: {
        server: {
            middlewareMode: 'html'
        }
    }
}
export default config;
