// Imports
const ccxt = require("ccxt"),
  asTable = require("as-table"),
  log = require("ololog").configure({ locate: false }),
  {} = require("ansicolor").nice;
const config = require("../config/config.json");
require("dotenv").config(); // To read values from .env file
// // Importing coinbase parameters from config
// const coinbaseapiKEY = config.Coinbase.API_KEY;
// const coinbaseSecret = config.Coinbase.API_SECRET;
// const symbols = config.Coinbase.MARKET_OPTIONS.SYMBOLS;
// // Initiating ccxt connection to coinbase
// const exchangeId = "coinbase",
//   exchangeClass = ccxt[exchangeId],
//   exchange = new exchangeClass({
//     apiKey: coinbaseapiKEY,
//     secret: coinbaseSecret,
//     rateLimit: true, // Set the rate limit for how fast you want to get the data
//     verbose: true,
//   });

// async function fetchTickers(exchange) {
//   let tickers = undefined;
//   try {
//     // await exchange.loadMarkets () // optional
//     tickers = await exchange.fetchTickers();
//   } catch (e) {
//     console.error(e.constructor.name, e.message);
//   }
//   console.log(tickers);
// }
// fetchTickers(exchange);

// Bot Options
const wait_time = 5; // seconds to wait between each check
const paper_trading = true; // set to false to actually execute trades

// Exchanges to look for arbitrage opportunities
const exchanges = [
  // new ccxt.okx(),
  new ccxt.bybit({ options: { defaultType: "spot" } }),
  new ccxt.binance(),
  // new ccxt.kucoin(),
  // new ccxt.bitmart(),
  // new ccxt.gate(),
];

// Symbols
const symbols = [
  "BTC/USDT",
  // "LTC/USDT",
  // "DOGE/USDT",
  // "SHIB/USDT",
  // "SOL/USDT",
  "ETH/USDT",
  // "ADA/USDT",
  // "DOT/USDT",
  // "UNI/USDT",
  // "LINK/USDT",
];
const order_sizes = {
  "BTC/USDT": 0.001,
  // "LTC/USDT": 0.01,
  // "DOGE/USDT": 100,
  // "SHIB/USDT": 1000000,
  // "SOL/USDT": 0.1,
  "ETH/USDT": 0.01,
  // "ADA/USDT": 1,
  // "DOT/USDT": 0.1,
  // "UNI/USDT": 0.1,
  // "LINK/USDT": 0.1,
};
// Get the latest prices
async function get_last_prices() {
  const tasks = [];
  for (let i = 0; i < exchanges.length; i++) {
    let ticker = await exchanges[i].fetchTickers(symbols);
    tasks.push(ticker);
  }
  return tasks;
}

// Bot
async function ArbitrageSoftwareBot() {
  for (let i = 0; i < symbols.length; i++) {
    let get_last_price = await get_last_prices();
    const prices = {};
    let min_price = [];
    let max_price = [];
    const symbol_prices = [];
    let ms = Number.parseInt(Date.now * 1000);
    for (let j = 0; j < get_last_price.length; j++) {
      symbol_prices.push(get_last_price[j][symbols[i]].last);
      prices[symbols[i]] = symbol_prices;
    }
    console.log(prices[symbols[i]]);
  }
}
ArbitrageSoftwareBot();
