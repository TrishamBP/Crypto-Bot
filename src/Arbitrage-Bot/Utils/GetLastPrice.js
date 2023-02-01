const ccxt = require("ccxt");
const config = require("../../../config/ArbitrageSpot.json");
const symbols = config.Arbitrage.Symbols; // Symbols which bot can trade
// Exchanges to look for arbitrage opportunities
// To execute trades provide API_KEYS and Secret as paramters while to trade
const exchanges = [
  new ccxt.okx(),
  new ccxt.bybit({ options: { defaultType: "spot" } }),
  new ccxt.binance(),
  new ccxt.kucoin(),
  new ccxt.bitmart(),
  new ccxt.gate(),
  new ccxt.huobi(),
  new ccxt.coinbase({
    apiKey: config.Arbitrage.Exchanges.Coinbase.API_KEY,
    secret: config.Arbitrage.Exchanges.Coinbase.API_SECRET,
  }),
];
// Get the latest prices
async function get_last_prices() {
  const tasks = [];
  for (let i = 0; i < exchanges.length; i++) {
    await exchanges[i].loadMarkets(); // Loading markets
    let ticker = await exchanges[i].fetchTickers(symbols);
    tasks.push(ticker);
  }
  return tasks;
}
module.exports = {
  get_last_prices: get_last_prices,
};
