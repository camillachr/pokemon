const selectPokemonContainer = document.querySelector(
  "#select-pokemon-container"
);

const gameCointainer = document.querySelector("#game-container");
const healthBar = document.querySelector("#health-bar");

const battleGround = document.querySelector("#battle-ground");
const movePanel = document.querySelector("#move-panel");
const message = document.querySelector("#message");

let pokemons = [];
let yourPokemon;
let enemyPokemon;

// FETCH POKEMONS (3 stk) --------------------------------------------
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
          baseHp: data.stats[0].base_stat,
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
fetchPokemons();

// FETCH MOVES
async function fetchMoveDetails() {
  // fetche alle moves og gjøre hva?
}

// VIS POKEMONS ------------------------------------------
function showPokemons() {
  const pokemonsContainer = document.querySelector("#pokemons-container");
  pokemonsContainer.innerHtml = "";

  pokemons.forEach((pokemon, index) => {
    //kort
    const card = document.createElement("div");
    card.innerHTML = `<img src="${pokemon.sprites.front_default}" alt=""> 
    <p style="font-weight:bold;">${pokemon.name}</p>  
    <p>HP: ${pokemon.stats.hp}</p> 
    <p>Attack: ${pokemon.stats.attack}</p> 
    <p>Defense: ${pokemon.stats.defense}</p>`;

    //btn
    const selectBtn = document.createElement("button");
    selectBtn.innerHTML = `${pokemon.name},<br> I choose you!`;
    selectBtn.classList.add("btn");
    selectBtn.addEventListener("click", function () {
      selectPokemon(index);
    });

    card.append(selectBtn);
    pokemonsContainer.append(card);
  });
}

// VELG POKEMON
function selectPokemon(index) {
  yourPokemon = pokemons[index];
  console.log("Du valgte: ", yourPokemon.name);
  selectRandomEnemy();
}

// VELGER FIENDE
function selectRandomEnemy() {
  //filtrerer ut spillers valgte pokemon
  const potentialEnemyPokemons = pokemons.filter(
    (pokemon) => pokemon !== yourPokemon
  );
  //finner en random av de to gjenværende pokemons
  const randomIndex = Math.floor(Math.random() * potentialEnemyPokemons.length);

  enemyPokemon = potentialEnemyPokemons[randomIndex];
  console.log("Din motstander: ", enemyPokemon);
  launchGame();
}

// START SPILLET -----------------------------------------------------
function launchGame() {
  selectPokemonContainer.classList.add("hidden");
  gameCointainer.classList.remove("hidden");
  updateHealthBar();
  showPokemonPlayers();
}

// OPPDATER HEALTH BAR
function updateHealthBar() {
  //Din pokemon HP
  const yourPokemonHealth = document.querySelector("#your-pokemon-health");
  yourPokemonHealth.innerHTML = `<p>${yourPokemon.name} HP: ${yourPokemon.stats.hp} / ${yourPokemon.stats.baseHp}</p>`;

  //Motstanders pokemon HP
  const enemyPokemonHealth = document.querySelector("#enemy-pokemon-health");
  enemyPokemonHealth.innerHTML = `<p>${enemyPokemon.name} HP: ${enemyPokemon.stats.hp} / ${enemyPokemon.stats.baseHp}</p>`;
}

// VIS SPILLERE
function showPokemonPlayers() {
  const battleGround = document.querySelector("#battle-ground");

  //Din pokemon
  const yourPokemonImg = document.createElement("div");
  yourPokemonImg.innerHTML = `<img src=${yourPokemon.sprites.back_default} width="150px;"/>`;
  yourPokemonImg.style.position = "absolute";
  yourPokemonImg.style.left = "50px";
  yourPokemonImg.style.bottom = "0";

  //Motstander pokemon
  const enemyPokemonImg = document.createElement("div");
  enemyPokemonImg.innerHTML = `<img src=${enemyPokemon.sprites.front_default} width="150px;"/>`;
  enemyPokemonImg.style.position = "absolute";
  enemyPokemonImg.style.right = "70px";

  battleGround.append(yourPokemonImg, enemyPokemonImg);
}

// OPPDATER MOVE PANEL
function updateMovePanel() {
  //viser moves i move-panel
}

// ATTACK -----------------------------------------------------
function attack(move, attacker, defender) {}

function calculateDamage() {
  //regn ut damage med attack, defense osv
}

function counterAttack(move, attacker, defender) {}

function checkHealth() {
  //sjekker om noen er HP 0, da er pokemonen fainted og spillet over
}

// START NYTT SPILL
function startNewGame() {
  selectPokemonContainer.classList.remove("hidden");
  gameCointainer.classList.add("hidden");
}
