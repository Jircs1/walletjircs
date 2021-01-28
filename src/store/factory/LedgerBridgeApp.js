
import {
  BRIDGE_IFRAME_ID,
  BRIDGE_REPLEY_PREFIX
} from '../../utils/hw-bridge'

export class LedgerBridgeApp {
  _app

  constructor (app) {
    this._app = app
  }

  sendMessageToHWBridge ({ app, method, payload }) {
    const iframe = document.getElementById(BRIDGE_IFRAME_ID)
    console.log('browser.runtime.id', browser.runtime.id)

    if (iframe) {
      iframe.contentWindow.postMessage({
        app,
        method,
        payload
      }, '*')
      console.log('message send to the bridge: ', app, method, payload)
    } else {
      console.log('message not send: ', app, method, payload)
    }
  }

  sendMessage ({ method, payload }) {
    this.sendMessageToHWBridge({ app: this._app, method, payload })
  }

  getReplySignature (method) {
    return `${BRIDGE_REPLEY_PREFIX}::${this._app}::${method}`
  }

  async callAppMethod (method, ...payload) {
    console.log('callAppMethod', window.document.body)
    const iframe = document.getElementById(BRIDGE_IFRAME_ID)
    console.log('iframe', iframe, BRIDGE_IFRAME_ID)
    const replySignature = this.getReplySignature(method)
    return new Promise((resolve, reject) => {
      window.addEventListener('message', ({
        action,
        success,
        payload
      }) => {
        if (replySignature === action) {
          if (success) {
            resolve(payload)
          } else {
            reject(payload)
          }
        }
      }, {
        once: true,
        passive: true
      })

      this.sendMessage({ method, payload })
      setTimeout(() => {
        reject(new Error(
          `Timeout calling the hw bridge: ${this._app}.${method}`
        ))
      }, 30000)
    })
  }
}
