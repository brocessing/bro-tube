function matchYoutubeID(url) {
  let match = url.match(/^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/);
  if (match && match[2].length == 11) return match[2];
  else return false
}

export default matchYoutubeID;
