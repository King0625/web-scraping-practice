const getSentenceFragment = (offset = 0) => {
  const pageSize = 3;
  const sentence = [...'hello world'];
  return {
    data: sentence.slice(offset, offset + pageSize),
    nextPage: offset +
        pageSize < sentence.length ? offset + pageSize : undefined
  }
};

const getSentence = async function(offset = 0) {
  const fragment = await getSentenceFragment(offset)
  if (fragment.nextPage) {
    return fragment.data.concat(await getSentence(fragment.nextPage));
  } else {
    return fragment.data;
  }
}

getSentence()
  .then((sentence) => console.log(sentence));