// Imports
const ccxt = require("ccxt"); // Importing ccxt to connect with CEX
const config = require("../config/config.json");
require("dotenv").config(); // To read values from .env file
// Importing coinbase parameters from config
const coinbaseapiKEY = config.Coinbase.API_KEY;
const coinbaseSecret = config.Coinbase.API_SECRET;
// Initiating ccxt connection to coinbase
const exchangeId = "coinbase",
  exchangeClass = ccxt[exchangeId],
  exchange = new exchangeClass({
    apiKey: coinbaseapiKEY,
    secret: coinbaseSecret,
    rateLimit: true, // Set the rate limit for how fast you want to get the data
    verbose: true,
  });
// Fetching all balances
async function fetchAllBalances(exchange) {
  const params = {};
  let balance = {};
  while (true) {
    const response = await exchange.fetchBalance(params);
    balance = exchange.extend(balance, response);
    const info = exchange.safeValue(response, "info", {});
    const pagination = exchange.safeValue(info, "pagination", {});
    const startingAfter = exchange.safeString(
      pagination,
      "next_starting_after"
    );
    if (startingAfter !== undefined) {
      params["starting_after"] = startingAfter;
    } else {
      break;
    }
  }
  return balance;
}
async function main() {
  const markets = await exchange.loadMarkets();
  const balance = await fetchAllBalances(exchange);
  return balance;
}

main();
