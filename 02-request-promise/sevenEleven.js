const fs = require('fs');
const rp = require('request-promise');
const cheerio = require('cheerio');

getAllcities()
.then(cities => {
  const promises = [];
  cities.forEach(el => {
    promises.push(getStoresByCity(el));
  })

  Promise.all(promises)
  .then(results => {
    // fs.writeFileSync('sevenEleven.csv', '城市,電號,店名,地址\n')
    const concatArr = Array.prototype.concat(...results);
    fs.writeFileSync('sevenEleven.csv', convertToCSV(concatArr));
    console.log(convertToCSV(concatArr));
  })
})
.catch(err => {
  console.log(err);
})


function convertToCSV(arr) {
  const array = [Object.keys(arr[0])].concat(arr)

  return array.map(it => {
    return Object.values(it).toString()
  }).join('\n')
}

function getAllcities(){
  const options = {
    method: "GET",
    url: "http://www.ibon.com.tw/retail_inquiry.aspx#gsc.tab=0",
    transform: function(body) {
      return cheerio.load(body);
    }
  };

  return rp(options)
    .then($ => {
      const cities = [];
      $('select#Class1').children().each(function(i, el){
        cities[i] = $(this).text();
      });
      return cities;
    })
    .catch(err => {
      return err;
    })

}

function getStoresByCity(city){
  const options = {
    method: "POST",
    url: "http://www.ibon.com.tw/retail_inquiry_ajax.aspx",
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    },
    body: `strTargetField=COUNTY&strKeyWords=${city}`,
    transform: function(body){
      return cheerio.load(body);
    }
  };

  return rp(options)
    .then($ => {
      const results = [];
      $('tbody').children().slice(1).each(function(i, el){
        results[i] = {
          城市: city,
          店號: $(this).children().eq(0).text(),
          店名: $(this).children().eq(1).text(),
          地址: $(this).children().eq(2).text()
        }
      })
      return results;
    })
    .catch(err => {
      return err;
    })
}