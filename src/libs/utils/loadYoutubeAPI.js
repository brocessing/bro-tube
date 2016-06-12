function loadYoutubeAPI() {
  return new Promise((resolve, reject) => {
    window.onYouTubeIframeAPIReady = () => { resolve(); };
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(script, firstScriptTag);
  });
}

export default loadYoutubeAPI;
