// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

const noop = () => undefined

const createNoopProxy = (): any => {
  return new Proxy(noop, {
    get(target, prop) {
      if (prop === 'then') return undefined
      if (prop === Symbol.iterator) {
        return function* iterator() {}
      }
      return Reflect.get(target, prop) || createNoopProxy()
    },
    apply() {
      return Promise.resolve(undefined)
    },
  })
}

const createBridgeSection = () =>
  new Proxy(
    {},
    {
      get(target, prop) {
        if (!(prop in target)) {
          target[prop as keyof typeof target] = createNoopProxy()
        }
        return target[prop as keyof typeof target]
      },
    },
  )

const YAKIT_BRIDGE_SECTIONS = [
  'app',
  'theme',
  'system',
  'network',
  'shell',
  'reverse',
  'risk',
  'asset',
  'httpFlow',
  'host',
  'window',
  'windowControls',
  'childWindow',
  'dialog',
  'logs',
  'editorTools',
  'perf',
  'cache',
  'clipboard',
  'profile',
  'auth',
  'release',
  'engine',
  'upload',
  'exporter',
  'extractor',
  'processEnv',
  'plugin',
  'script',
  'mcp',
  'duplex',
  'socket',
  'stream',
  'uiLayout',
  'project',
  'codec',
  'fileSystem',
  'ai',
] as const

const createBridgeMap = (keys: readonly string[]) => Object.fromEntries(keys.map((key) => [key, createBridgeSection()]))

const globalWindow = window as typeof window & {
  yakitBridge?: Record<string, any>
  require?: (moduleName: string) => any
}

if (!globalWindow.yakitBridge) {
  globalWindow.yakitBridge = createBridgeMap(YAKIT_BRIDGE_SECTIONS)
}

if (!globalWindow.require) {
  globalWindow.require = (moduleName: string) => {
    if (moduleName === 'electron') {
      return createBridgeMap(['ipcRenderer', 'shell', 'clipboard'])
    }

    return createBridgeSection()
  }
}

const canvasContext2D = new Proxy(
  {
    canvas: document.createElement('canvas'),
    measureText: () => ({ width: 0 }),
    createLinearGradient: () => ({ addColorStop: noop }),
    createPattern: () => null,
    createRadialGradient: () => ({ addColorStop: noop }),
    getImageData: () => ({ data: [], width: 0, height: 0 }),
    putImageData: noop,
    drawImage: noop,
  },
  {
    get(target, prop) {
      if (prop in target) {
        return target[prop as keyof typeof target]
      }
      return noop
    },
  },
)

Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  configurable: true,
  value: () => canvasContext2D as unknown as RenderingContext,
})

Object.defineProperty(HTMLCanvasElement.prototype, 'toDataURL', {
  configurable: true,
  value: () => '',
})

if (!URL.createObjectURL) {
  Object.defineProperty(URL, 'createObjectURL', {
    configurable: true,
    value: () => 'blob:mock-url',
  })
}

if (!URL.revokeObjectURL) {
  Object.defineProperty(URL, 'revokeObjectURL', {
    configurable: true,
    value: noop,
  })
}

if (!globalThis.Worker) {
  class MockWorker {
    onmessage: ((event: MessageEvent) => void) | null = null

    postMessage() {}

    terminate() {}

    addEventListener() {}

    removeEventListener() {}

    dispatchEvent() {
      return true
    }
  }

  Object.defineProperty(globalThis, 'Worker', {
    configurable: true,
    value: MockWorker,
  })
}
