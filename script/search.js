// console.log("\n\n\n\n\n HAI!")

// whenever either (any?) of the forms are submitted, do the work...

const searchForms = [
  document.querySelector("#nav-query-form"),
  document.querySelector("#mondo-landing-form"),
];
// console.table(searchForms)

async function onSearch(ev) {
  // please do not attempt to send the info for me (prevent the default behavior on form submit)
  ev.preventDefault();
  console.log(ev);
  const formData = new FormData(ev.target);
  console.log("formData", formData);
  // window.tmp = formData
  // search rhyme api
  const query = formData.get("query");
  const rhymeResults = await (await searchForRhymes(query)).json(); // FIXME

  console.log("rhymeResults", rhymeResults);

  // with results, do giphy stuff
  const giphURLs = await Promise.all(
    rhymeResults.map(async (wordObj) => await searchGiphy(wordObj.word))
  );
  console.log("giphURLs", giphURLs);
  const resultSet = persistSearchWithResults(query, rhymeResults, giphURLs);


  // insert the result set into the dom

  const resultsElem = document.getElementById("rhyphy-result-set-list");
  resultsElem.innerHTML = ''
  resultsElem.append(...resultSet.results.map(createCardFromResult))

  // prepare a lin kto export the data
  const exportLink = document.getElementById("export");
  exportLink.href = makeDLURL(resultSet);
  exportLink.download = "rhyphy-export.json";
}

async function searchGiphy(word) {
  const giphyResp = await fetch(
    `https://api.giphy.com/v1/gifs/search?api_key=DqDqE5OTJMZkeTKmfCrx287T2jQL1o6t&q=${word}&limit=1&offset=0&rating=r&lang=en&bundle=messaging_non_clips`
  );

  const giphyResultJSON = await giphyResp.json();
  // console.log('giphy gif url', resultURL)

  const resultURL = giphyResultJSON.data[0].images.original.url;
  return resultURL;
}

function searchForRhymes(query) {
  return fetch(
    `https://rhymebrain.com/talk?function=getRhymes&maxResults=10&word=${query}`
  );
}

function makeDLURL(data) {
  // https://developer.mozilla.org/en-US/docs/Web/API/Blob#creating_a_blob
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const blobURL = URL.createObjectURL(blob);
  return blobURL;
}

function persistSearchWithResults(term, rhymeList, gifList) {
  console.log("term, rhymeList, gifList", term, rhymeList, gifList);

  const resultSet = resultSetObjFromLists(term, rhymeList, gifList);
  console.log("resuilt set for local storage", resultSet);
  localStorage.setItem(term, JSON.stringify(resultSet));
  return resultSet;
}

function resultSetObjFromLists(word, rhymeList, gifList) {
  const result = { word, results: [] };
  rhymeList.forEach((rhymeObj, i) => {
    let gifResult = gifList[i];
    result.results.push(makeResultObj(rhymeObj, gifResult));
  });
  return result;
}

function makeResultObj(rhymeResult, gifResult) {
  return {
    word: rhymeResult.word,
    rhymeData: rhymeResult,
    gifURL: gifResult,
  };
}

// need to notice the form was submitted
function addListeners(elem) {
  // given a form element as "elem", add an event listener
  elem.addEventListener("submit", onSearch);
}

searchForms.forEach(addListeners);

function createCardFromResult(r) {
  console.log(r);
  const {word, rhymeData, gifURL} = r
  let cardElem, imgElem, bodyElem, titleElem, detailsElem;
  cardElem = document.createElement("div");
  cardElem.classList.add("card");
  cardElem.classList.add("rhyphy-result");

  // below is the "right way"
  // could have just set innerHTML on cardElem

  imgElem = document.createElement("img");
  imgElem.classList.add("card-img-top");
  imgElem.src = gifURL;
  imgElem.alt = `1st giphy result for ${word}`;

  bodyElem = document.createElement("div");
  bodyElem.classList.add("card-body");

  titleElem = document.createElement("h5");
  titleElem.classList.add("card-title");
  titleElem.innerText = word;

  detailsElem = document.createElement("output");
  detailsElem.classList.add("card-text");
  detailsElem.innerText = JSON.stringify(rhymeData);

  bodyElem.append(titleElem, detailsElem)

  cardElem.append(imgElem, bodyElem)
  return cardElem
}
