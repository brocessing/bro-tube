// Fork of youtube-player by watsondg !

import Emitter from 'tiny-emitter';

class YoutubePlayer extends Emitter {

  constructor(el, opts = {}) {
    super();
    let defaults = {
      controls: 1,
      allowFullscreen: 1,
      autoplay: 0
    }
    this.options = Object.assign(defaults, opts);

    this.el = el;
    this.isPopulated = false;
    this.isPlaying = false;
    this.playbackInterval = -1;

    this.onPlayerReady = this.onPlayerReady.bind(this);
    this.onPlayerStateChange = this.onPlayerStateChange.bind(this);
    this.onPlaybackUpdate = this.onPlaybackUpdate.bind(this);
  }
  populatePlayer(videoId, startTime) {
    this.player = new YT.Player(this.el, {
      width: '100%',
      height: '100%',
      videoId: videoId,
      playerVars: {
        modestbranding: 1,
        rel: 0,
        controls: this.options.controls,
        showinfo: 0,
        allowfullscreen: this.options.allowFullscreen,
        autoplay: this.options.autoplay,
        wmode: 'transparent',
        startSeconds: startTime,
        start: startTime
      },
      events :{
        onStateChange: this.onPlayerStateChange,
        onReady: this.onPlayerReady,
      }
    });
  }
  onPlayerStateChange(state) {
    clearInterval(this.playbackInterval);
    let playerState = '';
    switch(state.data) {
      case YT.PlayerState.UNSTARTED:
        playerState = 'unstarted';
        break;
      case YT.PlayerState.ENDED:
        this.pause();
        this.player.seekTo(this.player.getDuration() - 0.1, false);
        setTimeout(this.pause.bind(this), 200);
        playerState = 'ended';
        break;
      case YT.PlayerState.PLAYING:
        this.playbackInterval = setInterval(this.onPlaybackUpdate, 100);
        this.isPlaying = true;
        playerState = 'playing';
        break;
      case YT.PlayerState.ENDED:
      case YT.PlayerState.PAUSED:
        this.isPlaying = false;
        playerState = 'paused';
        break;
      case YT.PlayerState.BUFFERING:
        playerState = 'buffering';
        break;
      case YT.PlayerState.CUED:
        playerState = 'cued';
        break;
    }
    this.emit('statechange', playerState);
    this.emit(playerState);
  }
  onPlayerReady(event) {
    this.el = this.player.getIframe();
    this.isPopulated = true;
    this.setVolume(100);
    this.emit('ready');
  }
  onPlaybackUpdate() {
    this.emit('timeupdate');
  }
  fullscreen() {
    let el = this.el.parentNode || this.el;
    let requestFullScreen = el.requestFullScreen
        || el.mozRequestFullScreen
        || el.webkitRequestFullScreen
        || el.msRequestFullScreen;
    if (requestFullScreen) requestFullScreen.call(el);
  }
  load(videoId, startTime = 0) {
    if (this.isPopulated && this.player) {
      if (!this.options.autoplay) this.player.cueVideoById(videoId, startTime);
      else this.player.loadVideoById({ videoId: videoId, startSeconds: startTime });
    } else {
      this.populatePlayer(videoId, startTime);
    }
  }
  play() {
    if (!this.player) return;
    this.player.playVideo();
    return this;
  }
  pause() {
    if (!this.player) return;
    try { this.player.pauseVideo(); }
    catch(e) {}
    return this;
  }
  seek(time) {
    if (!this.player) return;
    this.player.seekTo(time);
    return this;
  }
  mute() {
    if (!this.player) return;
    this.player.mute();
    return this;
  }
  unMute() {
    if (!this.player) return;
    this.player.unMute();
    return this;
  }
  setVolume(volume) {
    if (!this.player) return;
    this.player.setVolume(volume);
    return this;
  }
  getDuration() {
    if (!this.player) return 0;
    return this.player.getDuration();
  }
  getCurrentTime() {
    if (!this.player) return 0;
    return this.player.getCurrentTime();
  }
  destroy() {
    this.pause();
    clearInterval(this.playbackInterval);
    this.el = null;
    if (this.player) this.player.destroy();
  }

}

export default YoutubePlayer;
