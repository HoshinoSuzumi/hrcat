import type { ScaffoldConfig } from '../types'

export function generateStreamingIndexHtml(_config: ScaffoldConfig): string {
  return `<!doctype html>
<html lang="zh-CN">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Streaming</title>
</head>

<body>
  <div id="app"></div>
  <script type="module" src="./src/main.ts"></script>
</body>

</html>
`
}

export function generateStreamingMain(_config: ScaffoldConfig): string {
  return `import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

createApp(App).mount('#app')
`
}

export function generateStreamingApp(config: ScaffoldConfig): string {
  return `<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { getPluginConfig, subscribeToEvent, type EventSubscription } from '@hrcat/plugin'

const hr = ref(0)
let sub: EventSubscription | null = null

onMounted(async () => {
  const cfg = await getPluginConfig('${config.pluginId}')
  console.log('[Streaming] Plugin config:', cfg)

  sub = subscribeToEvent('${config.pluginId}', 'heart-rate', (event) => {
    hr.value = event.value
  })
})

onUnmounted(() => {
  sub?.unsubscribe()
})
</script>

<template>
  <div class="streaming-overlay">
    <span class="hr-value">{{ hr }}</span>
    <span class="hr-label">BPM</span>
  </div>
</template>

<style scoped>
.streaming-overlay {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #fff;
  text-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
}
.hr-value {
  font-size: 4em;
  font-weight: 700;
  color: #f87171;
}
.hr-label {
  font-size: 1em;
  opacity: 0.7;
}
</style>
`
}

export function generateStreamingStyleCss(_config: ScaffoldConfig): string {
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

export function generateStreamingViteEnvDts(_config: ScaffoldConfig): string {
  return `/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, unknown>
  export default component
}
`
}
