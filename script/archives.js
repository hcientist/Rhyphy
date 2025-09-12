function showFromStorage() {
  const container = document.getElementById('previous-results')
  if (!container) return;
  container.innerHTML = "";
  const resultsForDOM = markUpStoredResults();
  if (resultsForDOM) {
    resultsForDOM.forEach((markedUpResult) => {
      container.append(markedUpResult);
    })
  }
}

function markUpStoredResults() {
  const results = []
  for (const [term, info] of Object.entries(localStorage)) {
    const termRhymeList = JSON.parse(info).results
    console.log(term, termRhymeList)
    const termCard = document.createElement('li');
    termCard.classList.add('card')
    const cardHeader = document.createElement('h2')
    cardHeader.classList.add('card-header')
    cardHeader.textContent = term;
    cardBody = document.createElement('div')
    cardBody.classList.add('card-body')
    const rhymesHeader = document.createElement('h3')
    rhymesHeader.classList.add('card-title')
    rhymesHeader.textContent = "Rhymes"
    const rhymesContainer = document.createElement('ol')
    if (termRhymeList) {
      termRhymeList.forEach((rhymeObj) => {
        const rhymeCard = document.createElement('li')
        rhymeCard.classList.add('card','rhymage-card')
        const rhymeGif = document.createElement('img')
        rhymeGif.classList.add('card-img-top')
        rhymeGif.src = rhymeObj.gifURL
        rhymeGif.alt = `first gif of {rhymeObj.word} from giphy`
        const rhymeCardBody = document.createElement('div')
        rhymeCardBody.classList.add('card-body')
        const rhymeHeader = document.createElement('h4')
        rhymeHeader.classList.add('card-title')
        rhymeHeader.textContent = rhymeObj.word
        const rhymeDataP = document.createElement('p');
        rhymeDataP.classList.add('card-text')
        rhymeDataP.textContent = JSON.stringify(rhymeObj.rhymeData)
        rhymeCard.append(rhymeGif)
        rhymeCard.append(rhymeCardBody)
        rhymeCard.append(rhymeHeader)
        rhymeCard.append(rhymeDataP)
        rhymesContainer.append(rhymeCard)
      })
    }
    termCard.append(cardHeader)
    cardBody.append(rhymesHeader)
    termCard.append(cardBody)
    termCard.append(rhymesContainer)
    results.push(termCard)
  }
  return results
}

document.addEventListener('DOMContentLoaded', showFromStorage);