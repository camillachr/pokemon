// GLOBALE VARIABLER
const filterContainer = document.querySelector("#filter-container");
const pokemonContainer = document.querySelector("#pokemon-container");
const savedPokemonContainer = document.querySelector(
  "#saved-pokemon-container"
);
const newPokemonBtn = document
  .querySelector("#new-pokemon-btn")
  .addEventListener("click", makeNewPokemon);

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

let filterButtons = []; //filter-btns opprettes dynamisk og lagres i denne
let allPokemons = []; // Alle
let savedPokemons = []; // Mine lagrede "favoritter"
let myPokemons = []; // Lag-din-egen

// FETCH ----------------------------------------------------

// Fetch 50 pokemons
async function fetchAndShowPokemons() {
  try {
    for (let i = 1; i < 51; i++) {
      const url = `https://pokeapi.co/api/v2/pokemon/${i}`;
      const response = await fetch(url);
      const data = await response.json();
      const pokemon = {
        name: data.name,
        type: data.types[0].type.name,
        id: data.id,
        imgUrl: data.sprites.front_default,
      };
      allPokemons.push(pokemon);
    }
    pushMyPokemonsToAllPokemons();
    showPokemons();
  } catch (error) {
    console.error("Kunne ikke hente pokemons", error);
  }
}

// Hent lagrede lag-din-egen pokemons
function pushMyPokemonsToAllPokemons() {
  myPokemons = JSON.parse(localStorage.getItem("myPokemons")) || [];

  // legger myPokemons øverst i allPokemons, med de nyeste først
  const myPokemonsReversed = myPokemons.slice().reverse(); //chatGPT-hjelp
  myPokemonsReversed.forEach((pokemon) => {
    allPokemons.unshift(pokemon);
  });
}

// Fetch typer
async function fetchTypes() {
  try {
    const allTypes = [];
    for (let i = 1; i < 19; i++) {
      const url = `https://pokeapi.co/api/v2/type/${i}`;
      const response = await fetch(url);
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
    filterBtn.setAttribute("data-type", `${allTypes[i]}`); //chatgpt-hjelp
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
      clickedBtn.classList.toggle("active"); //Toggle lært av Anders
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

  if (cardCounter === 0) {
    pokemonContainer.innerHTML = `Beklager, finner ingen Pokemons.`;
  }
}

// LAG DIN EGEN POKEMON ----------------------------------------------------

function makeNewPokemon() {
  const newPokemonNameInput = document.querySelector("#new-pokemon-name");
  const newPokemonTypeInput = document.querySelector("#new-pokemon-type");

  const newPokemonName = newPokemonNameInput.value.trim().toLowerCase(); //trim lært av Anders
  const newPokemonType = newPokemonTypeInput.value;
  const newPokemonId = setNewPokemonID();

  const newPokemon = {
    id: newPokemonId,
    name: newPokemonName,
    type: newPokemonType,
    imgUrl: "/1-pokemon-list/assets/pokeball.png",
  };

  if (!newPokemonName || !newPokemonType) {
    alert("Du må skrive både navn og type for din nye pokemon.");
  } else {
    addPokemon(newPokemon);
    newPokemonNameInput.value = "";
    newPokemonTypeInput.value = "";
  }
}

// Lager ny ID
function setNewPokemonID() {
  let newId;
  if (myPokemons.length == 0) {
    newId = 500;
  } else {
    newId = myPokemons[0].id + 1; //Nyeste pokemon = index 0 pga unshift
  }
  return newId;
}

// Legg til ny pokemon
function addPokemon(newPokemon) {
  allPokemons.unshift(newPokemon);
  myPokemons.unshift(newPokemon);
  updateLocalStorage("myPokemons", myPokemons);
  toggleFilterButton();
  showPokemons();
}

// LAGRE POKEMONS ----------------------------------------------------
function savePokemon(index) {
  savedPokemons = JSON.parse(localStorage.getItem("savedPokemons")) || [];
  const clickedPokemon = allPokemons[index];

  const duplicate = savedPokemons.find(
    (pokemon) => pokemon.id === clickedPokemon.id
  );
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
  const pokemonToDelete = allPokemons[index];

  // Sletter fra savedPokemons
  savedPokemons = savedPokemons.filter(
    (pokemon) => pokemon.id !== pokemonToDelete.id
  );
  updateLocalStorage("savedPokemons", savedPokemons);

  // Sletter fra myPokemons
  myPokemons = myPokemons.filter(
    (pokemon) => pokemon.id !== pokemonToDelete.id
  );
  updateLocalStorage("myPokemons", myPokemons);

  // Sletter fra allPokemons
  allPokemons.splice(index, 1);

  showPokemons();
  showSavedPokemons();
}

// REDIGER POKEMON ----------------------------------------------------
// Hent nytt navn og type
function getNewNameAndType() {
  //trim lært av Anders
  const newName = prompt("Skriv inn nytt navn:").trim().toLowerCase();
  const newType = prompt("Skriv inn ny type:").trim().toLowerCase();
  const editedPokemon = {
    name: newName,
    type: newType,
  };

  if (!newName || !newType) {
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

  // Redigerer pokemon i allPokemons
  originalPokemon.name = editedPokemon.name;
  originalPokemon.type = editedPokemon.type;

  //  Redigerer pokemon i savedPokemons
  editDuplicates(originalPokemon, savedPokemons);
  updateLocalStorage("savedPokemons", savedPokemons);

  //  Redigerer pokemon i myPokemons
  editDuplicates(originalPokemon, myPokemons);
  updateLocalStorage("myPokemons", myPokemons);

  pushMyPokemonsToAllPokemons();
  showSavedPokemons();
  showPokemons();
}

// Rediger duplikater
function editDuplicates(updatedPokemon, array) {
  const duplicate = array.find((pokemon) => pokemon.id === updatedPokemon.id);

  if (duplicate) {
    duplicate.name = updatedPokemon.name;
    duplicate.type = updatedPokemon.type;
  }
}

// LOCAL STORAGE ------------------------------------
function updateLocalStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// PAGE LOAD --------------------------------------------
fetchAndShowPokemons();
showSavedPokemons();
createAndShowFilter();
