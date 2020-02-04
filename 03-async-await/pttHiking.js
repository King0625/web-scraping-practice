const rp = require("request-promise");
const cheerio = require('cheerio');
const moment = require('moment');
//
getTheNewestPage()
.then(newestPage => {
  console.log(newestPage);
  main(newestPage)
  .then(result => {
    console.log(result);
  })
});
// console.log(newestPage);

async function main(page = ''){
  const result = await getPostsByPage(page);
  if(result.previous_page_num === 1019){
    return result.posts;
  }else{
    return result.posts.concat(await main(result.previous_page_num));
  }
}

async function getTheNewestPage(){
  const options = {
    method: "GET",
    url: `https://www.ptt.cc/bbs/Hiking/index.html`,
    transform: function(body){
      return cheerio.load(body);
    }
  }

  const $ = await rp(options);

  const previous = $('#action-bar-container > div > div.btn-group.btn-group-paging > a:nth-child(2)').attr('href');
  const newestPage = Number(previous.match(/[\d]+/)[0]) + 1;
  return newestPage;
}

async function getPostsByPage(page){
  const options = {
    method: "GET",
    url: `https://www.ptt.cc/bbs/Hiking/index${page}.html`,
    transform: function(body){
      return cheerio.load(body);
    }
  }

  const $ = await rp(options);
  const posts = [];
  $('.r-ent').each(function(i, el){
    if($(this).children().eq(1).children().attr('href') !== undefined){
      posts.push({
        title: $(this).children().eq(1).text().trim(),
        uri: 'https://www.ptt.cc' + $(this).children().eq(1).children().attr('href'),
        author: $(this).children().eq(2).children().eq(0).text(),
        date: $(this).children().eq(2).children().eq(2).text().trim()
      });
    }
  });

  const previous = $('#action-bar-container > div > div.btn-group.btn-group-paging > a:nth-child(2)').attr('href');

  return {
    posts: posts,
    previous_page: 'https://www.ptt.cc' + previous,
    previous_page_num: Number(previous.match(/[\d]+/)[0])
  };
}