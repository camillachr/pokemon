// GLOBALE VARIABLER
const filterContainer = document.querySelector("#filter-container");
let filterButtons = []; //knappene opprettes dynamisk og lagres i denne
const pokemonContainer = document.querySelector("#pokemon-container");
const savedPokemonContainer = document.querySelector(
  "#saved-pokemon-container"
);
const newPokemonBtn = document
  .querySelector("#new-pokemon-btn")
  .addEventListener("click", makeNewPokemon);

let allPokemons = [];
let savedPokemons = [];
let myPokemons = [];
let fetchedPokemons = [];

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

// Fetch 50 pokemons
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

// Hent lagrede selvlagde pokemons
function pushMyPokemonsToAllPokemons() {
  myPokemons = JSON.parse(localStorage.getItem("myPokemons")) || [];
  allPokemons = myPokemons.concat(fetchedPokemons);
}

// Fetch typer
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

// Toggle filter knapp
function toggleFilterButton(clickedBtn) {
  filterButtons.forEach((button) => {
    if (button === clickedBtn) {
      clickedBtn.classList.toggle("active");
    } else {
      button.classList.remove("active");
    }
  });
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

      // button container
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
  const duplicate = checkForDuplicates(newPokemon, allPokemons);
  if (duplicate) {
    alert("Denne pokemonen finnes allerede.");
  } else if (!newPokemonName || !newPokemonType) {
    alert("Du må skrive både navn og type for din nye pokemon.");
  } else {
    addPokemon(newPokemon);
    newPokemonNameInput.value = "";
    newPokemonTypeInput.value = "";
  }
}

// Legg til ny pokemon
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
  const clickedPokemon = allPokemons[index];

  const duplicate = checkForDuplicates(clickedPokemon, savedPokemons);
  if (duplicate) {
    alert("Denne pokemonen har du allerede lagret.");
  } else if (savedPokemons.length >= 5) {
    alert("Du kan bare lagre 5 pokemons. Fjern en for å lagre ny.");
  } else {
    savedPokemons.unshift(clickedPokemon);
    updateLocalStorage("savedPokemons", savedPokemons);
    showSavedPokemons();
  }
}

// Vis lagrede pokemons
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

// Fjern / slett fra lagrede pokemons
function removeFromSaved(index) {
  savedPokemons.splice(index, 1);
  updateLocalStorage("savedPokemons", savedPokemons);
  showSavedPokemons();
}

// SLETT POKEMON ----------------------------------------------------
function deletePokemon(index) {
  savedPokemons = filterPokemonArray(index, savedPokemons);
  updateLocalStorage("savedPokemons", savedPokemons);

  myPokemons = filterPokemonArray(index, myPokemons);
  updateLocalStorage("myPokemons", myPokemons);

  allPokemons = filterPokemonArray(index, allPokemons);

  showPokemons();
  showSavedPokemons();
}

// Filtrer ut / slett pokemon
function filterPokemonArray(index, array) {
  const pokemonToRemove = allPokemons[index];

  array = array.filter(
    (pokemon) =>
      pokemon.name !== pokemonToRemove.name ||
      pokemon.type !== pokemonToRemove.type
  );
  return array;
}

// REDIGER POKEMON ----------------------------------------------------

// Hent nytt navn og type
function getNewNameAndType() {
  const newName = prompt("Skriv inn nytt navn:").toLowerCase();
  const newType = prompt("Skriv inn ny type:").toLowerCase();
  const editedPokemon = {
    name: newName,
    type: newType,
  };

  const duplicate = checkForDuplicates(editedPokemon, allPokemons);

  if (duplicate) {
    alert("Denne pokemonen finnes allerede.");
  } else if (!newName || !newType) {
    alert("Du må fylle ut begge feltene.");
  } else if (!allTypes.includes(newType)) {
    alert("Denne typen finnes ikke.");
  } else {
    return editedPokemon;
  }
}

// Rediger pokemon alle steder
function editPokemon(index) {
  const editedPokemon = getNewNameAndType();
  const originalPokemon = allPokemons[index];

  editDuplicates(
    savedPokemons,
    originalPokemon,
    editedPokemon.name,
    editedPokemon.type
  );
  updateLocalStorage("savedPokemons", savedPokemons);

  editDuplicates(
    myPokemons,
    originalPokemon,
    editedPokemon.name,
    editedPokemon.type
  );
  updateLocalStorage("myPokemons", myPokemons);
  pushMyPokemonsToAllPokemons();

  originalPokemon.name = editedPokemon.name;
  originalPokemon.type = editedPokemon.type;
  showSavedPokemons();
  showPokemons();
}

// Rediger duplikater
function editDuplicates(array, originalPokemon, newName, newType) {
  const duplicate = checkForDuplicates(originalPokemon, array);

  if (duplicate) {
    duplicate.name = newName;
    duplicate.type = newType;
  }
}

// GENERISKE FUNKSJONER ------------------------------------
function updateLocalStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function checkForDuplicates(pokemonToCheck, array) {
  const duplicate = array.find(
    (pokemon) =>
      pokemon.name === pokemonToCheck.name &&
      pokemon.type === pokemonToCheck.type
  );

  if (duplicate) {
    return duplicate;
  }
}

// PAGE LOAD --------------------------------------------
fetchAndShowPokemons();
showSavedPokemons();
createAndShowFilter();
