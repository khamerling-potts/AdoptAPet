# AdoptAPet - Flatiron School Phase 1 Project

## Description

AdoptAPet is a front end application that accesses data from the [Petfinder API](https://www.petfinder.com/developers/v2/docs/) and manipulates data in an [AdoptAPet JSON server](https://adoptapet.onrender.com/savedanimals) deployed by [render](https://render.com/).

### Features

Users are able to search for adoptable pets within 10 miles of their zip code. 6 animals display on the screen and users can navigate between result pages to see additional/previous animals. Each listing includes the animal's name, distance, photo (if available), age, gender, breed, Petfinder URL, and description (if provided).

Another key feature of AdoptAPet is the ability to save animals by clicking on the heart in their listing. When users save an animal, the heart fills in (visually indicating they were saved) and the animal is added to the AdoptAPet JSON server database.
Here is an example animal in the JSON server:

```
{
    "id": 60377948,
    "name": "Tommy",
    "distance": "6.7271 miles from 99567",
    "imageURL": "https://dl5zpyw5k3jeb.cloudfront.net/photos/pets/60377948/1/?bust=1677879146&width=600",
    "age": "Baby",
    "gender": "Male",
    "breeds": {
      "primary": "Short-Haired"
    },
    "species": "Guinea Pig",
    "url": "https://www.petfinder.com/small-furry/tommy-60377948/ak/eagle-river/junipers-guinea-pig-rescue-ak81/?referrer_id=e26ce9e6-9efe-4ab7-8f9e-6572fadc0a13&utm_source=api&utm_medium=partnership&utm_content=e26ce9e6-9efe-4ab7-8f9e-6572fadc0a13",
    "description": "A sweet young boy that was thought to be a girl piggy. He is super soft and is used to..."
  }
```

The button under the search bar allows users to toggle between their saved animals and search results. In addition to saving an animal, you can unsave an animal by clicking on the heart again. This removes the animal from the AdoptAPet JSON server and updates the DOM accordingly.

## Requirements

**This project uses a free API key and Secret associated with my Petfinder account.** These are stored in a config.js file that is ignored by git. In order to fetch a temporary access token and access Petfinder data, you need the config.js file storing the protected keys.

This project can be run using VSCode's [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension. Please note that when launching Live Server, the initial dialog prompting for a zip code may not appear if AdoptAPet opens in a non-active window (like a second monitor). Refresh the page if this happens.

## Future additions

I hope to add additional functionality to this project by eventually implementing more search filters, including filtering by breed and by distance.

I would also like to eventually add a page/offset endpoint in my JSON Server. This would allow me to implement page navigation buttons and only display 6 saved animals at a time.
