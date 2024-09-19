const fetchUserID = async function (accessToken, appName, username) {
  let results = await fetch("https://shikimori.one/api/graphql", {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
      "User-Agent": appName,
      Authorization: `Bearer ${accessToken}`,
    },

    body: JSON.stringify({
      query: `{
        users(search: "${username}") {
          nickname
          id
          url
  }
}`,
    }),
  }).then(response => {
    if (response.status === 401) {
      return response.json().then(errorData => {
        console.error(`${errorData.error_description}`);
      });
    }

    return response.json();
  });
  let data = await results;

  return data.data.users[0].id;
};

const saveSettings = async function () {
  const authCode = document.getElementById("authCode").value;
  const clientId = document.getElementById("clientId").value;
  const clientSecret = document.getElementById("clientSecret").value;
  const appName = document.getElementById("appName").value;
  const username = document.getElementById("username").value;

  let tokensData = await getTokens(authCode, clientId, clientSecret, appName);

  const accessToken = tokensData.access_token;
  const refreshToken = tokensData.refresh_token;

  const userId = await fetchUserID(accessToken, appName, username);
  console.log("userId: " + userId);

  chrome.storage.sync.set(
    {
      authCode: authCode,
      accessToken: accessToken,
      refreshToken: refreshToken,
      clientId: clientId,
      clientSecret: clientSecret,
      appName: appName,
      username: username,
      userId: userId,
    },
    function () {
      const status = document.getElementById("status");
      status.textContent = "Settings saved!";
      setTimeout(() => {
        status.textContent = "";
      }, 2000);
    }
  );
};

const getTokens = async function (authCode, clientId, clientSecret) {
  const formData = new FormData();
  formData.append("grant_type", "authorization_code");
  formData.append("client_id", clientId);
  formData.append("client_secret", clientSecret);
  formData.append("code", authCode);
  formData.append("redirect_uri", "urn:ietf:wg:oauth:2.0:oob");

  try {
    const response = await fetch("https://shikimori.one/oauth/token", {
      method: "POST",
      headers: {
        "User-Agent": appName,
      },
      body: formData,
    });

    const data = await response.json();
    console.log("Success:", data);

    return data;
  } catch (error) {
    console.error("Error: ", error);
  }
};

function loadSettings() {
  chrome.storage.sync.get(["authCode"], function (result) {
    if (result.authCode) {
      document.getElementById("authCode").value = result.authCode;
    }
  });

  chrome.storage.sync.get(["clientId"], function (result) {
    if (result.clientId) {
      document.getElementById("clientId").value = result.clientId;
    }
  });

  chrome.storage.sync.get(["clientSecret"], function (result) {
    if (result.clientSecret) {
      document.getElementById("clientSecret").value = result.clientSecret;
    }
  });

  chrome.storage.sync.get(["appName"], function (result) {
    if (result.appName) {
      document.getElementById("appName").value = result.appName;
    }
  });

  chrome.storage.sync.get(["username"], function (result) {
    if (result.username) {
      document.getElementById("username").value = result.username;
    }
  });

  chrome.storage.sync.get(["userId"], function (result) {
    if (result.userId) {
      document.getElementById("p_userId").innerText = result.userId;
    }
  });
}

document
  .getElementById("settings-form")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    saveSettings();
  });

document.addEventListener("DOMContentLoaded", loadSettings);
