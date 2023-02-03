const ccxt = require("ccxt");
const config = require("../../../../config/ArbitrageSpot.json");
//////////////////////////////////////////////////////////////
// Arbitrage bot that will look for arbitrage opportunities //
//        on spot markets considering market depth          //
//             and execute them at market price             //
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
  new ccxt.wazirx(),
];
const exchangesId = config.Arbitrage.ExchangesIdMarketDepth; // Exchange id
const symbols = config.Arbitrage.Symbols; // Symbols which bot can trade
const order_sizes = config.Arbitrage.OrderSize; // Order Sizes

const aggregateOrderBookSide = function (orderbookSide, precision = undefined) {
  const result = [];
  const amounts = {};
  for (let i = 0; i < orderbookSide.length; i++) {
    const ask = orderbookSide[i];
    let price = ask[0];
    if (precision !== undefined) {
      price = ccxt.decimalToPrecision(
        price,
        ccxt.ROUND,
        precision,
        ccxt.TICK_SIZE
      );
    }
    amounts[price] = (amounts[price] || 0) + ask[1];
  }
  Object.keys(amounts).forEach((price) => {
    result.push([parseFloat(price), amounts[price]]);
  });
  return result;
};

const aggregateOrderBook = function (orderbook, precision = undefined) {
  let asks = aggregateOrderBookSide(orderbook["asks"], precision);
  let bids = aggregateOrderBookSide(orderbook["bids"], precision);
  return {
    asks: ccxt.sortBy(asks, 0),
    bids: ccxt.sortBy(bids, 0, true),
    timestamp: orderbook["timestamp"],
    datetime: orderbook["datetime"],
    nonce: orderbook["nonce"],
  };
};
async function arbitrageSoftwareBotMarketDepthProfit() {
  for (let i = 0; i < exchanges.length; i++) {
    await exchanges[i].loadMarkets();
    const tasks = [];
    for (let j = 0; j < symbols.length; j++) {
      try {
        let orderbook = await exchanges[i].fetchOrderBook(symbols[j]);
        let step = 0.5;
        let orders = aggregateOrderBook(orderbook, step);
        tasks.push(orders);
      } catch (e) {
        continue;
      }
      console.log(`${exchanges[i]}`, `${symbols[j]}`, tasks);
    }
  }
}
async function fetchOrderBook() {
  const tasks = [];
  for (let i = 0; i < exchanges.length; i++) {
    await exchanges[i].loadMarkets();
    for (let j = 0; j < symbols.length; j++) {
      try {
        let orderbook = await exchanges[i].fetchOrderBook(symbols[j]);
        let step = 0.5;
        let orders = aggregateOrderBook(orderbook, step);
        tasks.push(orders);
      } catch (e) {
        continue;
      }
    }
  }
  console.log(tasks);
  return tasks;
}

arbitrageSoftwareBotMarketDepthProfit();
