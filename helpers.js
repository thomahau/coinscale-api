const moment = require('moment');

function getStartDate(date) {
  return moment(date)
    .subtract(7, 'days')
    .format('YYYY-MM-DD');
}

function parsePriceData(data) {
  //   const priceData = [];
  const priceData = data.map(coin => {
    const coinDatum = {
      currency: coin.currency,
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
