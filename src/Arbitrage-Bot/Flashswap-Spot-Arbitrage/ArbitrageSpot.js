// Imports
const ccxt = require("ccxt");
const config = require("../../../config/ArbitrageSpot.json");
const clc = require("cli-clear");
const normalProfitBot = require("../Flashswap-Spot-Arbitrage/Strategies/NormalProfit");
const Utils = require("../Utils/CheckRequirements");
//////////////////////////////////////////////////////////////
// Arbitrage bot that will look for arbitrage opportunities //
// on spot markets and execute them at market price         //
//////////////////////////////////////////////////////////////
// Bot Options
const wait_time = 5; // seconds to wait between each check
const paper_trading = true; // set to false to actually execute trades
// Exchanges to look for arbitrage opportunities
// To execute trades provide API_KEYS and Secret as paramters while to trade
const exchanges = [
  new ccxt.pro.okx(),
  new ccxt.pro.bybit({ options: { defaultType: "spot" } }),
  new ccxt.pro.binance(),
  new ccxt.pro.kucoin(),
  new ccxt.pro.bitmart(),
  new ccxt.pro.gate(),
  new ccxt.pro.huobi(),
  new ccxt.pro.coinbasepro({
    apiKey: config.Arbitrage.Exchanges.Coinbase.API_KEY,
    secret: config.Arbitrage.Exchanges.Coinbase.API_SECRET,
  }),
];
const exchangesId = config.Arbitrage.ExchangesId; // Exchange id
const symbols = config.Arbitrage.Symbols; // Symbols which bot can trade
const order_sizes = config.Arbitrage.OrderSize; // Order Sizes

// Function which fetches data after specific period of time
async function callAfterSeconds() {
  return new Promise((resolve) => {
    setTimeout(async () => {
      await normalProfitBot(
        exchangesId,
        symbols,
        order_sizes,
        paper_trading,
        exchanges
      );
      resolve();
    }, wait_time * 1000);
    console.log(
      "--------------------------------------------------------------------------------------------------------"
    );
  });
}
// The Main function which runs the bot
async function main() {
  clc();
  await Utils.checkRequirements();
  console.log("Starting Bot.......");
  while (true) {
    try {
      await callAfterSeconds();
    } catch (e) {
      console.log(e);
    }
  }
}
main();
