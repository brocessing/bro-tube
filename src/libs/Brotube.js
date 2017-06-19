import YoutubePlayer from 'utils/YoutubePlayer';
import { get } from 'utils/Request';

const API_DELAY = 2000;
const VIDEO_DELAY = 5000;
const API_KEY = 'AIzaSyBq-VK1pc7p8GiHSPiTrbfNp8_jWVz5sjc';
const API_URL = 'https://www.googleapis.com/youtube/v3/search?part=snippet'
              + '&maxResults=5&type=video&videoEmbeddable=true&videoSyndicated=true&key=' + API_KEY + '&relatedToVideoId=';
const MIDDLE_TIME = 30;

const titles = document.getElementById('titles');

class Brotube {
  constructor(domEl) {
    // setup DOM
    // creates ul for displaying titles
    this.historyList = document.createElement('ul');
    this.historyList.classList.add('title');
    titles.appendChild(this.historyList);
    
    let iframe = document.createElement('div');
    let iframe2 = document.createElement('div');
    this.containerNode = document.createElement('div');
    this.containerNode.classList.add('player-container');
    this.containerNode.appendChild(iframe2);
    this.containerNode.appendChild(iframe);
    this.parentNode = domEl;
    this.parentNode.appendChild(this.containerNode);
    this.players = [
      {
        id: 0,
        current: 0,
        seeked: false,
        iframe: new YoutubePlayer(iframe, { controls: 0 })
      },
      {
        id: 1,
        current: 0,
        seeked: false,
        iframe: new YoutubePlayer(iframe2, { controls: 0 })
      }
    ];
    // set current player id
    this._cp = 0;
    this.started = false;
    // declare timers
    // impossible id instead of null to minimize mutations
    this._apiTimer = -1;
    this._videoTimer = -1;
    // bind this to listeners
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
  getCurrentPlayer() {
    return this.players[this._cp];
  }
  getNextPlayer() {
    let p = (this._cp === 1) ? 0 : 1;
    return this.players[p];
  }
  isCurrentPlayer(player) {
    return (player.id === this._cp);
  }
  prepareNext() {
    //skip if we don't have the next video or if it's already prepared
    if (this.getCurrentPlayer().current >= (this.queue.length - 1)
    || this.getNextPlayer().current === (this.getCurrentPlayer().current + 1)) {
      return;
    }

    this.getNextPlayer().current = this.getCurrentPlayer().current + 1;
    this.getNextPlayer().iframe.load(this.queue[this.getNextPlayer().current]);
  }
  switchPlayer() {
    this._cp = (this._cp === 1) ? 0 : 1;
  }
  start(id) {
    //destroy before restart, please
    if(this.started) return;
    //reset players
    this._cp = 0
    this.players[0].current = 0;
    this.players[1].current = 0;
    // reset queue
    this.queue = [];
    this.queue.push(id);
    this.current = 0;
    // load the video and start fetching related videos
    this.getCurrentPlayer().iframe.load(id);
    this.getNextPlayer().iframe.load(id);
  }
  destroy() {
    clearTimeout(this._apiTimer);
    clearTimeout(this._videoTimer);
    this.players[0].iframe.destroy();
    this.players[1].iframe.destroy();
    this.parentNode.removeChild(this.containerNode);
    titles.removeChild(this.historyList);
    this.historyList = null;
  }
  onStateChange(player, state) {
    switch(state){
      case 'cued':
        player.iframe.play();
        player.seeked = false;
        break;
      case 'playing':
        if(player.seeked) {
          if (!this.isCurrentPlayer(player)) player.iframe.pause();
          else if (!this.started) {
            this.started = true;
            this._apiTimer = setTimeout(this.fetchNewVideo, API_DELAY);
            this._videoTimer = setTimeout(this.nextVideo, VIDEO_DELAY);
          }
          return;
        } // stop here if the current video is already seeked
        player.seeked = true;
        let duration = player.iframe.getDuration();
        player.iframe.seek(duration/2);
        break;
    }
  }
  onReady(player) {
    player.iframe.play();
    !this.already && this.log(player.iframe.player.getVideoData());
    this.already = true;
    player.seeked = false;
  }
  nextVideo() {
    // No new videos for the moment. We retry later.
    if (this.current === (this.queue.length - 1)) {
      this._videoTimer = setTimeout(this.nextVideo, 1000);
      return;
    }
    // Go to the next video.
    this.current++;
    this.switchPlayer();
    this.getCurrentPlayer().iframe.play();
    this.log(this.getCurrentPlayer().iframe.player.getVideoData());
    this.displayPlayer();
    this.prepareNext();
    this._videoTimer = setTimeout(this.nextVideo, VIDEO_DELAY);
  }
  log(videoData) {
    if (!this.historyList) return;
    const newItem = document.createElement('li');
    newItem.textContent = videoData.title; 
    this.historyList.appendChild(newItem);
  }
  displayPlayer() {
    this.getCurrentPlayer().iframe.el.style.display = 'block';
    this.getNextPlayer().iframe.el.style.display = 'none';
  }
  fetchNewVideo() {
    // ajax call
    get(API_URL+this.queue[this.queue.length - 1]).exec((err, data) => {
      if (err) { throw new Error('Error trying to fetch new videos'); return; }
      let ids = [];
      // store videos titles too
      // get all ids which are not already in the queue/history
      data.items.map((el) => {
        if (el.id.kind === 'youtube#video' && !this.queue.includes(el.id.videoId)) {
          ids.push(el.id.videoId);
        }
      });
      if (ids.length <= 0) { throw new Error('No new related video found :('); return; }
      // Randomly choose one videoId
      const randIndex = Math.floor(Math.random() * ids.length);
      this.queue.push(ids[randIndex]); // random id
      this.prepareNext();
      this._apiTimer = setTimeout(this.fetchNewVideo, API_DELAY);
      // Put titles below players

    });
  }
  makeNewPlayer(el) {
    let container = document.createElement('div');
    let iframe = document.createElement('div');
    container.classList.add('player-container');
    container.appendChild(iframe);
    el.appendChild(container);
    return iframe;
  }
}

export default Brotube;
