import Brotube from 'libs/Brotube';
import loadYoutubeAPI from 'utils/loadYoutubeAPI';
import matchYoutubeID from 'utils/matchYoutubeID';
import { get } from 'utils/Request';

const dom = {
  players: document.getElementById('view-players'),
  input: document.getElementById('view-input'),
  input_form: document.querySelector('#view-input form'),
  input_input: document.querySelector('#view-input input'),
  loader: document.getElementById('view-loader'),
  player_containers: document.querySelectorAll('.player')
}

const brotubes = [];
const API_KEY = 'AIzaSyBq-VK1pc7p8GiHSPiTrbfNp8_jWVz5sjc';

function setupBrotubes(id) {

  if(brotubes.length > 0){
     dom.player_containers.forEach((el, i) => {
       brotubes[i].destroy()
       brotubes[i] = new Brotube(el);
     });
  } else {
    dom.player_containers.forEach((el) => brotubes.push(new Brotube(el)));
  }
  brotubes.forEach((brotube) => brotube.start(id));
  dom.players.classList.remove('players--hidden');
}

dom.input_form.addEventListener('submit', (e) => {
  e.preventDefault();
  const search_url = 'https://www.googleapis.com/youtube/v3/search?part=snippet'
                + '&maxResults=5&type=video&q=' + encodeURIComponent(dom.input_input.value) + '&key=' + API_KEY;
  get(search_url).exec((err, data) => {
    if(err) return;
    let randomIndex = Math.floor((Math.random() * data.items.length));
    let queryUrl = data.items[randomIndex].id.videoId;
    dom.input_input.blur();
    setupBrotubes(queryUrl);
  });
});

loadYoutubeAPI().then(() => {
  dom.loader.classList.add('loader--hidden');
  dom.input.classList.remove('input--hidden');
})
