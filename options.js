const saveSettings = async function () {
  const authCode = document.getElementById("authCode").value;
  const clientId = document.getElementById("clientId").value;
  const clientSecret = document.getElementById("clientSecret").value;
  const appName = document.getElementById("appName").value;
  const username = document.getElementById("username").value;

  tokensData = await getTokens(authCode, clientId, clientSecret, appName);

  console.log(tokensData);

  const accessToken = tokensData.access_token;
  const refreshToken = tokensData.refresh_token;

  chrome.storage.sync.set(
    {
      authCode: authCode,
      accessToken: accessToken,
      refreshToken: refreshToken,
      clientId: clientId,
      clientSecret: clientSecret,
      appName: appName,
      username: username,
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
}

document
  .getElementById("settings-form")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    saveSettings();
  });

document.addEventListener("DOMContentLoaded", loadSettings);
