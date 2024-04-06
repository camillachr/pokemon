// GLOBALE VARIABLER
const filterContainer = document.querySelector("#filter-container");
let filterButtons = []; //knappene opprettes dynamisk og lagres i denne
const pokemonContainer = document.querySelector("#pokemon-container");
const savedPokemonContainer = document.querySelector(
  "#saved-pokemon-container"
);
const newPokemonBtn = document
  .querySelector("#new-pokemon-btn")
  .addEventListener("click", function () {
    makeNewPokemon();
  });

// sjekk logikken her, funker dette? må de også pushes inn i allPokemons igjen..
let myPokemons = [];
let savedPokemons = JSON.parse(localStorage.getItem("savedPokemons")) || [];
let fetchedPokemons = [];
let allPokemons = [];

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

// FETCH ----------------------------------------------------
async function fetchTypes() {
  try {
    const allTypes = [];
    for (let i = 1; i < 19; i++) {
      const response = await fetch(`https://pokeapi.co/api/v2/type/${i}`);
      const data = await response.json();
      const typeName = data.name;
      allTypes.push(typeName);
    }
    return allTypes;
  } catch (error) {
    console.error("Kunne ikke hente typer", error);
  }
}

// FETCH POKEMONS (50 stk)
async function fetchAndShowAllPokemons() {
  try {
    for (let i = 1; i < 51; i++) {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${i}`);
      const data = await response.json();
      const pokemon = {
        name: data.name,
        type: data.types[0].type.name,
        imgUrl: data.sprites.front_default,
      };

      fetchedPokemons.push(pokemon);
    }
    getMyPokemons();
    showAllPokemons();
  } catch (error) {
    console.error("Kunne ikke hente pokemons", error);
  }
}

function getMyPokemons() {
  myPokemons = JSON.parse(localStorage.getItem("myPokemons")) || [];
  allPokemons = myPokemons.concat(fetchedPokemons); //lært av Anders
}

// OPPDATER OG VIS KORT
function updateAllLocalStorage() {
  updateLocalStorage("myPokemons", myPokemons);
  updateLocalStorage("savedPokemons", savedPokemons);
}

function showAllCards() {
  showAllPokemons();
  showSavedPokemons();
}

// VIS ALLE POKEMONS
async function showAllPokemons() {
  pokemonContainer.innerHTML = "";

  const activeFilterBtn = document.querySelector(".filter-btn.active");
  let cardCounter = 0;

  allPokemons.forEach((pokemon, index) => {
    // Sjekker om filter er aktivt og om pokémonen passer filteret
    if (!activeFilterBtn || pokemon.type === activeFilterBtn.dataset.type) {
      cardCounter++;

      //lager kort med styling
      const card = document.createElement("div");
      card.innerHTML = `<p style="margin: 0;">${pokemon.type}</p><img src=" ${pokemon.imgUrl}" width="100px" /><h3 style="margin: 20px 0;">${pokemon.name}</h3>  `;
      card.style.backgroundColor = typeColors[pokemon.type.toLowerCase()];
      card.style.padding = "20px";
      card.style.boxShadow = "rgba(0, 0, 0, 0.24) 0px 3px 8px";
      card.style.color = "white";
      card.style.display = "flex";
      card.style.flexDirection = "column";
      card.style.alignItems = "center";

      //rediger-knapp
      const editBtn = document.createElement("button");
      editBtn.innerHTML = "Rediger";
      editBtn.classList.add("btn");
      editBtn.addEventListener("click", function () {
        editPokemon(index);
      });

      //lagre-knapp
      const saveBtn = document.createElement("button");
      saveBtn.innerHTML = "Lagre";
      saveBtn.classList.add("btn");
      saveBtn.addEventListener("click", function () {
        savePokemon(index);
      });

      //slette-knapp
      const deleteBtn = document.createElement("button");
      deleteBtn.innerHTML = "Slett";
      deleteBtn.classList.add("btn");
      deleteBtn.addEventListener("click", function () {
        deletePokemon(index);
      });

      const buttonContainer = document.createElement("div");
      buttonContainer.style.display = "flex";
      buttonContainer.style.flexDirection = "column";
      buttonContainer.style.gap = "5px";
      //append
      buttonContainer.append(saveBtn, deleteBtn, editBtn);
      card.append(buttonContainer);
      pokemonContainer.append(card);
    }
  });

  //Feilhåndtering ved null treff
  if (cardCounter === 0) {
    pokemonContainer.innerHTML = `Beklager, finner ingen Pokemons.`;
  }
}

// LAG FILTER ----------------------------------------------------
async function createAndShowFilter() {
  allTypes = await fetchTypes();

  for (let i = 0; i < allTypes.length; i++) {
    const filterBtn = document.createElement("button");
    filterBtn.classList.add("filter-btn", "btn");
    filterBtn.setAttribute("data-type", `${allTypes[i]}`);
    filterBtn.innerHTML = allTypes[i];

    const filterBtnContainer = document.querySelector("#filter-btn-container");
    filterBtnContainer.append(filterBtn);
  }

  filterButtons = document.querySelectorAll(".filter-btn");

  filterButtons.forEach((button) => {
    button.addEventListener("click", function () {
      toggleFilterButton(button);
      showAllPokemons();
    });
  });
}

// TOGGLE FILTER-KNAPP
function toggleFilterButton(clickedBtn) {
  filterButtons.forEach((button) =>
    button === clickedBtn
      ? clickedBtn.classList.toggle("active")
      : button.classList.remove("active")
  );
}

// LAG DIN EGEN POKEMON ----------------------------------------------------
function makeNewPokemon() {
  const newPokemonNameInput = document.querySelector("#new-pokemon-name");
  const newPokemonTypeInput = document.querySelector("#new-pokemon-type");

  const newPokemonName = newPokemonNameInput.value.toLowerCase();
  const newPokemonType = newPokemonTypeInput.value.toLowerCase();

  const newPokemon = {
    name: newPokemonName.toLowerCase(),
    type: newPokemonType.toLowerCase(),
    imgUrl: "/1-pokemon-list/assets/pokeball.png",
  };

  //sjekker at begge felter er utfylt
  if (!newPokemonName || !newPokemonType) {
    alert("Du må skrive både navn og type for din nye pokemon.");
    return;
  }

  //sjekker at typen finnes
  if (!allTypes.includes(newPokemonType)) {
    alert("Denne typen finnes ikke.");
    return;
  }

  //sjekker etter duplikat i allPokemons
  const duplicate = allPokemons.find(
    (pokemon) =>
      pokemon.name === newPokemonName && pokemon.type === newPokemonType
  );
  if (duplicate) {
    alert("Denne pokemonen finnes allerede.");
    return;
  }

  //sjekker etter duplikat i myPokemons
  myPokemons = JSON.parse(localStorage.getItem("myPokemons")) || [];
  const duplicateInMyPokemons = myPokemons.find(
    (pokemon) =>
      pokemon.name === newPokemonName && pokemon.type === newPokemonType
  );
  if (duplicateInMyPokemons) {
    alert("Denne pokemonen har du allerede laget.");
    return;
  }

  //legger til, lagrer og visr
  myPokemons.unshift(newPokemon);
  updateAllLocalStorage();
  getMyPokemons();
  showAllCards();
  toggleFilterButton();

  //tømmer input-felter
  newPokemonNameInput.value = "";
  newPokemonTypeInput.value = "";
}

// LAGRE POKEMONS ----------------------------------------------------
function savePokemon(index) {
  savedPokemons = JSON.parse(localStorage.getItem("savedPokemons")) || [];

  const chosenPokemon = allPokemons[index];

  // maksgrense på 5 lagrede
  if (savedPokemons.length >= 5) {
    alert("Du kan bare lagre 5 pokemons. Fjern en for å lagre ny.");
    return;
  }

  //sjekker etter duplikater
  const duplicate = savedPokemons.find(
    (pokemon) =>
      pokemon.name === chosenPokemon.name && pokemon.type === chosenPokemon.type
  );

  if (duplicate) {
    alert("Denne pokemonen har du allerede lagret.");
    return;
  }

  //lagrer pokemon
  savedPokemons.unshift(chosenPokemon);
  updateAllLocalStorage();
  showAllCards();
}

// VIS LAGREDE POKEMONS
async function showSavedPokemons() {
  savedPokemonContainer.innerHTML = "";
  let cardCounter = 0;

  savedPokemons = JSON.parse(localStorage.getItem("savedPokemons")) || [];

  savedPokemons.forEach((pokemon, index) => {
    cardCounter++;

    //lager kort med styling
    const card = document.createElement("div");
    card.innerHTML = `<p style="margin: 0;">${pokemon.type}</p><img src=" ${pokemon.imgUrl}" width="100px" /><h3 style="margin: 20px 0;">${pokemon.name}</h3>  `;
    card.style.backgroundColor = typeColors[pokemon.type.toLowerCase()];
    card.style.padding = "20px";
    card.style.boxShadow = "rgba(0, 0, 0, 0.24) 0px 3px 8px";
    card.style.color = "white";
    card.style.display = "flex";
    card.style.flexDirection = "column";
    card.style.alignItems = "center";

    //fjern-knapp
    const removeBtn = document.createElement("button");
    removeBtn.innerHTML = "Fjern";
    removeBtn.classList.add("btn");
    removeBtn.addEventListener("click", function () {
      removeFromSaved(index);
    });

    card.append(removeBtn);
    savedPokemonContainer.append(card);
  });

  //Feilhåndtering ved null treff
  if (cardCounter === 0) {
    savedPokemonContainer.innerHTML = `Ingen lagrede pokemons.`;
  }
}

// FJERN POKEMON FRA LAGREDE
function removeFromSaved(index) {
  savedPokemons.splice(index, 1);
  updateAllLocalStorage();
  showAllCards();
}

// SLETT POKEMON ALLE STEDER ----------------------------------------------------

async function deletePokemon(index) {
  const selectedPokemon = allPokemons[index];

  savedPokemons = savedPokemons.filter(
    (pokemon) =>
      pokemon.name !== selectedPokemon.name &&
      pokemon.type !== selectedPokemon.type
  );

  myPokemons = myPokemons.filter(
    (pokemon) =>
      pokemon.name !== selectedPokemon.name &&
      pokemon.type !== selectedPokemon.type
  );
  updateAllLocalStorage();

  //slett fra allPokemons
  allPokemons.splice(index, 1);
  showAllCards();
}

// REDIGER POKEMON ----------------------------------------------------

function editPokemon(index) {
  const newName = prompt("Skriv inn nytt navn:").toLowerCase();
  const newType = prompt("Skriv inn ny type:").toLowerCase();
  console.log(newName, newType);

  //sjekker at feltene er fylt ut
  if (!newName || !newType) {
    alert("Du må fylle ut begge feltene.");
    return;
  }
  //sjekker at typen finnes
  if (!allTypes.includes(newType)) {
    alert("Denne typen finnes ikke.");
    return;
  }
  //sjekker etter duplikat i allPokemons
  const duplicate = allPokemons.find(
    (pokemon) => pokemon.name === newName && pokemon.type === newType
  );

  if (duplicate) {
    alert("Denne pokemonen finnes allerede.");
    return;
  }

  const selectedPokemon = allPokemons[index];

  editDuplicates(savedPokemons, selectedPokemon, newName, newType);
  editDuplicates(myPokemons, selectedPokemon, newName, newType);

  selectedPokemon.name = newName;
  selectedPokemon.type = newType;

  updateAllLocalStorage();
  getMyPokemons();
  showAllCards();
}

function editDuplicates(array, selectedPokemon, name, type) {
  const duplicate = array.find(
    (pokemon) =>
      pokemon.name === selectedPokemon.name &&
      pokemon.type === selectedPokemon.type
  );

  if (duplicate) {
    duplicate.name = name;
    duplicate.type = type;
  }
}

// LOCAL STORAGE LAGRING ----------------------------------------------------
function updateLocalStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// PAGE LOAD
fetchAndShowAllPokemons();
showSavedPokemons();
createAndShowFilter();
