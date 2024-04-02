const filterContainer = document.querySelector("#filter-container");
const savedPokemonContainer = document.querySelector(
  "#saved-pokemon-container"
);
let allPokemons = [];

// fetch
async function fetchPokemons() {
  try {
    for (i = 1; i < 51; i++) {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${i}`);
      const data = await response.json();
      const pokemon = data;
      allPokemons.push(pokemon);
    }

    console.log(allPokemons);
    showAllPokemons();
  } catch (error) {
    console.error("Kunne ikke hente pokemons", error);
  }
}
fetchPokemons();

//vis pokemons på siden
async function showAllPokemons() {
  const pokemonContainer = document.querySelector("#pokemon-container");
  pokemonContainer.innerHTML = "";

  for (i = 0; i < allPokemons.length; i++) {
    //henter informasjon til kort
    const imgUrl = allPokemons[i].sprites.front_default;
    const name = allPokemons[i].name;
    const type = allPokemons[i].types[0].type.name;

    //lager kort med styling
    const card = document.createElement("div");
    card.innerHTML = `<p>${type}</p><img src=" ${imgUrl}" width="100px" /><h3>${name}</h3>  `;
    card.style.backgroundColor = "#f6da6c";
    card.style.padding = "20px";
    card.style.border = "solid 2px white";
    card.style.color = "#3a57a1";
    card.style.display = "flex";
    card.style.flexDirection = "column";
    card.style.alignItems = "center";

    //legger til knapper på kortet
    const buttonContainer = document.createElement("div");
    const saveBtn = document.createElement("button");
    const deleteBtn = document.createElement("button");
    const editBtn = document.createElement("button");

    saveBtn.classList.add("btn");
    deleteBtn.classList.add("btn");
    editBtn.classList.add("btn");

    saveBtn.innerHTML = "Lagre";
    deleteBtn.innerHTML = "Slett";
    editBtn.innerHTML = "Rediger";

    //append
    buttonContainer.append(saveBtn, deleteBtn, editBtn);
    card.append(buttonContainer);
    pokemonContainer.append(card);
  }
}
