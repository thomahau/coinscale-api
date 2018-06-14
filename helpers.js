const moment = require('moment');

function getStartDate(date) {
  return moment(date)
    .subtract(7, 'days')
    .format('YYYY-MM-DD');
}

function parsePriceData(data) {
  const priceData = data.map(coin => {
    return {
      currency: coin.currency,
      current: coin.close,
      sevenDaysAgo: coin.open
    };
  });

  return priceData;
}

module.exports = {
  getStartDate,
  parsePriceData
};
