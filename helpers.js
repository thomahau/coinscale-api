const moment = require('moment');
const coinWatchlist = {
  BTC: 'Bitcoin',
  ETH: 'Ethereum',
  XRP: 'Ripple',
  BCH: 'Bitcoin Cash',
  EOS: 'EOS',
  LTC: 'Litecoin',
  ADA: 'Cardano',
  XLM: 'Stellar',
  DASH: 'Dash',
  DOGE: 'Dogecoin',
  XEM: 'NEM',
  XMR: 'Monero'
};
// BCH first date: 2017-07-27
// EOS first date: 2017-06-28
// ADA first date: 2017-10-01

function getStartDate(date) {
  return moment(date)
    .subtract(7, 'days')
    .format('YYYY-MM-DD');
}

function parsePriceData(data) {
  // filter to find only the coins in our watchlist
  const filteredData = data.filter(coin => Object.keys(coinWatchlist).includes(coin.currency));
  // extract and parse the data client needs
  const priceData = filteredData.map(coin => {
    const coinDatum = {
      currency: coin.currency,
      name: coinWatchlist[coin.currency],
      current: coin.close
    };
    const momentA = moment(coin.close_timestamp);
    const momentB = moment(coin.open_timestamp);
    // Check if coin price seven days earlier exists
    if (momentA.diff(momentB, 'days') === 7) {
      coinDatum.sevenDaysAgo = coin.open;
    } else {
      coinDatum.sevenDaysAgo = 'N/A';
    }

    return coinDatum;
  });

  return priceData;
}

module.exports = {
  getStartDate,
  parsePriceData
};
