const rq = require('request');
const cheerio = require('cheerio');
const options = {
  method: 'GET',
  url: 'http://invoice.etax.nat.gov.tw/'
}

scrape((thisTime, lastTime) => {
  console.log({
    thisTime: thisTime,
    lastTime: lastTime
  });
});

function scrape(cb){
  rq(options, (err, res, body) => {
    const $ = cheerio.load(body);
    const thisTime = {
      日期: $('h2').eq(1).text(),
      特別獎: $('.t18Red').eq(0).text(),
      特獎: $('.t18Red').eq(1).text(),
      頭獎: $('.t18Red').eq(2).text(),
      增開六獎: $('.t18Red').eq(3).text()
    };
    const lastTime = {
        日期: $('h2').eq(3).text(),
        特別獎: $('.t18Red').eq(4).text(),
        特獎: $('.t18Red').eq(5).text(),
        頭獎: $('.t18Red').eq(6).text(),
        增開六獎: $('.t18Red').eq(7).text()
    };
    return cb(thisTime, lastTime);
  })
}