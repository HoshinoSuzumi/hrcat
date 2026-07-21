import type { ScaffoldConfig } from '../types'

export function generateWidgetIndexHtml(_config: ScaffoldConfig): string {
  return `<!doctype html>
<html lang="zh-CN">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Widget</title>
</head>

<body>
  <div id="app" data-tauri-drag-region></div>
  <script type="module" src="./src/main.ts"></script>
</body>

</html>
`
}

export function generateWidgetMain(_config: ScaffoldConfig): string {
  return `import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

createApp(App).mount('#app')
`
}

export function generateWidgetApp(config: ScaffoldConfig): string {
  return `<script setup lang="ts">
import { useHeartRate } from '../../shared/composables/useHeartRate'

const { hr } = useHeartRate('${config.pluginId}')
</script>

<template>
  <div class="widget" data-tauri-drag-region>
    <span class="hr-value">{{ hr }}</span>
    <span class="hr-label">BPM</span>
  </div>
</template>

<style scoped>
.widget {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  user-select: none;
  -webkit-user-select: none;
}
.hr-value {
  font-size: 2.4em;
  font-weight: 700;
  color: #f87171;
}
.hr-label {
  font-size: 0.8em;
  color: #9ca3af;
}
</style>
`
}

export function generateWidgetStyleCss(_config: ScaffoldConfig): string {
  return `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: transparent;
}

#app {
  width: 100%;
  height: 100%;
}
`
}

export function generateWidgetViteEnvDts(_config: ScaffoldConfig): string {
  return `/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, unknown>
  export default component
}
`
}
