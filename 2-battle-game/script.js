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
    for (let i = 0; i < pokemonsToFetch.length; i++) {
      const response = await fetch(
        `https://pokeapi.co/api/v2/pokemon/${pokemonsToFetch[i]}`
      );
      const data = await response.json();
      const pokemon = {
        name: data.name,
        type: data.types[0].type.name,
        sprites: data.sprites,
        stats: {
          baseHp: 45,
          hp: 45,
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
    updateMoveDetails();
  } catch (error) {
    console.error("Kunne ikke hente pokemons", error);
  }
}

fetchPokemons();

// FETCH MOVES -----------------------------
//Looper igjennom, fetcher fra moves URL og oppdaterer pokemon moves med detaljer
async function fetchAndUpdateMoveDetails(pokemon) {
  try {
    let movesWithDetails = []; //midlertidig lagring av nye moves
    for (let i = 0; i < pokemon.moves.length; i++) {
      const moveUrl = pokemon.moves[i].url;
      const response = await fetch(moveUrl);
      const data = await response.json();
      const move = {
        name: data.name,
        power: data.power,
      };
      movesWithDetails.push(move);
    }
    //erstatter move url med fetchede detaljer
    pokemon.moves = movesWithDetails;
    pokemons[2].moves[1].power = 120; //liten manuell fix, api verdi var null
  } catch (error) {
    console.error("Kunne ikke hente moves", error);
  }
}

//Looper igjennom alle 3 pokemons
async function updateMoveDetails() {
  try {
    for (let i = 0; i < pokemons.length; i++) {
      await fetchAndUpdateMoveDetails(pokemons[i]);
    }
    console.log("Pokemons", pokemons);
  } catch (error) {
    console.log("Kunne ikke oppdatere move detaljer", error);
  }
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
  console.log("Din motstander: ", enemyPokemon.name);
  launchGame();
}

// START SPILLET -----------------------------------------------------
function launchGame() {
  selectPokemonContainer.classList.add("hidden");
  gameCointainer.classList.remove("hidden");
  updateHealthBar();
  showPokemonPlayers();
  updateMovePanel();
}

// OPPDATER HEALTH BAR
function updateHealthBar() {
  //Din pokemon HP
  const yourPokemonHealth = document.querySelector("#your-pokemon-health");

  yourPokemonHealth.innerHTML = `<p>Din pokemon <br> ${yourPokemon.name} HP: ${yourPokemon.stats.hp} / ${yourPokemon.stats.baseHp}</p>`;

  //Motstanders pokemon HP
  const enemyPokemonHealth = document.querySelector("#enemy-pokemon-health");

  enemyPokemonHealth.innerHTML = `<p>Motstander <br>${enemyPokemon.name} HP: ${enemyPokemon.stats.hp} / ${enemyPokemon.stats.baseHp}</p>`;
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
  enemyPokemonImg.style.bottom = "50px";

  battleGround.append(yourPokemonImg, enemyPokemonImg);
}

// OPPDATER MOVE PANEL
function updateMovePanel() {
  yourPokemon.moves.forEach((move) => {
    const moveBtn = document.createElement("button");
    moveBtn.innerHTML = `${move.name}`;
    moveBtn.classList.add("move-btn");
    moveBtn.addEventListener("click", function () {
      attack(move, yourPokemon, enemyPokemon);
    });

    movePanel.append(moveBtn);
  });
  message.innerHTML = "Velg ditt neste move!";
}

// ATTACK -----------------------------------------------------
function attack(move, attacker, defender) {
  const attack = attacker.stats.attack;
  const defense = defender.stats.defense;
  const movePower = move.power;

  // Beregner damage med en fiffig formel
  const damage = Math.floor(
    ([(2 * 1) / 5 + 2] * movePower * (attack / defense)) / 50 + 2
  );

  defender.stats.hp -= damage;
  updateHealthBar();

  if (attacker == enemyPokemon) {
    message.innerHTML = `Pass opp, ${attacker.name} gjorde en ${move.name}!`;
  } else {
    message.innerHTML = `Du gjorde en ${move.name}!`;
    setTimeout(function () {
      counterAttack();
    }, 1000);
  }
}

function counterAttack() {
  const randomMove =
    enemyPokemon.moves[Math.floor(Math.random() * enemyPokemon.moves.length)];

  attack(randomMove, enemyPokemon, yourPokemon);
  checkHealth();
}

function checkHealth() {
  if (yourPokemon.stats.hp <= 0) {
    alert(`${yourPokemon.name} besvimte! Du tapte..`);
    endGame();
  } else if (enemyPokemon.stats.hp <= 0) {
    alert(`${enemyPokemon.name} besvimte! Gratulerer du vant!`);
    endGame();
  }
}

function endGame() {
  //Tøm move panel
  movePanel.innerHTML = "";
  //Start nytt spill knapp
  const startNewGameBtn = document.createElement("button");
  startNewGameBtn.classList.add("btn");
  startNewGameBtn.innerHTML = "Start nytt spill";
  startNewGameBtn.addEventListener("click", function () {
    location.reload();
  });
  message.innerHTML = "";
  message.append(startNewGameBtn);
}
