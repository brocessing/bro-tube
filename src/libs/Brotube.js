import YoutubePlayer from 'libs/YoutubePlayer';
import { get } from 'libs/Request';

const API_DELAY = 2000;
const VIDEO_DELAY = 5000;
const API_KEY = 'AIzaSyBq-VK1pc7p8GiHSPiTrbfNp8_jWVz5sjc';
const API_URL = 'https://www.googleapis.com/youtube/v3/search?part=snippet'
              + '&maxResults=25&type=video&key=' + API_KEY + '&relatedToVideoId=';
const MIDDLE_TIME = 30;

class Brotube {
  constructor(domEl) {
    //setup DOM
    let container = document.createElement('div');
    let iframe = document.createElement('div');
    container.classList.add('player-container');
    container.appendChild(iframe);
    domEl.appendChild(container);
    this.players = [
      {
        seeked: false,
        iframe: new YoutubePlayer(iframe, { controls: 0 })
      }
    ];

    this._cp = 0; //current player
    this._apiTimer = -1; //impossible id instead of null to minimize mutations
    this._videoTimer = -1;

    this.onStateChange = this.onStateChange.bind(this);
    this.onReady = this.onReady.bind(this);
    this.fetchNewVideo = this.fetchNewVideo.bind(this);
    this.nextVideo = this.nextVideo.bind(this);

    this.addListeners();
  }
  addListeners() {
    for (let i = 0, len = this.players.length; i<len; i++) {
      this.players[i].iframe.on('statechange', (state) => this.onStateChange(this.players[i], state));
      this.players[i].iframe.on('ready', () => this.onReady(this.players[i]));
    }
  }
  currentPlayer() {
    return this.players[this._cp];
  }
  nextPlayer() {


  }
  start(id) {
    clearTimeout(this._apiTimer);
    clearTimeout(this._videoTimer);
    this.queue = [];
    this.queue.push(id);
    this.current = 0;
    this.currentPlayer().iframe.load(id);
    this._apiTimer = setTimeout(this.fetchNewVideo, 500);
  }
  onStateChange(player, state) {
    switch(state){
      case 'cued':
        player.iframe.play();
        player.seeked = false;
        this._videoTimer = setTimeout(this.nextVideo, VIDEO_DELAY);
        break;
      case 'playing':
        if(player.seeked) return;
        player.seeked = true;
        let duration = this.currentPlayer().iframe.getDuration();
        if(duration >= MIDDLE_TIME) this.currentPlayer().iframe.seek(duration/2);
        player.iframe.setVolume(100);
        // clearTimeout(this._videoTimer);
        // this._videoTimer = setTimeout(this.nextVideo, VIDEO_DELAY);
    }
  }
  onReady(player) {
    player.iframe.play();
    player.seeked = false;
    this._videoTimer = setTimeout(this.nextVideo, VIDEO_DELAY); //TODO: here or in player state ?
  }
  nextVideo() {
    //No new videos for the moment. We retry later.
    if (this.current === (this.queue.length - 1)) {
      this._videoTimer = setTimeout(this.nextVideo, 1000);
      return;
    }
    this.current++;
    this.currentPlayer().iframe.load(this.queue[this.current]);
  }
  fetchNewVideo() {
    get(API_URL+this.queue[this.queue.length - 1]).exec((err, data) => {
      if (err) { throw new Error('Error trying to fetch new videos'); return; }
      let ids = [];
      data.items.map((el) => {
        if (el.id.kind === 'youtube#video' && !this.queue.includes(el.id.videoId)) {
          ids.push(el.id.videoId);
        }
      });
      if (ids.length <= 0) { throw new Error('No new related video found :('); return; }
      this.queue.push(ids[Math.floor(Math.random() * ids.length)]); //random id
      this._apiTimer = setTimeout(this.fetchNewVideo, API_DELAY);
    });
  }
}

export default Brotube;
