import { API_KEY } from "/config.js";
import { SECRET } from "/config.js";
let offset = 1;
const searchbar = document.getElementById("zip");
const pageCount = document.getElementById("page");
const toggleBtn = document.getElementById("toggle-saved");
const petsContainer = document.getElementById("pets-container");
const footer = document.getElementById("footer");
const intro = document.getElementById("intro");

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

//event listener for toggling saved vs all animals
toggleBtn.addEventListener("click", toggleSaved);

//function that initially prompts for zip code and fetches animals
// function initialPrompt() {
//   const firstZip = prompt(
//     "Please enter your zip code to start viewing adoptable pets:"
//   );
//   searchbar.value = firstZip;
//   fetchAccessToken(null, firstZip);
// }

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
        /*If our search/initial prompt returned no animals, tell user to try different zip.
        event being null means that this was the initial prompt (where there's no event). Treat this like submit*/
        if (!event || event.type === "submit") {
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
        petsContainer.innerHTML = "";
        data.animals.forEach(renderPet);
        pageCount.innerText = `Page: ${offset}`;
      }
    });
  // .catch((error) => {
  //   console.log(error);
  // });
  footer.style.visibility = "visible";
  intro.innerText = "Results";
}

function renderPet(animal) {
  const listing = document.createElement("div");
  listing.className = "pet-listing";

  const imgdiv = document.createElement("div");
  imgdiv.className = "imgdiv";
  const image = document.createElement("img");
  /*checking the different possible image formats, depending on if it's a saved animal, api animal w/ photos, or api animal w/o photos*/
  if (animal.imageURL) {
    image.src = animal.imageURL;
  } else if (animal.photos.length > 0) {
    image.src = animal.photos[0].large;
  } else {
    image.src =
      "https://st4.depositphotos.com/14953852/22772/v/450/depositphotos_227724992-stock-illustration-image-available-icon-flat-vector.jpg";
  }
  imgdiv.appendChild(image);

  const name = document.createElement("h2");
  name.innerText = animal.name;

  const pTop = document.createElement("p");
  const distance = document.createElement("span");
  distance.innerText = `${animal.distance} miles`;
  const heart = document.createElement("span");
  heart.innerText = `Save Pet`; //change to heart
  //event listener for saving an animal
  heart.addEventListener("click", (event) => savePet(event, animal, image));
  pTop.append(distance, heart);

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

function savePet(event, animal, image) {
  console.log("savedpet triggered");
  const savedAnimal = {
    id: animal.id,
    name: animal.name,
    distance: animal.distance,
    imageURL: image.src,
    age: animal.age,
    gender: animal.gender,
    breeds: { primary: animal.breeds.primary },
    species: animal.species,
    url: animal.url,
    description: animal.description,
  };
  const configObj = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(savedAnimal),
  };
  fetch(`http://localhost:3000/savedanimals`, configObj)
    .then((res) => res.json())
    .then((data) => console.log(data));
}

function toggleSaved(event) {
  //clear page before switching animals
  petsContainer.innerHTML = "";
  if (toggleBtn.className === "all") {
    toggleBtn.className = "saved";
    toggleBtn.innerText = "Return to Results";
    intro.innerText = "Saved Animals";
    //hide footer bar when on saved animals (not implementing page functionality for db.json yet)
    footer.style.visibility = "hidden";
    fetch(`http://localhost:3000/savedanimals`)
      .then((res) => res.json())
      .then((animals) => {
        animals.forEach(renderPet);
      });
  } else {
    toggleBtn.className = "all";
    toggleBtn.innerText = "See Saved Animals";
    footer.style.visibility = "visible";
    fetchAccessToken(event, searchbar.value);
  }
}
