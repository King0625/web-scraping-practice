const rp = require('request-promise');
const cheerio = require('cheerio');
const pageOptions = (url, page) => {
  return {
    method: "GET",
    url: `${url}?page=${page}`,
    json: true
  };
}

getTeamMembers()
.then(members => {
  const promises = [];
  members.forEach(function(el){
    promises.push(getPostsByMember(el));
  });

  Promise.all(promises)
  .then(result => {
    console.log(result);
  })
})

async function getTeamMembers(){
  const options = {
    method: "GET",
    url: "https://ithelp.ithome.com.tw/2020ironman/signup/team/78",
    transform: function(body){
      return cheerio.load(body);
    }
  }

  const $ = await rp(options);

  const members = [];
  $('.contestants-list__title').each(function(i, el){
    const urlPieces = $(this).attr('href').split('/'); 
    urlPieces.splice(3, 0, "m/api");
    const url = urlPieces.join('/')
    members.push(url);
  })
  return members;
}

async function getPostsByMember(url){
  const options = pageOptions(url, 'undefined')

  const body = await rp(options);
  const total_pages = body.paginator.total_pages
  const articles = [];
  for(let i = 1; i <= total_pages; i++){
    const options = pageOptions(url, i);
    const jsonResult = await rp(options);
    articles.push(jsonResult.data.articles)
  }
  // const options1 = pageOptions(url, total_pages);
  // const jsonResult = await rp(options1);
  // const lastPageArticles = jsonResult.data.articles;
  return {
    account: body.data.user.account,
    nickname: body.data.user.nickname,
    avatar: body.data.user.avatar,
    articles: Array.prototype.concat(...articles)
    // articles: lastPageArticles[lastPageArticles.length - 1]
  }
}

