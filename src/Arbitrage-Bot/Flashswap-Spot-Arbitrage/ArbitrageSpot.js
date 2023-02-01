// Imports
const ccxt = require("ccxt"),
  { ansicolor } = require("ansicolor").nice;
const config = require("../../../config/ArbitrageSpot.json");
const clc = require("cli-clear");
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
const exchangesId = config.Arbitrage.ExchangesId; // Exchange id
const symbols = config.Arbitrage.Symbols; // Symbols which bot can trade
const order_sizes = config.Arbitrage.OrderSize; // Order Sizes
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
//

// Bot
async function ArbitrageSoftwareBot() {
  let get_last_price = await get_last_prices();
  for (let i = 0; i < symbols.length; i++) {
    const prices = {};
    const symbol_prices = [];
    let ms = Number.parseFloat(Date.now * 1000);
    let order_size,
      min_index,
      max_index,
      max_exchange,
      min_exchange,
      max_exchange_fee,
      min_fee,
      min_exchange_fee,
      max_fee,
      price_profit,
      profit;
    let max_price = symbol_prices[0],
      min_price = symbol_prices[0];
    for (let j = 0; j < get_last_price.length; j++) {
      symbol_prices.push(get_last_price[j][symbols[i]].last);
      prices[symbols[i]] = symbol_prices;
    }
    for (let i = 0; i < symbol_prices.length; i++) {
      // If we get any element in array greater
      // than max, max takes value of that
      // larger number
      if (symbol_prices[i] > max_price) {
        max_price = symbol_prices[i];
      }
      // If we get any element in array smaller
      // than min, min takes value of that
      // smaller number
      if (symbol_prices[i] < min_price) {
        min_price = symbol_prices[i];
      }
    }
    // min_price = Math.min(Number.parseFloat([...symbol_prices]));
    // max_price = Math.max(Number.parseFloat([...symbol_prices]));
    order_size = order_sizes[symbols[i]];
    min_index = symbol_prices.indexOf(min_price);
    min_exchange = exchangesId[min_index];
    max_index = symbol_prices.indexOf(max_price);
    max_exchange = exchangesId[max_index];

    // Calculate min exchange taker fee
    // Warning you need to manually check if there are special campaign fees
    min_exchange_fee = exchanges[min_index].fees.trading.taker;
    min_fee = order_size * min_price * min_exchange_fee;

    // Calculate max exchange taker fee
    // Warning you need to manually check if there are special campaign fees
    max_exchange_fee = exchanges[max_index].fees.trading.taker;
    max_fee = order_size * max_price * max_exchange_fee;

    price_profit = max_price - min_price;
    // Formula the bot uses to calculate the profit
    profit = price_profit * order_size - min_fee - max_fee;

    // Please understand this bot does not take into consideration account slippage or order book depths
    // Use traingular arbitrage bot instead
    if (profit > 0) {
      console.log(
        ms,
        symbols[i],
        `Profit:${profit}`,
        `Buy on ${min_exchange} at ${min_price} `,
        `Sell on ${max_exchange} at ${max_price} `
      );
      if (!paper_trading) {
        let buy_min = await exchanges[min_index].createMarketBuyOrder(
          symbols[i],
          order_size
        );
        let sell_max = await exchanges[max_index].createMarketSellOrder(
          symbols[i],
          order_size
        );
        console.log(
          `You bought ${symbols[i]}, Order Size: ${order_size} at ${buy_min} on ${exchangesId[min_index]}and sold ${symbols[i]}, Order Size: ${order_size} at ${sell_max} on ${exchangesId[max_index]}`
        );
        console.log("Orders Executed Successfully");
      }
    } else {
      let color = profit > 0 ? ansicolor.green : ansicolor.red;
      let time_now = Date.now() * 1000;
      console.log(
        time_now.toFixed(6),
        `| ${symbols[i].padEnd(2)}`,
        `| Current Profit: ${color(profit)}`,
        "|  No Arbitrage Opportunity Found"
      );
    }
  }
}
// Function which fetches data after specific period of time
async function callAfterSeconds(func) {
  return new Promise((resolve) => {
    setTimeout(async () => {
      await func();
      resolve();
    }, wait_time * 1000);
    console.log(
      "--------------------------------------------------------------------------------------------------------"
    );
  });
}
// The Main function
async function main() {
  clc();
  await Utils.checkRequirements();
  console.log("Starting Bot.......");
  while (true) {
    try {
      await callAfterSeconds(ArbitrageSoftwareBot);
    } catch (e) {
      console.log(e);
    }
  }
}
main();
