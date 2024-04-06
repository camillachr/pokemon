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

let savedPokemons = [];
let myPokemons = [];
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
      fetchedPokemons.push(pokemon);
    }
    pushMyPokemonsToAllPokemons();
    showPokemons();
  } catch (error) {
    console.error("Kunne ikke hente pokemons", error);
  }
}

function pushMyPokemonsToAllPokemons() {
  myPokemons = JSON.parse(localStorage.getItem("myPokemons")) || [];
  allPokemons = myPokemons.concat(fetchedPokemons); //lært av Anders
}

// VIS ALLE POKEMONS -------------------------------------------------
async function showPokemons() {
  pokemonContainer.innerHTML = "";

  const activeFilterBtn = document.querySelector(".filter-btn.active");
  let cardCounter = 0;

  allPokemons.forEach((pokemon, index) => {
    // Filter
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

  //Feilhåndtering
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
      showPokemons();
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

  //feilhåndtering
  const duplicate = allPokemons.find(
    (pokemon) =>
      pokemon.name === newPokemon.name && pokemon.type === newPokemon.type
  );
  if (duplicate) {
    alert("Denne pokemonen finnes allerede.");
    return;
  } else if (!newPokemonName || !newPokemonType) {
    alert("Du må skrive både navn og type for din nye pokemon.");
    return;
  } else if (!allTypes.includes(newPokemonType)) {
    alert("Denne typen finnes ikke.");
    return;
  }

  addPokemon(newPokemon);
  newPokemonNameInput.value = "";
  newPokemonTypeInput.value = "";
}

function addPokemon(newPokemon) {
  myPokemons.unshift(newPokemon);
  updateLocalStorage("myPokemons", myPokemons);
  pushMyPokemonsToAllPokemons();
  toggleFilterButton();
  showPokemons();
}

// LAGRE POKEMONS ----------------------------------------------------
function savePokemon(index) {
  savedPokemons = JSON.parse(localStorage.getItem("savedPokemons")) || [];
  const chosenPokemon = allPokemons[index];

  //feilhåndtering
  const duplicate = savedPokemons.find(
    (pokemon) =>
      pokemon.name === chosenPokemon.name && pokemon.type === chosenPokemon.type
  );
  if (duplicate) {
    alert("Denne pokemonen har du allerede lagret.");
  } else if (savedPokemons.length >= 5) {
    alert("Du kan bare lagre 5 pokemons. Fjern en for å lagre ny.");
  }

  //lagrer pokemon
  savedPokemons.unshift(chosenPokemon);
  updateLocalStorage("savedPokemons", savedPokemons);
  showSavedPokemons();
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

  //Feilhåndtering
  if (cardCounter === 0) {
    savedPokemonContainer.innerHTML = `Ingen lagrede pokemons.`;
  }
}

// FJERN POKEMON FRA LAGREDE
function removeFromSaved(index) {
  savedPokemons.splice(index, 1);
  updateLocalStorage("savedPokemons", savedPokemons);
  showSavedPokemons();
}

// SLETT POKEMON ALLE STEDER ----------------------------------------------------
function deletePokemon(index) {
  savedPokemons = filterPokemonArray(index, savedPokemons);
  updateLocalStorage("savedPokemons", savedPokemons);

  myPokemons = filterPokemonArray(index, myPokemons);
  updateLocalStorage("myPokemons", myPokemons);

  allPokemons = filterPokemonArray(index, allPokemons);

  showPokemons();
  showSavedPokemons();
}

function filterPokemonArray(index, array) {
  const selectedPokemon = allPokemons[index];

  array = array.filter(
    (pokemon) =>
      pokemon.name !== selectedPokemon.name ||
      pokemon.type !== selectedPokemon.type
  );
  return array;
}

// REDIGER POKEMON ----------------------------------------------------
function editPokemon(index) {
  const editedPokemon = getNewNameAndType();
  const selectedPokemon = allPokemons[index];

  editDuplicates(
    savedPokemons,
    selectedPokemon,
    editedPokemon.name,
    editedPokemon.type
  );
  updateLocalStorage("savedPokemons", savedPokemons);

  editDuplicates(
    myPokemons,
    selectedPokemon,
    editedPokemon.name,
    editedPokemon.type
  );
  updateLocalStorage("myPokemons", myPokemons);
  pushMyPokemonsToAllPokemons();

  selectedPokemon.name = editedPokemon.name;
  selectedPokemon.type = editedPokemon.type;
  showSavedPokemons();
  showPokemons();
}

function getNewNameAndType() {
  const newName = prompt("Skriv inn nytt navn:").toLowerCase();
  const newType = prompt("Skriv inn ny type:").toLowerCase();

  //feilhåndtering
  const duplicate = allPokemons.find(
    (pokemon) => pokemon.name === newName && pokemon.type === newType
  );

  if (duplicate) {
    //sjekker om den allerede finnes
    alert("Denne pokemonen finnes allerede.");
  } else if (!newName || !newType) {
    //sjekker at feltene er fylt ut
    alert("Du må fylle ut begge feltene.");
  } else if (!allTypes.includes(newType)) {
    //sjekker at typen finnes
    alert("Denne typen finnes ikke.");
  }
  return { name: newName, type: newType };
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
fetchAndShowPokemons();
showSavedPokemons();
createAndShowFilter();
