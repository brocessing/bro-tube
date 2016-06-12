import Brotube from 'libs/Brotube';
import loadYoutubeAPI from 'libs/loadYoutubeAPI';
import matchYoutubeID from 'libs/matchYoutubeID';

const dom = {
  players: document.getElementById('view-players'),
  input: document.getElementById('view-input'),
  input_form: document.querySelector('#view-input form'),
  input_input: document.querySelector('#view-input input'),
  loader: document.getElementById('view-loader'),
  player_containers: document.querySelectorAll('.player')
}

const brotubes = [];
dom.player_containers.forEach((el) => brotubes.push(new Brotube(el)));

function setupBrotubes(id) {
  brotubes.forEach((brotube) => brotube.start(id));
  dom.players.classList.remove('players--hidden');
}

dom.input_form.addEventListener('submit', (e) => {
  e.preventDefault();
  let id = matchYoutubeID(dom.input_input.value);
  if (id) {
    dom.input_input.blur();
    setupBrotubes(id);
  }
});

loadYoutubeAPI().then(() => {
  dom.loader.classList.add('loader--hidden');
  dom.input.classList.remove('input--hidden');
})
