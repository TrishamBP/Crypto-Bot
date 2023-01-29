// Imports
const ccxt = require("ccxt"); // Importing ccxt to connect with CEX
require("dotenv").config(); // To read values from .env file
// Importing coinbase parameters from .env
const coinbaseapiKEY = process.env.COINBASE_API_KEY;
const coinbaseSecret = process.env.COINBASE_API_SECRET;
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
  const exchangeId = "coinbase",
    exchangeClass = ccxt[exchangeId],
    exchange = new exchangeClass({
      apiKey: coinbaseapiKEY,
      secret: coinbaseSecret,
      rateLimit: true, // Set the rate limit for how fast you want to get the data
      verbose: true,
    });
  const markets = await exchange.loadMarkets();
  // coinbase.verbose = true // uncomment for debugging purposes if necessary
  const balance = await fetchAllBalances(exchange);
  return balance;
}

main();
