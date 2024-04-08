let pokemons = [];

// FETCH POKEMONS (3 stk)
async function fetchPokemons() {
  try {
    const pokemonsToFetch = ["squirtle", "charmander", "bulbasaur"];
    for (i = 0; i < pokemonsToFetch.length; i++) {
      const response = await fetch(
        `https://pokeapi.co/api/v2/pokemon/${pokemonsToFetch[i]}`
      );
      const data = await response.json();
      const pokemon = {
        name: data.name,
        type: data.types[0].type.name,
        sprites: data.sprites,
        stats: {
          hp: data.stats[0].base_stat,
          attack: data.stats[1].base_stat,
          defense: data.stats[2].base_stat,
        },
        moves: [
          { name: data.moves[0].move.name, url: data.moves[0].move.url },
          { name: data.moves[1].move.name, url: data.moves[1].move.url },
          { name: data.moves[2].move.name, url: data.moves[2].move.url },
          { name: data.moves[3].move.name, url: data.moves[3].move.url },
        ],
      };
      pokemons.push(pokemon);
    }
    showPokemons();
    console.log(pokemons);
  } catch (error) {
    console.error("Kunne ikke hente pokemons", error);
  }
}

function showPokemons() {
  const pokemonsOptionsContainer = document.querySelector(
    "#pokemon-options-container"
  );
  pokemonsOptionsContainer.style.display = "flex";
  pokemonsOptionsContainer.style.gap = "40px";

  pokemonsOptionsContainer.innerHtml = "";

  pokemons.forEach((pokemon, index) => {
    const card = document.createElement("div");
    card.innerHTML = `<img src="${pokemon.sprites.front_default}" alt="">  <p>HP: ${pokemon.stats.hp}</p> <p>Attack: ${pokemon.stats.attack}</p> <p>Defense: ${pokemon.stats.defense}</p>`;

    const selectBtn = document.createElement("button");
    selectBtn.innerHTML = `${pokemon.name}, I choose you!`;
    selectBtn.addEventListener("click", function () {
      console.log("Du valgte: ", pokemon.name);
    });

    pokemonsOptionsContainer.append(card);
  });
}

fetchPokemons();
