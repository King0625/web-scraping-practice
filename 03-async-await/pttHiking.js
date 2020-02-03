const rp = require("request-promise");
const cheerio = require('cheerio');

getPostsByPage()
  .then(result => {
    console.log(result);
  });

async function getPostsByPage(url = 'https://www.ptt.cc/bbs/Hiking/index.html'){
  const options = {
    method: "GET",
    url: url,
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
        date: $(this).children().eq(2).children().eq(2).text()
      });
    }
  });

  const previous = $('#action-bar-container > div > div.btn-group.btn-group-paging > a:nth-child(2)').attr('href');

  return {
    posts: posts,
    previous_page: 'https://www.ptt.cc' + previous,
  };
}