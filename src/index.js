import { API_KEY } from "/config.js";
import { SECRET } from "/config.js";

/*Defining text characters for the empty and full hearts (from Simple Liker lab). Set variables for DOM elements we use multiple times*/
const EMPTY_HEART = "♡";
const FULL_HEART = "♥";
let offset = 1;
let lastGoodZip = "";
const searchbar = document.getElementById("zip");
const pageCount = document.getElementById("page");
const toggleBtn = document.getElementById("toggle-saved");
const petsContainer = document.getElementById("pets-container");
const footer = document.getElementById("footer");
const intro = document.getElementById("intro");

/*Asks for zip code*/
initialPrompt();

/*When user submits zip code in search bar, animals are fetched using that zip code*/
document
  .getElementById("search-animals")
  .addEventListener("submit", (event) => {
    event.preventDefault();
    const zip = searchbar.value;
    offset = 1;
    fetchAccessToken(event, zip);
  });

/*Event listeners for forward and backwards buttons*/
document
  .getElementById("back")
  .addEventListener("click", (event) => loadPrevious(event));
document
  .getElementById("forward")
  .addEventListener("click", (event) => loadNext(event));

/*Event listener for toggling saved vs all animals*/
toggleBtn.addEventListener("click", toggleSaved);

//-----------------------FUNCTIONS BELOW-----------------------------------//

/*Function that initially prompts for zip code and fetches animals*/
function initialPrompt() {
  const firstZip = prompt(
    "Please enter your zip code to start viewing adoptable pets:"
  );
  searchbar.value = firstZip;
  fetchAccessToken(null, firstZip);
}

/*Function that gets the temporary access token to use when requesting animals from API*/
function fetchAccessToken(event, zip) {
  return fetch("https://api.petfinder.com/v2/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `grant_type=client_credentials&client_id=${API_KEY}&client_secret=${SECRET}`,
  })
    .then((res) => res.json())
    .then((data) => fetchAPIAnimals(event, data.access_token, zip));
}

/*Function that fetches animals from API using zip code endpoint*/
function fetchAPIAnimals(event, token, zip) {
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
      if (data.animals.length === 0) {
        //If our search/initial prompt returned no animals, tell user to try different zip. Maintain page offset.
        //event being null means that this was the initial prompt. Keep search bar empty in this case.
        if (!event || event.type === "submit") {
          alert("No animals for this location. Please try another zip code.");
          searchbar.value = lastGoodZip;
          if (footer.style.visibility === "visible") {
            offset = parseInt(pageCount.innerText.replace("Page: ", ""), 10);
          }
        }
        //if we reached the end of the available animals, stay on last seen page of results.
        else if (event.target.id === "forward") {
          alert("No more animals within 10 miles.");
          offset--;
        }
      } else {
        //clear current page before rendering new animals
        lastGoodZip = zip;
        petsContainer.innerHTML = "";
        data.animals.forEach((animal) => renderPet(animal, zip));

        pageCount.innerText = `Page: ${offset}`;
        footer.style.visibility = "visible";
        intro.innerText = "AdoptAPet - Find Animals";
        toggleBtn.innerText = "See Saved Animals";
        toggleBtn.className = "all";
      }
    });
}

/*Function that fetches saved animals using JSON server*/
function fetchSavedAnimals() {
  fetch(`https://adoptapet.onrender.com/savedanimals`)
    .then((res) => res.json())
    .then((animals) => {
      animals.forEach((animal) => renderPet(animal, null));
    });
}

/*Function that displays pet on the DOM*/
function renderPet(animal, zip) {
  const listing = document.createElement("div");
  listing.className = "pet-listing";

  /*name*/
  const name = document.createElement("h3");
  name.innerText = animal.name;

  /*top paragraph w/ distance and heart*/
  const pTop = document.createElement("p");
  pTop.className = "ptop";
  const distance = document.createElement("span");
  distance.innerText = zip
    ? `${animal.distance} miles from ${zip}`
    : animal.distance;
  distance.className = "distance";
  const heart = document.createElement("span");
  //check to see if animal is saved before finalizing heart
  isSaved(animal).then((saved) => {
    heart.innerText = saved ? FULL_HEART : EMPTY_HEART;
    /*event listener for saving an animal*/
    heart.addEventListener("click", (event) =>
      saveUnsavePet(event, animal, listing)
    );
  });
  heart.style.cursor = "pointer";
  heart.className = "heart";
  pTop.append(distance, heart);

  /*picture*/
  const imgdiv = document.createElement("div");
  imgdiv.className = "imgdiv";
  const image = document.createElement("img");
  //checking the different possible image formats, depending on if it's a saved animal, api animal w/ photos, or api animal w/o photos
  if (animal.imageURL) {
    image.src = animal.imageURL;
  } else if (animal.photos.length > 0) {
    image.src = animal.photos[0].large;
  } else {
    image.src =
      "https://st4.depositphotos.com/14953852/22772/v/450/depositphotos_227724992-stock-illustration-image-available-icon-flat-vector.jpg";
  }
  imgdiv.appendChild(image);

  /*bottom paragraph w/ age, gender, breed, species*/
  const pBottom = document.createElement("p");
  pBottom.className = "pbottom";
  const ageGender = document.createElement("span");
  ageGender.innerText = `${animal.age} • ${animal.gender}`;
  const breed = document.createElement("span");
  breed.innerText = animal.breeds.primary + " (" + animal.species + ")";
  pBottom.append(ageGender, breed);

  /*url*/
  const url = document.createElement("a");
  url.href = animal.url;
  url.innerText = "Pet's URL";

  /*description*/
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

  /*append all pet info to DOM*/
  listing.append(name, pTop, imgdiv, pBottom, url, description);
  petsContainer.appendChild(listing);
}

/*Function that changes listing display when description is opened*/
function emphasizePet(event, listing) {
  if (event.target.hasAttribute("open")) {
    listing.style.boxShadow = "3px 4px #d485ae";
  } else {
    listing.style.boxShadow = "3px 4px grey";
  }
}

/*Function that loads previous page of API results*/
function loadPrevious(event) {
  if (offset === 1) {
    alert("No previous animals. Cannot go back further.");
  } else {
    offset--;
    fetchAccessToken(event, searchbar.value);
  }
}

/*Function that loads next page of API results*/
function loadNext(event) {
  offset++;
  fetchAccessToken(event, searchbar.value);
}

/*Function that checks to see if pet is saved in our 'savedAnimals' database.*/
function isSaved(pet) {
  let savedIds = [];
  return fetch(`https://adoptapet.onrender.com/savedanimals`)
    .then((res) => res.json())
    .then((animals) => {
      savedIds = animals.map((animal) => animal.id);
      return savedIds.includes(pet.id);
    });
  // Alternate approach below. Fewer lines of code but this produces unsightly errors in the console.
  // return fetch(`https://adoptapet.onrender.com/savedanimals/${animal.id}`).then(
  //   (res) => res.ok
  // );
}

/*Function that saves or unsaves pet when clicking on the heart*/
function saveUnsavePet(event, animal, listing) {
  //if pet is not saved yet, save the pet to the database
  if (event.target.innerText === EMPTY_HEART) {
    event.target.innerText = FULL_HEART;
    const savedAnimal = {
      id: animal.id,
      name: animal.name,
      distance: listing.querySelector("span").innerText,
      imageURL: listing.querySelector("img").src,
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
    fetch(`https://adoptapet.onrender.com/savedanimals`, configObj)
      .then((res) => res.json())
      .then((data) => console.log(data));
  }
  //if pet is saved, remove the pet from the database
  else {
    //if we're on the saved animals page, remove pet from page. Otherwise, just change it to an empty heart.
    if (toggleBtn.className === "saved") {
      listing.remove();
    } else {
      event.target.innerText = EMPTY_HEART;
    }
    const configObj = {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };
    fetch(`https://adoptapet.onrender.com/savedanimals/${animal.id}`, configObj)
      .then((res) => res.json())
      .then((data) => console.log(data));
  }
}

/*Function that toggles between the results page and saved animals page*/
function toggleSaved(event) {
  //clear page before switching animals
  petsContainer.innerHTML = "";
  if (toggleBtn.className === "all") {
    toggleBtn.className = "saved";
    toggleBtn.innerText = "Return to Results";
    intro.innerText = "AdoptAPet - Your Saved Animals";
    //hide footer bar when on saved animals (not implementing page functionality for json server yet)
    footer.style.visibility = "hidden";
    fetchSavedAnimals();
  } else {
    fetchAccessToken(event, searchbar.value);
  }
}
