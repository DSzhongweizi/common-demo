
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { visualizer } from 'rollup-plugin-visualizer'
import Unocss from 'unocss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'
import { defineConfig, loadEnv } from 'vite'

export default ({ mode }) => {
  const { VITE_BASE_URL, VITE_BASE_PORT, VITE_BASE_API } = loadEnv(mode, process.cwd())
  return defineConfig({
    plugins: [
      vue(), visualizer(),
      AutoImport({
        resolvers: [ElementPlusResolver({ importStyle: 'sass' })],
        imports: ['vue', 'vue-router', 'pinia'],
        dts: 'types/auto-imports.d.ts'
      }),
      Components({
        resolvers: [ElementPlusResolver({ importStyle: 'sass' })],
        extensions: ['vue', 'md'],
        dts: 'types/components.d.ts'
      }),
      Unocss({})
    ],
    resolve: {
      alias: {
        // '@': fileURLToPath(new URL('./src', import.meta.url)),
        '@': resolve(__dirname, './src'),
        '#': resolve(__dirname, './types'),
        'vue-i18n': 'vue-i18n/dist/vue-i18n.cjs.js' // 去掉vue-i18n莫名其妙的警告
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "@/styles/element.scss" as *;`
        }
      }
    },
    server: {
      proxy: {
        [VITE_BASE_API]: {
          // 需要代理的路径   例如 '/api'
          target: `${VITE_BASE_URL}:${VITE_BASE_PORT}`, // 代理到 目标路径
          changeOrigin: true,
          rewrite: path => path.replace(new RegExp('^' + VITE_BASE_API), '')
        }
      }
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              const arr = id.toString()?.split('node_modules/')[2]?.split('/')
              if (arr?.includes('vue')) return 'vue'
              else if (arr?.includes('zrender')) return 'zrender'
              else if (arr?.includes('echarts')) return 'echarts'
              else if (arr?.includes('element-plus')) return `element-plus${Math.round((Math.random() * 2) + 1)}`
              else return 'module'
            } else return 'src'
          }
        }
      }
    }
  })
}

