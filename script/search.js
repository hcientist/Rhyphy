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

  // prepare a link to export the data
  const exportLink = document.getElementById("export");
  exportLink.href = makeDLURL(resultSet);
  exportLink.download = "rhyphy-export.json";
}

async function searchGiphy(word) {
  const giphyResp = await apiFetch(
    `https://api.giphy.com/v1/gifs/search?api_key=DqDqE5OTJMZkeTKmfCrx287T2jQL1o6t&q=${word}&limit=1&offset=0&rating=pg&lang=en&bundle=messaging_non_clips`
  );

  const giphyResultJSON = await giphyResp.json();
  console.log('giphy gif url', giphyResultJSON)

  const resultURL = giphyResultJSON.data[0]?.images?.original?.url ?? "https://picsum.photos/200";
  return resultURL;
}

// both giphy and rhymebrain answer with Access-Control-Allow-Origin: *,
// so the browser can talk to them directly -- no proxy in the middle
async function apiFetch(targetUrl) {
  return await fetch(targetUrl);
}

function searchForRhymes(query) {
  return apiFetch(
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
  if (!elem) return;
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

function populateFromLocalStorage() {
  const histList = document.getElementById('hist-list')
  for (let [key, val] of Object.entries(localStorage)) {
    console.log(key, val)
    try {
      const result = JSON.parse(val)
      console.log('result', result)
      if (result.word) {
        const li = document.createElement('li')
        const anchor = document.createElement('a')
        anchor.classList.add('dropdown-item')
        anchor.textContent = key
        li.appendChild(anchor)
        histList.appendChild(li)
      }
    } catch (e) {
      console.info('this was some other localstorage thing, irrelevant to the app')
    }
  }
}
populateFromLocalStorage();