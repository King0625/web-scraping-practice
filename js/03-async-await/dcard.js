const rp = require('request-promise');
const cheerio = require('cheerio');

main(1)
.then(result => {
  console.log(result);
  console.log(result.length);
})


async function main(pages, before = ''){
  const result = await getOnePage(before);
  // return result.posts;
  if(pages == 0){
    return result.posts;
  }else{
    pages -= 1;
    return result.posts.concat(await main(pages, result.before));
  }

}

async function getOnePage(before = ''){
  if(before == ''){
    url = 'https://www.dcard.tw/_api/forums/orthodontics/posts?popular=false&limit=30';
  }else{
    url = 'https://www.dcard.tw/_api/forums/orthodontics/posts?popular=false&limit=30&before=' + before
  }
  const options = {
    method: "GET",
    url: url,
    json: true
  };

  const body = await rp(options);
  return {
    posts: body,
    before: body[body.length - 1].id
  };
}