import { API_KEY } from "/config.js";
import { SECRET } from "/config.js";
let offset = 1;
const searchbar = document.getElementById("zip");
const pageCount = document.getElementById("page");

//When user submits zip code, animals are fetched using that zip code
document
  .getElementById("search-animals")
  .addEventListener("submit", (event) => {
    event.preventDefault();
    const zip = searchbar.value;
    fetchAccessToken(event, zip);
  });

//event listeners for forward and backwards buttons
document
  .getElementById("back")
  .addEventListener("click", (event) => loadPrevious(event));
document
  .getElementById("forward")
  .addEventListener("click", (event) => loadNext(event));

//gets the temporary access token every time you request animals, then actually fetches animals
function fetchAccessToken(event, zip) {
  return fetch("https://api.petfinder.com/v2/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `grant_type=client_credentials&client_id=${API_KEY}&client_secret=${SECRET}`,
  })
    .then((res) => res.json())
    .then((data) => fetchAnimals(event, data.access_token, zip));
}

function fetchAnimals(event, token, zip) {
  fetch(
    `https://api.petfinder.com/v2/animals/?location=${zip}&limit=6&distance=10&page=${offset}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    }
  )
    .then((res) => res.json())
    .then((data) => {
      console.log(data.animals);

      if (data.animals.length === 0) {
        /*if our search returned no animals, tell user to try different zip*/
        if (event.type === "submit") {
          alert("No animals for this location. Please try another zip code.");
        } else if (event.target.id === "forward") {
          /*if we reached the end of the available animals, return to last seen page of results*/
          alert("No more animals within this distance");
          offset--;
          console.log(`Page: ${offset}`);
          // fetchAccessToken(zip);
        }
      } else {
        //clear current page before rendering new animals
        document.getElementById("pets-container").innerHTML = "";
        data.animals.forEach(renderPet);
        pageCount.innerText = `Page: ${offset}`;
      }
    });
  // .catch((error) => {
  //   console.log(error);
  // });
}

function renderPet(animal) {
  const listing = document.createElement("div");
  listing.className = "pet-listing";

  const name = document.createElement("h2");
  name.innerText = animal.name;

  const pTop = document.createElement("p");
  const distance = document.createElement("span");
  distance.innerText = `${animal.distance} miles`;
  const heart = document.createElement("span");
  heart.innerText = `Save Pet`; //change to heart
  pTop.append(distance, heart);

  const imgdiv = document.createElement("div");
  imgdiv.className = "imgdiv";
  const image = document.createElement("img");
  if (animal.photos.length > 0) {
    image.src = animal.photos[0].large;
  } else {
    image.src =
      "https://st4.depositphotos.com/14953852/22772/v/450/depositphotos_227724992-stock-illustration-image-available-icon-flat-vector.jpg";
  }
  imgdiv.appendChild(image);

  const pBottom = document.createElement("p");
  const age = document.createElement("span");
  age.innerText = animal.age;
  const gender = document.createElement("span");
  gender.innerText = animal.gender;
  const breed = document.createElement("span");
  breed.innerText = animal.breeds.primary + ", " + animal.species;
  pBottom.append(age, gender, breed);

  const url = document.createElement("a");
  url.href = animal.url;
  url.innerText = "Pet's URL";

  const description = document.createElement("details");
  description.className = "description";
  if (animal.description) {
    description.innerText = animal.description;
  } else {
    description.innerText = "No description provided";
  }
  const summary = document.createElement("summary");
  summary.innerText = "Description";
  description.appendChild(summary);
  description.addEventListener("toggle", (event) =>
    emphasizePet(event, listing)
  );

  listing.append(name, pTop, imgdiv, pBottom, url, description);
  document.getElementById("pets-container").appendChild(listing);
}

function emphasizePet(event, listing) {
  if (event.target.hasAttribute("open")) {
    listing.style.boxShadow = "3px 4px #e04b52";
  } else {
    listing.style.boxShadow = "3px 4px grey";
  }
}

function loadPrevious(event) {
  if (offset === 1) {
    alert("No previous animals. Cannot go back further");
  } else {
    offset--;
    fetchAccessToken(event, searchbar.value);
  }
}

function loadNext(event) {
  offset++;
  fetchAccessToken(event, searchbar.value);
}
