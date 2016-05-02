#!/bin/sh
maxSize="1080"
download_location="/Path/To/Your/Folder"

extremeMode=$3
deeperLevel=$2
videosHistory=()
currentLevel=1
prefix="$(date +%s)"

function getABroFrom {
  echo "\033[0m\033[36m[Get Thumbnail][""$currentLevel""/""$deeperLevel""] \033[32m>>> Search new related video from \033[32m$1\033[0m"
  local videos=""
  if [ "$extremeMode" -gt 0 ]; then
    videos=$(curl -s "$1"  | sed -n -e '/watch-related/,$p' | grep "thumb-wrapper" -A 3 | grep -oE "watch\?[^\"]+" | sed '1!G;h;$!d')
  else
    videos=$(curl -s "$1"  | sed -n -e '/watch-related/,$p' | grep "thumb-wrapper" -A 3 | grep -oE "watch\?[^\"]+")
  fi

  IFS='
  '
  set -f
  for video in $videos; do
    local url="https://www.youtube.com/$video"
    isFreshStuff "$url"
    if [ $? == 1 ]; then
      currentLevel=$(($currentLevel+1))
      gimmeDatThumbnail "$url"
      if [ "$currentLevel" -le "$(($deeperLevel-1))" ]; then
        getABroFrom "$url"
      else
        exit
      fi
    fi
  done
  set +f
}

function gimmeDatThumbnail {
  echo "\033[0m\033[36m[Get Thumbnail][""$currentLevel""/""$deeperLevel""] \033[35m<<< I save this one: $1\033[37m"
  videosHistory+=("$1")
  youtube-dl "$1" --skip-download --youtube-skip-dash-manifest --write-thumbnail -o "$download_location/""$prefix""_""$currentLevel"".%(ext)s"
  sips -Z "$maxSize" "$download_location/""$prefix""_""$currentLevel"".jpg"
}

function isFreshStuff {
  local e
  for e in "${videosHistory[@]}"; do [[ "$e" == "$1" ]] && return 0; done
  return 1
}

mkdir "$download_location/GetThumbnail_$prefix"
download_location="$download_location/GetThumbnail_$prefix"
gimmeDatThumbnail "$1"
getABroFrom "$1"
