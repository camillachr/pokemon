const filterContainer = document.querySelector("#filter-container");
const filterButtons = document.querySelectorAll(".filter-btn");
const pokemonContainer = document.querySelector("#pokemon-container");
const savedPokemonContainer = document.querySelector(
  "#saved-pokemon-container"
);
let allPokemons = [];

// fetch pokemons
async function fetchPokemons() {
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
  } catch (error) {
    console.error("Kunne ikke hente pokemons", error);
  }
}

fetchPokemons();

// vis pokemons på siden
async function updatePokemonList(pokemonList) {
  pokemonContainer.innerHTML = "";

  for (i = 0; i < pokemonList.length; i++) {
    //lager kort med styling
    const card = document.createElement("div");
    card.innerHTML = `<p style="margin: 0;">${pokemonList[i].type}</p><img src=" ${pokemonList[i].imgUrl}" width="100px" /><h3 style="margin: 20px 0;">${pokemonList[i].name}</h3>  `;
    card.style.backgroundColor = "#f6da6c";
    card.style.padding = "20px";
    card.style.boxShadow = "rgba(0, 0, 0, 0.24) 0px 3px 8px";
    card.style.color = "#3a57a1";
    card.style.display = "flex";
    card.style.flexDirection = "column";
    card.style.alignItems = "center";

    //legger til knapper på kortet
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
    //tømme meldingsfeltet
    const message = document.querySelector("#message");
    message.innerHTML = "";

    //markere den aktive filter-knappen
    toggleActiveButton(filterButtons, button);

    //selve filtreringen
    const type = button.dataset.type;
    const filteredPokemons = allPokemons.filter(
      (pokemon) => pokemon.type == type
    );
    updatePokemonList(filteredPokemons);

    //Feilhåndtering dersom ingen treff
    if (filteredPokemons.length == 0) {
      message.innerHTML = `Beklager, finner ingen Pokemons av typen ${type}.`;
    }
  });
});

//markere aktiv filter-knapp
function toggleActiveButton(filterButtons, activeButton) {
  filterButtons.forEach((button) => {
    if (button === activeButton) {
      button.classList.add("active");
    } else {
      button.classList.remove("active");
    }
  });
}
