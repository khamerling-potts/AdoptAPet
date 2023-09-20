import { API_KEY } from "/config.js";
import { SECRET } from "/config.js";

function fetchAccessToken() {
  return fetch("https://api.petfinder.com/v2/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `grant_type=client_credentials&client_id=${API_KEY}&client_secret=${SECRET}`,
  })
    .then((res) => res.json())
    .then((data) => fetchAnimals(data.access_token));
}

function fetchAnimals(token) {
  fetch(
    "https://api.petfinder.com/v2/animals/?location=20008&limit=1&distance=10",
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    }
  )
    .then((res) => res.json())
    .then((data) => console.log(data.animals));
}

fetchAccessToken();
