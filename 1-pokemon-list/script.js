const filterContainer = document.querySelector("#filter-container");
const filterButtons = document.querySelectorAll(".filter-btn");
const pokemonContainer = document.querySelector("#pokemon-container");
const newPokemonBtn = document
  .querySelector("#new-pokemon-btn")
  .addEventListener("click", function () {
    makeNewPokemon();
  });
const savedPokemonContainer = document.querySelector(
  "#saved-pokemon-container"
);
let allPokemons = [];

//mappe lagring av type-farger
const typeColors = {
  normal: "#A8A77A",
  fire: "#EE8130",
  water: "#6390F0",
  electric: "#F7D02C",
  grass: "#7AC74C",
  ice: "#96D9D6",
  fighting: "#C22E28",
  poison: "#A33EA1",
  ground: "#E2BF65",
  flying: "#A98FF3",
  psychic: "#F95587",
  bug: "#A6B91A",
  rock: "#B6A136",
  ghost: "#735797",
  dragon: "#6F35FC",
  dark: "#705746",
  steel: "#B7B7CE",
  fairy: "#D685AD",
};

// fetch pokemons
async function fetchAndShowPokemons() {
  try {
    for (let i = 1; i < 51; i++) {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${i}`);
      const data = await response.json();
      const pokemon = {
        name: data.name,
        type: data.types[0].type.name,
        imgUrl: data.sprites.front_default,
      };

      allPokemons.push(pokemon);
    }
    updatePokemonList(allPokemons);
    console.log(allPokemons); //FJERN
  } catch (error) {
    console.error("Kunne ikke hente pokemons", error);
  }
}

fetchAndShowPokemons();

// vis pokemons på siden
async function updatePokemonList(pokemonList) {
  pokemonContainer.innerHTML = "";

  for (i = 0; i < pokemonList.length; i++) {
    //lager kort med styling
    const card = document.createElement("div");
    card.innerHTML = `<p style="margin: 0;">${pokemonList[i].type}</p><img src=" ${pokemonList[i].imgUrl}" width="100px" /><h3 style="margin: 20px 0;">${pokemonList[i].name}</h3>  `;
    card.style.backgroundColor = typeColors[pokemonList[i].type.toLowerCase()];
    card.style.padding = "20px";
    card.style.boxShadow = "rgba(0, 0, 0, 0.24) 0px 3px 8px";
    card.style.color = "white";
    card.style.display = "flex";
    card.style.flexDirection = "column";
    card.style.alignItems = "center";

    //buttons på kort
    const saveBtn = document.createElement("button");
    const deleteBtn = document.createElement("button");
    const editBtn = document.createElement("button");

    saveBtn.innerHTML = "Lagre";
    deleteBtn.innerHTML = "Slett";
    editBtn.innerHTML = "Rediger";

    saveBtn.classList.add("btn");
    deleteBtn.classList.add("btn");
    editBtn.classList.add("btn");

    const buttonContainer = document.createElement("div");
    buttonContainer.style.display = "flex";
    buttonContainer.style.flexDirection = "column";
    buttonContainer.style.gap = "5px";

    //append
    buttonContainer.append(saveBtn, deleteBtn, editBtn);
    card.append(buttonContainer);
    pokemonContainer.append(card);
  }
}

//filter
filterButtons.forEach((button) => {
  button.addEventListener("click", function () {
    //Sjekker om den klikkede knappen allerede er aktiv, hvis ikke;filtrer
    if (button.classList.contains("active")) {
      turnOffFilter();
    } else {
      toggleActiveFilterButton(filterButtons, button);
      const type = button.dataset.type;
      const filteredPokemons = allPokemons.filter(
        (pokemon) => pokemon.type == type
      );
      updatePokemonList(filteredPokemons);

      //Feilhåndtering dersom ingen treff
      if (filteredPokemons.length == 0) {
        pokemonContainer.innerHTML = `Beklager, finner ingen Pokemons av typen ${type}.`;
      }
    }
  });
});

//markere aktiv filterknapp, og inaktivere resterende filterknapper
function toggleActiveFilterButton(filterButtons, activeButton) {
  filterButtons.forEach((button) => {
    if (button === activeButton) {
      button.classList.add("active");
    } else {
      button.classList.remove("active");
    }
  });
}

// trenger dette å være en egen funksjon eller skal den tilbake i filter koden?
function turnOffFilter() {
  filterButtons.forEach((button) => {
    button.classList.remove("active");
  });
  updatePokemonList(allPokemons);
}

//Lag din egen Pokemon
function makeNewPokemon() {
  const newPokemonName = document
    .querySelector("#new-pokemon-name")
    .value.toLowerCase();

  const newPokemonType = document
    .querySelector("#new-pokemon-type")
    .value.toLowerCase();

  const newPokemon = {
    name: newPokemonName,
    type: newPokemonType,
    imgUrl: "/1-pokemon-list/assets/pokeball.png",
  };

  if (newPokemonName && newPokemonType) {
    allPokemons.unshift(newPokemon);
    turnOffFilter();
    updatePokemonList(allPokemons);
  } else {
    alert("Du må skrive både navn og type for din nye pokemon.");
  }
}
