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
let myPokemons = JSON.parse(localStorage.getItem("myPokemons")) || [];
let savedPokemons = JSON.parse(localStorage.getItem("savedPokemons")) || [];
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

//FETCH 50 POKEMONS
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

      allPokemons.push(pokemon);
    }

    allPokemons.unshift(...myPokemons); //pusher inn eksisterende selvlagde pokemons
    updatePokemonList(allPokemons, pokemonContainer);
  } catch (error) {
    console.error("Kunne ikke hente pokemons", error);
  }
}

//FETCH POKEMON-TYPER
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

//VIS POKEMON-OVERSIKT
async function updatePokemonList(pokemonList, container) {
  container.innerHTML = "";

  pokemonList.forEach((pokemon, index) => {
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

    //buttons og append til vanlige kort
    if (container === pokemonContainer) {
      const editBtn = setupButton("edit", pokemon);
      const saveBtn = setupButton("save", pokemon);
      const deleteBtn = setupButton("delete", index, allPokemons);

      const buttonContainer = document.createElement("div");
      buttonContainer.style.display = "flex";
      buttonContainer.style.flexDirection = "column";
      buttonContainer.style.gap = "5px";

      buttonContainer.append(saveBtn, deleteBtn, editBtn);
      card.append(buttonContainer);
    } else {
      //button og append til lagret kort
      const deleteBtn = setupButton("delete", index, savedPokemons);
      card.append(deleteBtn);
    }

    container.append(card);
  });
}

//SLETTE
async function deletePokemon(index, array) {
  array.splice(index, 1);
  updatePokemonList(allPokemons, pokemonContainer);
  updatePokemonList(savedPokemons, savedPokemonContainer);
}

//BUTTON OPPSETT
function setupButton(action, parameter, array) {
  const button = document.createElement("button");
  button.classList.add("btn");

  if (action === "delete") {
    button.innerHTML = "Slett";
    button.addEventListener("click", function () {
      deletePokemon(parameter, array);
    });
  } else if (action === "edit") {
    button.innerHTML = "Rediger";
    button.addEventListener("click", function () {
      editPokemon(parameter);
    });
  } else if (action === "save") {
    button.innerHTML = "Lagre";
    button.addEventListener("click", function () {
      savePokemon(parameter);
    });
  } else if (action === "remove") {
    button.innerHTML = "Fjern";
    button.addEventListener("click", function () {
      removePokemon(parameter);
    });
  } else {
    console.error("Feil ved oppsett av button i setUpButton");
  }

  return button;
}

//LAG TYPE-FILTER-KNAPPER
async function createAndShowFilterBtns() {
  allTypes = await fetchTypes();

  for (let i = 0; i < allTypes.length; i++) {
    const filterBtn = document.createElement("button");
    filterBtn.classList.add("filter-btn", "btn");
    filterBtn.setAttribute("data-type", `${allTypes[i]}`);
    filterBtn.innerHTML = allTypes[i];

    const filterBtnContainer = document.querySelector("#filter-btn-container");
    filterBtnContainer.append(filterBtn);
  }
}

//FILTRERINGS-FUNKSJONALITET
async function setUpFilter() {
  await createAndShowFilterBtns();
  filterButtons = document.querySelectorAll(".filter-btn");

  filterButtons.forEach((button) => {
    button.addEventListener("click", function () {
      //Sjekker om den klikkede knappen allerede er aktiv, hvis ikke;filtrer
      if (button.classList.contains("active")) {
        toggleFilterButton(button);
        updatePokemonList(allPokemons, pokemonContainer);
      } else {
        toggleFilterButton(button);
        const type = button.dataset.type;

        const filteredPokemons = allPokemons.filter(
          (pokemon) => pokemon.type == type
        );

        updatePokemonList(filteredPokemons, pokemonContainer);

        //Feilhåndtering dersom ingen treff
        if (filteredPokemons.length == 0) {
          pokemonContainer.innerHTML = `Beklager, finner ingen Pokemons av typen ${type}.`;
        }
      }
    });
  });
}

//TOGGLE FILTER-KNAPP
function toggleFilterButton(clickedBtn) {
  filterButtons.forEach((button) =>
    button === clickedBtn
      ? clickedBtn.classList.toggle("active")
      : button.classList.remove("active")
  );
}

//LAG DIN EGEN POKEMON
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

  //sjekker etter duplikat
  const duplicate = allPokemons.find(
    (pokemon) =>
      pokemon.name === newPokemonName && pokemon.type === newPokemonType
  );
  if (duplicate) {
    alert("Denne pokemonen finnes allerede.");
    return;
  }

  //legger til og viser ny pokemon i oversikten
  allPokemons.unshift(newPokemon);
  toggleFilterButton();
  updatePokemonList(allPokemons, pokemonContainer);

  //lagrer ny pokemon i localstorage
  myPokemons.unshift(newPokemon);
  updateLocalStorage("myPokemons", myPokemons);

  //tømmer input-felter
  newPokemonNameInput.value = "";
  newPokemonTypeInput.value = "";
}

//LAGRE FAVORITT-POKEMONS
function savePokemon(selectedPokemon) {
  //henter ut evt tidligere lagrede pokemons
  savedPokemons = JSON.parse(localStorage.getItem("savedPokemons")) || [];

  if (savedPokemons.length < 5) {
    //lagrer ny pokemon og oppdaterer localStorage
    savedPokemons.unshift(selectedPokemon);
    updateLocalStorage("savedPokemons", savedPokemons);

    //oppdaterer oversikt på siden
    updatePokemonList(savedPokemons, savedPokemonContainer);
  } else {
    alert(
      "Du kan bare lagre 5 pokemons. Fjern en pokemon fra samlingen for å lagre en ny."
    );
  }
}

//LOCAL STORAGE LAGRING
function updateLocalStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

//Page load
fetchAndShowAllPokemons();
updatePokemonList(savedPokemons, savedPokemonContainer);
setUpFilter();
