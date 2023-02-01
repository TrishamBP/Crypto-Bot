"use strict";
const ccxt = require("ccxt");
function handleErrors(e, message) {
  if (e instanceof ccxt.DDoSProtection || e.message.includes("ECONNRESET")) {
    console.log("[DDoS Protection] " + e.message);
  } else if (e instanceof ccxt.RequestTimeout) {
    console.log("[Request Timeout] " + e.message);
  } else if (e instanceof ccxt.AuthenticationError) {
    console.log("[Authentication Error] " + e.message);
  } else if (e instanceof ccxt.ExchangeNotAvailable) {
    console.log("[Exchange Not Available Error] " + e.message);
  } else if (e instanceof ccxt.ExchangeError) {
    console.log("[Exchange Error] " + e.message);
  } else if (e instanceof ccxt.NetworkError) {
    console.log("[Network Error] " + e.message);
  } else {
    message;
  }
}
module.exports = {
  handleErrors: handleErrors,
};
