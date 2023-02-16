import axios from "axios";

const API_KEY =
  "7dde93effe4aa7515d991c648b5cd84faa9640e372dd09dc5fe689b899ab66c1";
const BASE_URL = "https://min-api.cryptocompare.com/data/";

const tickersHandlers = new Map();

axios.defaults.baseURL = BASE_URL;

// export const loadTickers = async (tickerName) =>
//   await fetch(
//     `https://min-api.cryptocompare.com/data/price?fsym=${tickerName}&tsyms=USD&api_key=${API_KEY}`
//   ).then((r) => r.json());

// export const loadTickers = async () => {
//   const searchParams = new URLSearchParams({
//     fsyms: [...tickersHandlers.keys()].join(","),
//     tsyms: "USD",
//     api_key: API_KEY,
//   });
//   return await axios.get(`price?${searchParams}`);
// };

const loadTickers = () => {
  const url = new URL("https://min-api.cryptocompare.com/data/pricemulti");
  const searchParams = new URLSearchParams({
    fsyms: [...tickersHandlers.keys()].join(","),
    tsyms: "USD",
    api_key: API_KEY,
  });

  if (tickersHandlers.size === 0) {
    return;
  }

  fetch(`${url}?${searchParams}`)
    .then((r) => r.json())
    .then((rawData) => {
      const updatedPrices = Object.fromEntries(
        Object.entries(rawData).map(([key, value]) => [key, value.USD])
      );

      Object.entries(updatedPrices).forEach(([currency, newPrice]) => {
        const handlers = tickersHandlers.get(currency) ?? [];
        handlers.forEach((fn) => fn(newPrice));
      });
    });
};

//получать обновления стомости криптовалютных пар с АПИшки

// подписываемся на тикер
export const subscribeToTicker = (ticker, cb) => {
  const subscribers = tickersHandlers.get(ticker) || [];
  tickersHandlers.set(ticker, [...subscribers, cb]);
};

// отписываемся от тикера
export const unsubscribeFromTicker = (ticker) => {
  tickersHandlers.delete(ticker);
};
setInterval(loadTickers, 5000);

window.tickers = tickersHandlers;
