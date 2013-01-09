// -*- mode: js; js-indent-level: 4; indent-tabs-mode: nil -*-
// ==UserScript==
// @include       http://tunein.com/*
// @require       utils.js
// ==/UserScript==

/* Testing URL:
 * http://www.youtube.com/watch?v=v1TsCud9QhU&feature=autoplay&list=PLDA83A73D581CEFCC&lf=plpp_play_all&playnext=120
 */

 var Unity = external.getUnityObject(1);
 window.Unity = Unity;

 function isCorrectPage() {
/*    var i, ids = ['page', 'footer-container'];

    for (i = 0; i < ids.length; i++) {
        if (!document.getElementById(ids[i])) {
            return false;
        }
    }
    */
    return true;
  }

  function changeState(dryRun) {
    var playButton = document.evaluate('//section[@class=\"tuner\"]/@class',
     document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    var pauseButton = document.evaluate('//section[@id=\"tuner\"]/@class',
      document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

//    var paused = playButton.data-eventstream.play !== 'none';
    var paused = document.evaluate('//section[@class=\"playing\"]/@class',
     document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.textContent !== 'playing';

    if (!dryRun) {
      if (paused) {
        launchClickEvent(playButton);
      } else {
        launchClickEvent(pauseButton);
      }
    }

    if (!paused) {
      Unity.MediaPlayer.setPlaybackState(Unity.MediaPlayer.PlaybackState.PLAYING);
    } else {
      Unity.MediaPlayer.setPlaybackState(Unity.MediaPlayer.PlaybackState.PAUSED);
    }
  }

  function getTrackInfo() {
    var title = null;
    var artLocation = null;
    var album = null;
    var artist = null;
    try {
        artLocation = document.evaluate('//img[@class=\"logo\"]/@src',
          document, null, XPathResult.ANY_UNORDERED_NODE_TYPE, null).singleNodeValue.textContent;
      
      title = document.evaluate('//div[@class=\"line1\"]/h1/span',
          document, null, XPathResult.ANY_UNORDERED_NODE_TYPE, null).singleNodeValue.textContent;
      album = null;
      artist = document.evaluate('//div[@class=\"info\"]/span/span',
        document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.textContent;
    } catch (x) {}

if (!artist) {
  return null;
}

return {
  title: title,
  album: album,
  artist: artist,
  artLocation: artLocation
};
}

function musicPlayerSetup() {

  Unity.MediaPlayer.init('tunein.com');
  Unity.MediaPlayer.setCanGoPrevious(false);

  setInterval(wrapCallback(function retry() {
    var trackInfo = getTrackInfo(), i;

    if (trackInfo) {
      Unity.MediaPlayer.setTrack(trackInfo);
    }
    changeState(true);

    }), 1000);

  Unity.MediaPlayer.onPlayPause(wrapCallback(function () {
    changeState(false);
  }));

  Unity.MediaPlayer.onNext(wrapCallback(function () {
    var node = document.evaluate('//a[@class="jump"]',
     document,
     null,
     XPathResult.FIRST_ORDERED_NODE_TYPE,
     null)
    .singleNodeValue;
    launchClickEvent(node);
  }));

}

if (isCorrectPage()) {
  Unity.init({ name: "TuneIn",
   domain: 'tunein.com',
   homepage: 'http://www.tunein.com',
   iconUrl: "icon://tunein",
   onInit: musicPlayerSetup });
}