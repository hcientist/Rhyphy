// console.log("\n\n\n\n\n HAI!")

// whenever either (any?) of the forms are submitted, do the work...

const searchForms = [
  document.querySelector("#nav-query-form"),
  document.querySelector("#mondo-landing-form"),
];
// console.table(searchForms)

async function onSearch(ev) {
  // please do not attempt to send the info for me (prevent the default behavior on form submit)
  ev.preventDefault()
  console.log(ev)
  const formData = new FormData(ev.target);
  console.log('formData', formData)
  // window.tmp = formData
  // search rhyme api
  const rhymeResults = await (await searchForRhymes(formData.get('query'))).json() // FIXME

  console.log('rhymeResults', rhymeResults)

  // with results, do giphy stuff

}

function searchGiphy(word) {
}

function searchForRhymes(query) {
  return fetch(`https://rhymebrain.com/talk?function=getRhymes&maxResults=10&word=${query}`)
}

// need to notice the form was submitted
function addListeners (elem) {
  // given a form element as "elem", add an event listener
  elem.addEventListener('submit', onSearch)
}

searchForms.forEach(addListeners)