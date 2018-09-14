const subDays = require('date-fns/sub_days');
const format = require('date-fns/format');
const differenceInDays = require('date-fns/difference_in_days');
const coinWatchlist = {
  ADA: 'Cardano',
  AE: 'Aeternity',
  AMP: 'Synereo',
  ARDR: 'Ardor',
  ARK: 'Ark',
  BCH: 'Bitcoin Cash',
  BCN: 'Bytecoin',
  BNB: 'Binance Coin',
  BTC: 'Bitcoin',
  DASH: 'Dash',
  DCR: 'Decred',
  DGB: 'DigiByte',
  DGD: 'DigixDAO',
  DOGE: 'Dogecoin',
  EOS: 'EOS',
  ETC: 'Ethereum Classic',
  ETH: 'Ethereum',
  GAME: 'GameCredits',
  ICX: 'ICON',
  KMD: 'Komodo',
  LSK: 'Lisk',
  LTC: 'Litecoin',
  MAID: 'MaidSafeCoin',
  MONA: 'MonaCoin',
  NEO: 'NEO',
  NMC: 'Namecoin',
  NXT: 'Nxt',
  OMG: 'OmiseGO',
  PPC: 'Peercoin',
  REP: 'Augur',
  STEEM: 'Steem',
  STRAT: 'Stratis',
  SYS: 'Syscoin',
  TRX: 'TRON',
  VEN: 'VeChain',
  VTC: 'Vertcoin',
  WAVES: 'Waves',
  XCP: 'Counterparty',
  XEM: 'NEM',
  XLM: 'Stellar',
  XMR: 'Monero',
  XRP: 'Ripple',
  XVG: 'Verge',
  ZEC: 'Zcash',
  ZRX: '0x'
};

function getStartDate(date) {
  const startDate = subDays(new Date(date), 7);
  return format(startDate, 'YYYY-MM-DD');
}

function parsePriceData(data) {
  // Filter to find only the coins in our watchlist
  const filteredData = data.filter(coin => Object.keys(coinWatchlist).includes(coin.currency));
  // Extract and parse the data client needs
  const priceData = filteredData.map(coin => {
    const coinDatum = {
      currency: coin.currency,
      name: coinWatchlist[coin.currency],
      current: _round(coin.close)
    };
    // Check if coin price seven days earlier exists
    const dateA = new Date(coin.close_timestamp);
    const dateB = new Date(coin.open_timestamp);

    if (differenceInDays(dateA, dateB) === 7) {
      coinDatum.sevenDaysAgo = _round(coin.open);
    } else {
      coinDatum.sevenDaysAgo = 'N/A';
    }

    return coinDatum;
  });

  return priceData;
}

function _round(value, decimals = 2) {
  // Round input to standardized number of decimals
  if (Math.abs(value) >= 1) {
    return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals)
      .toFixed(decimals)
      .toString();
  } else {
    return value;
  }
}

module.exports = {
  getStartDate,
  parsePriceData
};
