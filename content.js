let isListenerAdded = false;
let updatedEpisode = 0;

function checkElements() {
  const titleElement = document.getElementsByClassName("anime-title")[0];
  const episodeElement = document.getElementsByClassName(
    "video-player-bar-series-item d-inline-block br-4 mb-0 video-player__active"
  )[0];
  const addEpisodeButton = document.getElementsByClassName(
    "video-player-bar-series-watch text-player-gray px-3 py-2 text-nowrap cursor-pointer"
  )[0];

  if (titleElement && episodeElement && addEpisodeButton) {
    const title = titleElement.getElementsByTagName("h1")[0]?.textContent;
    const episodeNumber = episodeElement.textContent;

    if (title && episodeNumber) {
      //if (!isListenerAdded) {
      addEpisodeButton.addEventListener("click", () => {
        if (episodeNumber <= updatedEpisode) {
          return;
        }
        console.log("Clicked add episode");
        chrome.runtime.sendMessage(
          {
            action: "addEpisode",
            title: title,
            episodeNumber: episodeNumber,
          },
          async response => {
            console.log(response);
          }
        );
        updatedEpisode = episodeNumber;
      });
      isListenerAdded = true;
      //}
    } else {
      console.log("Title or episode number is missing");
    }
  } else {
    console.log("One or more elements are missing");
    setTimeout(checkElements, 1000);
  }
}

checkElements();

const observer = new MutationObserver(async mutations => {
  mutations.forEach(() => checkElements());
  await new Promise(r => setTimeout(r, 500));
});

observer.observe(document.body, { childList: true, subtree: true });
