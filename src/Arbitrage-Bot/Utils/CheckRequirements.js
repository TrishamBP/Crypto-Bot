"use strict";
const ccxt = require("ccxt"),
  log = require("ololog").configure({ locate: false });

const config = require("../../../config/ArbitrageSpot.json");
const handleErrors = require("../Utils/HandleErrors");
require("ansicolor").nice;
const exchangeIds = config.Arbitrage.ExchangesId;
const symbols = config.Arbitrage.Symbols;

async function checkRequirements() {
  const exchanges = {};
  for (let symbol of symbols) {
    for (let exchangeId of exchangeIds) {
      let exchange = undefined;
      try {
        // try creating the exchange instance first and handle errors if any
        // check if we have created an instance of this exchange already
        exchange = exchanges[exchangeId];
        if (exchangeId == "coinbase") {
          exchange = new ccxt.pro.coinbasepro({
            apiKey: config.Arbitrage.Exchanges.Coinbase.API_KEY,
            secret: config.Arbitrage.Exchanges.Coinbase.API_SECRET,
          });
        } else {
          if (exchange === undefined) {
            // create the exchange instance
            exchange = new ccxt.pro[exchangeId]();
            // Right now manually adding coinbase api
          }
        }
        exchanges[exchangeId] = exchange; // save it for later use
      } catch (e) {
        let message = log.red(
          "Could not create exchange",
          exchangeId + ":",
          e.constructor.name,
          e.message
        );
        handleErrors.handleErrors(e, message);
        // uncomment the following line to interrupt program execution on error
        // or leave it commented out to do nothing
        // process.exit();
      }
      if (exchange !== undefined) {
        // preload all markets first
        try {
          await exchange.loadMarkets();
        } catch (e) {
          let message = log.red(
            "Could not load markets from",
            exchange.id + ":",
            e.constructor.name,
            e.message
          );
          handleErrors.handleErrors(e, message);
          continue; // skip this exchange if markets failed to load
        }

        for (let symbol of symbols) {
          try {
            // try fetching the ticker for a symbol existing with that exchange
            const ticker = await exchange.fetchTicker(symbol);
            log.green("Ticker Available");
          } catch (e) {
            let message = log.red(
              "Could not fetch",
              symbol,
              "ticker from",
              exchange.id + ":",
              e.constructor.name,
              e.message
            );
            handleErrors.handleErrors(e, message);
          }
        }
      }
    }
    return;
  }
}
module.exports = {
  checkRequirements: checkRequirements,
};
