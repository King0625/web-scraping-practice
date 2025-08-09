const rp = require('request-promise');
const cheerio = require('cheerio');
const pageOptions = (url, page) => {
  return {
    method: "GET",
    url: `${url}?page=${page}`,
    json: true
  };
}

main();

async function main() {
  const teamMembers = await getTeamMembers();
  console.time("Fetching...");
  const promises = [];
  for (teamMember of teamMembers) {
    promises.push(getPostsByMember(teamMember));
  }
  await Promise.all(promises)
    .then(result => {
      console.log(result);
    })
  console.timeEnd("Fetching...");
}

async function getTeamMembers() {
  const options = {
    method: "GET",
    url: "https://ithelp.ithome.com.tw/2020ironman/signup/team/78",
    transform: function (body) {
      return cheerio.load(body);
    }
  }

  const $ = await rp(options);

  const members = [];
  $('.contestants-list__title').each(function (i, el) {
    const url = $(this).attr('href')
    members.push(url);
  })
  return members;
}

async function getPostsByMember(url) {
  const urlPieces = url.split('/');
  urlPieces.splice(3, 0, "m/api");
  const apiUrl = urlPieces.join('/');

  const options = pageOptions(apiUrl, 'undefined')
  const body = await rp(options);
  const total_pages = body.paginator.total_pages
  let lastPageData;
  if (total_pages == 1) {
    lastPageData = body;
  } else {
    const options = pageOptions(apiUrl, total_pages);
    lastPageData = await rp(options);
  }
  const lastPageArticles = lastPageData.data.articles;
  const lastArticle = lastPageArticles[lastPageArticles.length - 1];
  const lastArticleCreatedTimestamps = lastArticle.created_at;
  const finishedToday = new Date().setHours(0, 0, 0, 0) == new Date(lastArticleCreatedTimestamps).setHours(0, 0, 0, 0);
  return {
    link: url,
    account: lastPageData.data.user.account,
    nickname: lastPageData.data.user.nickname,
    avatar: lastPageData.data.user.avatar,
    subject: lastPageData.data.ironman.subject,
    topic_count: lastPageData.data.ironman.topic_count,
    latest_article_subject: lastArticle.subject,
    latest_article_link: `https://ithelp.ithome.com.tw/articles/${lastArticle.article_id}`,
    latest_finished_datetime: new Date(lastArticleCreatedTimestamps).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' }),
    has_finished_today: finishedToday
  }
}

