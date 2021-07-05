const chalk = require('chalk')
const expect = require('chai').expect

class SearchAssetPage {
  /**
   * Search for an asset from assert view.
   * @param page
   * @param asset
   * @returns {Promise<void>}
   * @constructor
   */
  async SearchForAnAsset (page, asset) {
    await page.waitForSelector('#search_for_a_currency_search', { visible: true })
    await page.type('#search_for_a_currency_search', asset)
    const assertListItems = await page.$$('#assert_list_item')
    await page.waitForTimeout(10000)
    switch (asset) {
      case 'BTC': {
        await page.waitForSelector('#BITCOIN', { visible: true })
        await page.click('#BITCOIN')
        break
      }
      default:
        await assertListItems[0].click()
        await page.click('#' + asset)
    }
    console.log(chalk.blue('User search: ' + asset))
    expect(await page.$eval('#overview', el => el.innerText), 'SEND/SWAP page not loaded correctly')
      .to.be.oneOf(['SEND', 'SWAP'])
    await page.waitForTimeout(20000)
  }
}

module.exports = SearchAssetPage
