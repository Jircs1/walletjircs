import { createBridgeClient } from '@/utils/ledger-bridge-provider'
import { requestOriginAccess } from './requestOriginAccess'
import { requestPermission } from './requestPermission'
import { requestUnlockWallet } from './requestUnlockWallet'
import { replyOriginAccess } from './replyOriginAccess'
import { replyPermission } from './replyPermission'
import { replyUnlockWallet } from './replyUnlockWallet'
import { executeRequest } from './executeRequest'
import { handlePaymentUri } from './handlePaymentUri'
import { initializeAnalytics } from './initializeAnalytics'
import { checkAnalyticsOptIn } from './checkAnalyticsOptIn'
import { chains } from '@liquality/cryptoassets'

export const actions = {
  openLedgerBridgeWindow: async ({ rootState, commit }) => {
    const { usbBridgeWindowsId } = rootState
    let existingWindow = null
    const win = await browser.windows.getCurrent()
    const top = win.top + 50
    const left = win.left + 40

    if (usbBridgeWindowsId && usbBridgeWindowsId > 0) {
      try {
        existingWindow = await browser.windows.get(usbBridgeWindowsId)
        browser.windows.update(usbBridgeWindowsId, {
          focused: true,
          height: 600,
          width: 360,
          top,
          left
        })
      } catch (error) {
        console.log(error)
      }
    }

    if (!existingWindow) {
      const url = process.env.VUE_APP_LEDGER_BRIDGE_URL
      const win = await browser.windows.create({
        url: `${url}?extensionId=${browser.runtime.id}`,
        focused: true,
        type: 'popup',
        height: 600,
        width: 360,
        top,
        left
      })
      commit('SET_USB_BRIDGE_WINDOWS_ID', { id: win.id }, { root: true })
    }
  },
  closeExistingBridgeWindow: async ({ windowsId }) => {
    if (windowsId && windowsId > 0) {
      try {
        const existingWindow = await browser.windows.get(windowsId)
        if (existingWindow) {
          await browser.windows.remove(windowsId)
        }
      } catch (error) {
        console.log(error)
      }
    }
  },
  setLedgerBridgeConnected: ({ commit }, { connected }) => {
    commit('SET_LEDGER_BRIDGE_CONNECTED', { connected })
  },
  setLedgerBridgeTransportConnected: ({ commit }, { connected }) => {
    commit('SET_LEDGER_BRIDGE_TRANSPORT_CONNECTED', { connected })
  },
  startBridgeListener: ({ dispatch }, payload) => {
    createBridgeClient(payload)
    dispatch('openLedgerBridgeWindow')
  },
  setAnalyticsOptInModalOpen: ({ commit }, { open }) => {
    commit('SET_ANALYTICS_OPTIN_MODAL_OPEN', { open })
  },
  setBuyCryptoModalOpen: ({ commit, dispatch }, { open, chain, asset, address, screen }) => {
    commit('SET_BUY_CRYPTO_MODAL_OPEN', { open, chain, asset, address })
    if (screen === 'EmptyActivity') {
      dispatch(
        'trackAnalytics',
        {
          event: `Click Buy Crypto from EmptyActivity screen`,
          properties: {
            category: 'Buy Crypto'
          }
        },
        { root: true }
      )
    } else if (screen === 'Receive') {
      dispatch(
        'trackAnalytics',
        {
          event: `Click Buy Crypto from Receive screen`,
          properties: {
            category: 'Buy Crypto',
            chain,
            asset,
            address
          }
        },
        { root: true }
      )
    }
  },
  setBuyCryptoOverviewModalOpen: ({ dispatch, commit }, { open }) => {
    commit('SET_BUY_CRYPTO_OVERVIEW_MODAL_OPEN', { open })
    if (open) {
      dispatch(
        'trackAnalytics',
        {
          event: `Click Buy Crypto from Overview`,
          properties: {
            action: open ? 'open' : 'close',
            category: 'Buy Crypto',
            label: `Buy Crypto from Overview screen`
          }
        },
        { root: true }
      )
    }
  },
  openTransakWidgetTab: ({ dispatch, rootState }, { chain, asset, address }) => {
    const widgetUrl = process.env.VUE_APP_TRANSAK_WIDGET_URL
    const apiKey = process.env.VUE_APP_TRANSAK_API_KEY
    let url = `${widgetUrl}?apiKey=${apiKey}&disablePaymentMethods=apple_pay&cryptoCurrencyCode=${asset}&network=${chain}`

    const _address = chains[chain]?.formatAddress(address, rootState.activeNetwork)
    url = `${url}&walletAddress=${_address}`

    chrome.tabs.create({ url })
    dispatch('setBuyCryptoModalOpen', { open: false })
    dispatch('setBuyCryptoOverviewModalOpen', { open: false })
    dispatch(
      'trackAnalytics',
      {
        event: 'Continue with Transak clicked',
        category: 'Buy Crypto',
        label: 'Buy Crypto Continue with Transak clicked'
      },
      { root: true }
    )
  },
  openOnramperWidgetTab: ({ dispatch, rootState }, { chain, asset, address }) => {
    const widgetUrl = process.env.VUE_APP_ONRAMPER_WIDGET_URL
    const apiKey = process.env.VUE_APP_ONRAMPER_API_KEY
    let url = `${widgetUrl}?apiKey=${apiKey}&defaultCrypto=${asset}`

    const _address = chains[chain]?.formatAddress(address, rootState.activeNetwork)
    url = `${url}&wallets=${asset}:${_address}&onlyCryptos=${asset}`

    chrome.tabs.create({ url })
    dispatch('setBuyCryptoModalOpen', { open: false })
    dispatch('setBuyCryptoOverviewModalOpen', { open: false })
    dispatch(
      'trackAnalytics',
      {
        event: 'Continue with OnRamper clicked',
        category: 'Buy Crypto',
        label: 'Buy Crypto Continue with OnRamper clicked'
      },
      { root: true }
    )
  },
  setLedgerSignRequestModalOpen: ({ commit }, { open }) => {
    commit('SET_LEDGER_SIGN_REQUEST_MODAL_OPEN', { open })
  },
  settingsModalOpen: ({ commit }, isOpen) => {
    commit('SET_SETTINGS_MODAL_OPEN', isOpen)
  },
  requestOriginAccess,
  requestPermission,
  requestUnlockWallet,
  replyOriginAccess,
  replyUnlockWallet,
  replyPermission,
  executeRequest,
  handlePaymentUri,
  initializeAnalytics,
  checkAnalyticsOptIn
}
