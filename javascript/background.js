chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (
    !sender.origin === "https://animego.org" ||
    !message.action === "addEpisode"
  ) {
    return;
  }

  let animeId = -1;

  try {
    animeId = await fetchAnimeID(message.title);
  } catch (error) {
    renewAccessToken();
    animeId = await fetchAnimeID(message.title);
  }
  console.log("animeId: " + animeId);

  const userId = await getUserId();

  responseUponAdding = await addEpisode(
    message.title,
    animeId,
    message.episodeNumber,
    userId
  );
  sendResponse({ responseUponAdding });

  return true;
});

const fetchAnimeID = async function (title) {
  const accessToken = await getAccessToken();
  const appName = await getAppName();

  let results = await fetch("https://shikimori.one/api/graphql", {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
      "User-Agent": appName,
      Authorization: `Bearer ${accessToken}`,
    },

    body: JSON.stringify({
      query: `{
            animes(search: "${title}", limit: 1, kind: "!special") {
                id
            }
        }`,
    }),
  }).then(response => {
    if (response.status === 401) {
      return response.json().then(errorData => {
        throw new Error(`${errorData.error_description}`);
      });
    }

    return response.json();
  });
  let data = await results;

  return data.data.animes[0].id;
};

const addEpisode = async function (title, animeId, episodeNumber, userId) {
  const url = "https://shikimori.one/api/v2/user_rates";
  const accessToken = await getAccessToken();
  const appName = await getAppName();
  let queryData = {
    user_rate: {
      episodes: episodeNumber,
      status: "watching",
      target_id: animeId,
      target_type: "Anime",
      user_id: userId,
    },
  };

  let results = await fetch(url, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
      "User-Agent": appName,
      Authorization: `Bearer ${accessToken}`,
    },

    body: JSON.stringify(queryData),
  }).then(response => {
    if (response.status === 401) {
      return response.json().then(errorData => {
        console.error(`${errorData.error_description}`);
        renewAccessToken();
      });
    }

    return response.json();
  });
  let data = await results;

  return data;
};

const getUserId = async function () {
  const userId = await chrome.storage.sync.get(["userId"]);
  if (!userId) {
    console.log("failed to obtain userId");
    return -1;
  }
  return userId.userId;
};

const getAuthCode = async function () {
  const authCode = await chrome.storage.sync.get(["authCode"]);
  if (!authCode) {
    console.log("Failed to obtain auth code");
    return -1;
  }
  return authCode.authCode;
};

const getAccessToken = async function () {
  const accessToken = await chrome.storage.sync.get(["accessToken"]);
  if (!accessToken) {
    console.log("Failed to obtain access token");
    return -1;
  }
  return accessToken.accessToken;
};

const getUsername = async function () {
  const username = await chrome.storage.sync.get(["username"]);
  if (!username) {
    console.log("Failed to obtain username");
    return -1;
  }
  return username.username;
};

const getRefreshToken = async function () {
  const refreshToken = await chrome.storage.sync.get(["refreshToken"]);
  if (!refreshToken) {
    console.log("Failed to obtain refresh token");
    return -1;
  }
  return refreshToken.refreshToken;
};

const getClientId = async function () {
  const clientId = await chrome.storage.sync.get(["clientId"]);
  if (!clientId) {
    console.log("Failed to obtain clientId");
    return -1;
  }
  return clientId.clientId;
};

const getClientSecret = async function () {
  const clientSecret = await chrome.storage.sync.get(["clientSecret"]);
  if (!clientSecret) {
    console.log("Failed to obtain clientSecret");
    return -1;
  }
  return clientSecret.clientSecret;
};

const getAppName = async function () {
  const appName = await chrome.storage.sync.get(["appName"]);
  if (!appName) {
    console.log("Failed to obtain appName");
    return -1;
  }
  return appName.appName;
};

const renewAccessToken = function () {
  const formData = new FormData();
  const clientId = getClientId();
  const clientSecret = getClientSecret();
  let refreshToken = getRefreshToken();
  const appName = getAppName();
  formData.append("grant_type", "refresh_token");
  formData.append("client_id", clientId);
  formData.append("client_secret", clientSecret);
  formData.append("refresh_token", refreshToken);

  fetch("https://shikimori.one/oauth/token", {
    method: "POST",
    headers: {
      "User-Agent": appName,
    },
    body: formData,
  })
    .then(response => response.json())
    .then(data => {
      const accessToken = data.accessToken;
      refreshToken = data.refreshToken;
      chrome.storage.sync.set({ accessToken, refreshToken });
    })
    .catch(error => {
      console.error("Error:", error);
    });
};
