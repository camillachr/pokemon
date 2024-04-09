const selectPokemonContainer = document.querySelector(
  "#select-pokemon-container"
);
const gameCointainer = document.querySelector("#game-container");
const healthBar = document.querySelector("#health-bar");
const battleGround = document.querySelector("#battle-ground");
const yourPokemonImg = document.createElement("div");
yourPokemonImg.classList.add("pokemon");
const enemyPokemonImg = document.createElement("div");
enemyPokemonImg.classList.add("pokemon");
const yourPokemonHealth = document.querySelector("#your-pokemon-health");
const enemyPokemonHealth = document.querySelector("#enemy-pokemon-health");
const movePanel = document.querySelector("#move-panel");
const message = document.querySelector("#message");

const positiveFeedback = ["Rått! ", "Wow! ", "Godt jobba! ", "Fantastisk!"];
const negativeFeedback = ["Ouch, ", "Pass opp, ", "Aaiiii, ", "Oouufff, "];
let gameIsOver = false;
let berryClicked = false;
let pokemons = [];
let berries = [];
let yourPokemon;
let enemyPokemon;

// FETCH POKEMONS (3 stk) --------------------------------------------
async function fetchAndShowPokemons() {
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

// FETCH MOVES -----------------------------
// Looper igjennom, fetcher fra moves URL og oppdaterer pokemon moves med detaljer
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

// Looper igjennom alle 3 pokemons for move-fetching
async function updateMoveDetails() {
  try {
    for (let i = 0; i < pokemons.length; i++) {
      await fetchAndUpdateMoveDetails(pokemons[i]);
    }
  } catch (error) {
    console.error("Kunne ikke oppdatere move detaljer", error);
  }
}

// FETCH BERRIES --------------------------------------------------------
// Fetcher URL-er
async function fetchBerryUrls() {
  try {
    let berriesToFetch = [
      "razz",
      "oran",
      "sitrus",
      "durin",
      "pecha",
      "cheri",
      "leppa",
      "wiki",
    ];
    let berryUrls = [];

    for (let i = 0; i < berriesToFetch.length; i++) {
      const response = await fetch(
        `https://pokeapi.co/api/v2/berry/${berriesToFetch[i]}`
      );
      const data = await response.json();
      const berryUrl = data.item.url;
      berryUrls.push(berryUrl);
    }

    return berryUrls;
  } catch (error) {
    console.error("Kunne ikke hente berries", error);
  }
}

// Fetcher hvert enkelt berry
async function fetchBerries() {
  try {
    const berryUrls = await fetchBerryUrls();

    for (let i = 0; i < berryUrls.length; i++) {
      const url = berryUrls[i];
      const response = await fetch(url);
      const data = await response.json();

      const berry = {
        name: data.name,
        img: data.sprites.default,
      };

      berries.push(berry);
    }
  } catch (error) {
    console.error("Kunne ikke hente berries", error);
  }
}

// VIS POKEMONS ------------------------------------------
function showPokemons() {
  const pokemonsContainer = document.querySelector("#pokemons-container");
  pokemonsContainer.innerHtml = "";

  pokemons.forEach((pokemon, index) => {
    // "kort"
    const card = document.createElement("div");
    card.innerHTML = `<img src="${pokemon.sprites.front_default}" alt=""> 
    <p style="font-weight:bold;">${pokemon.name}</p>  
    <p>HP: ${pokemon.stats.hp}</p> 
    <p>Attack: ${pokemon.stats.attack}</p> 
    <p>Defense: ${pokemon.stats.defense}</p>`;

    // btn
    const selectBtn = document.createElement("button");
    selectBtn.innerHTML = `${pokemon.name},<br> jeg velger deg!`;
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
  selectRandomEnemy();
}

// VELGER FIENDE
function selectRandomEnemy() {
  //filtrerer ut spillers valgte pokemon
  const potentialEnemyPokemons = pokemons.filter(
    (pokemon) => pokemon !== yourPokemon
  );

  //finner en random av de to gjenværende pokemons
  enemyPokemon = chooseRandomItem(potentialEnemyPokemons);

  launchGame();
}

// START SPILLET -----------------------------------------------------
function launchGame() {
  selectPokemonContainer.classList.add("hidden");
  gameCointainer.classList.remove("hidden");

  const hint = document.querySelector("#hint");
  hint.classList.remove("hidden");

  showHp();
  showPokemonPlayers();
  updateMovePanel();
}

// VIS HP / BASE HP
function showHp() {
  // Unngår å vise negativ HP
  if (yourPokemon.stats.hp < 0) {
    yourPokemon.stats.hp = 0;
  }
  if (enemyPokemon.stats.hp < 0) {
    enemyPokemon.stats.hp = 0;
  }

  yourPokemonHealth.innerHTML = `<p> ${yourPokemon.name} HP: <strong > ${yourPokemon.stats.hp} / ${yourPokemon.stats.baseHp}</strong></p>`;
  enemyPokemonHealth.innerHTML = `<p>${enemyPokemon.name} HP: <strong>${enemyPokemon.stats.hp} / ${enemyPokemon.stats.baseHp}</strong></p>`;
}

// VIS SPILLERE
function showPokemonPlayers() {
  const battleGround = document.querySelector("#battle-ground");

  //Din pokemon
  yourPokemonImg.innerHTML = `<img src=${yourPokemon.sprites.back_default} width="150px;"/>`;
  yourPokemonImg.style.position = "absolute";
  yourPokemonImg.style.left = "50px";
  yourPokemonImg.style.bottom = "0";

  //Motstander pokemon
  enemyPokemonImg.innerHTML = `<img src=${enemyPokemon.sprites.front_default} width="150px;"/>`;
  enemyPokemonImg.style.position = "absolute";
  enemyPokemonImg.style.right = "70px";
  enemyPokemonImg.style.bottom = "50px";

  battleGround.append(yourPokemonImg, enemyPokemonImg);
}

// OPPDATER MOVE PANEL
function updateMovePanel() {
  movePanel.innerHTML = "";

  yourPokemon.moves.forEach((move) => {
    const moveBtn = document.createElement("button");
    moveBtn.innerHTML = `${move.name.toUpperCase()}`;
    moveBtn.classList.add("move-btn");
    moveBtn.addEventListener("click", function () {
      attack(move);
    });

    movePanel.append(moveBtn);
  });
  message.innerHTML = "Velg et move!";
}

// ATTACK -----------------------------------------------------
function attack(move) {
  berryClicked = false;

  const damage = calculateAndDoDamage(move, yourPokemon, enemyPokemon);

  const feedback = chooseRandomItem(positiveFeedback);
  message.innerHTML = `Din ${yourPokemon.name} tok en ${move.name}! ${feedback}`;
  movePanel.innerHTML = "";

  showHp();
  checkHealth();

  hpAnimation("damage", damage, enemyPokemonImg);
  moveAnimation(yourPokemonImg, "attack");

  if (!gameIsOver) {
    setTimeout(function () {
      counterAttack();
    }, 2000);
  }
}

// COUNTER ATTACK
function counterAttack() {
  const enemyMoves = enemyPokemon.moves;
  const randomMove = chooseRandomItem(enemyMoves);

  const damage = calculateAndDoDamage(randomMove, enemyPokemon, yourPokemon);

  const feedback = chooseRandomItem(negativeFeedback);
  message.innerHTML = `${feedback + enemyPokemon.name} gjorde en ${
    randomMove.name
  }!`;

  showHp();
  checkHealth();

  hpAnimation("damage", damage, yourPokemonImg);
  moveAnimation(enemyPokemonImg, "counter-attack");

  if (!gameIsOver) {
    // 45% sjanse for at berry blir lagt ut
    setTimeout(function () {
      let chance = Math.random();
      if (chance < 0.45) {
        showBerry();
      }
    }, 3000);

    setTimeout(function () {
      updateMovePanel();
    }, 4000);
  } else if (gameIsOver) {
  }
}

// KALKULER OG GJØR DAMAGE
function calculateAndDoDamage(move, attacker, defender) {
  const attack = attacker.stats.attack;
  const defense = defender.stats.defense;
  const movePower = move.power;

  // Beregner damage med en fiffig formel
  const damage = Math.floor(
    ([(2 * 1) / 5 + 2] * movePower * (attack / defense)) / 50 + 2
  );

  defender.stats.hp -= damage;
  return damage;
}

// SJEKKER HP
function checkHealth() {
  if (yourPokemon.stats.hp <= 0) {
    gameIsOver = true;
    yourPokemonImg.remove();
    yourPokemonHealth.innerHTML = `${yourPokemon.name} har besvimt.`;
    enemyPokemonHealth.innerHTML = `${enemyPokemon.name} vinner!`;
    endGame();
  } else if (enemyPokemon.stats.hp <= 0) {
    gameIsOver = true;
    enemyPokemonImg.remove();
    enemyPokemonHealth.innerHTML = `${enemyPokemon.name} har besvimt.`;
    yourPokemonHealth.innerHTML = `${yourPokemon.name} vinner!`;
    endGame();
  }
}

// ANIMASJON VED UTFØRELSE AV MOVE
function moveAnimation(pokemonImg, attackType) {
  pokemonImg.classList.add(`${attackType}`);
  setTimeout(function () {
    pokemonImg.classList.remove(`${attackType}`);
  }, 500);
}

// ANIMASJON VISER HP ENDRING
function hpAnimation(type, change, pokemonImg) {
  const changeTxt = document.createElement("p");

  //styling etter type animasjon: damage / boost
  if (type == "damage") {
    changeTxt.innerHTML = `-${change}`;
    changeTxt.style.color = "red";
    changeTxt.style.textShadow = " 1px 1px 5px white";
  } else if (type == "berryBoost") {
    changeTxt.innerHTML = `+${change} berry-boost!`;
    changeTxt.style.color = "#6aff00";
    changeTxt.style.textShadow = " 1px 1px 2px black";
  }

  changeTxt.style.position = "absolute";
  changeTxt.style.left = "50%";
  changeTxt.style.transform = "translate(-50%, -50%)"; // Sentrering
  changeTxt.style.fontWeight = "bold";
  changeTxt.style.animation = "slide-up 2s forwards";

  pokemonImg.append(changeTxt);

  setTimeout(function () {
    changeTxt.remove();
  }, 3000);
}

// BERRIES -----------------------------------------------

// VIS BERRY
function showBerry() {
  const randomBerry = chooseRandomItem(berries);
  const berryImg = document.createElement("div");
  berryImg.innerHTML = `<img src="${randomBerry.img}" width="40px;">`;
  berryImg.style.position = "absolute";

  // random plassering
  const top = randomPercent();
  const left = randomPercent();
  berryImg.style.top = top;
  berryImg.style.left = left;

  //eventlistener
  berryImg.addEventListener("click", function () {
    berryClicked = true;
    berryBooster(randomBerry);
    berryImg.remove();
  });

  battleGround.append(berryImg);

  //fjern etter 2 sek og motstander får berryBooster
  setTimeout(function () {
    if (!berryClicked) {
      berryImg.remove();
      berryBooster();
    }
  }, 2000);
}

// BERRY BOOSTER
function berryBooster() {
  //generer random berryBoost mellom 1 og 4
  const berryBoost = Math.floor(Math.random() * 4) + 1;

  //sjekker om bruker rakk å klikke eller ikke, og tildeler boost deretter
  if (berryClicked) {
    yourPokemon.stats.hp += berryBoost;
    hpAnimation("berryBoost", berryBoost, yourPokemonImg);
  } else if (!berryClicked) {
    enemyPokemon.stats.hp += berryBoost;
    hpAnimation("berryBoost", berryBoost, enemyPokemonImg);
  }
}

// generer random prosent for plassering av berry
function randomPercent() {
  // % mellom 10 og 90 (slik at berry ikke vises delvis utenfor vinduet)
  const randomPercent = Math.floor(Math.random() * 80 + 10) + "%";
  return randomPercent;
}

// random-velger
function chooseRandomItem(array) {
  const randomItem = array[Math.floor(Math.random() * array.length)];
  return randomItem;
}

// SPILLET ER OVER -----------------------------------
function endGame() {
  movePanel.innerHTML = "";
  message.innerHTML = "";

  //Start nytt spill-knapp
  const startNewGameBtn = document.createElement("button");
  startNewGameBtn.classList.add("btn");
  startNewGameBtn.innerHTML = "Start nytt spill";
  startNewGameBtn.addEventListener("click", function () {
    location.reload();
  });

  message.append(startNewGameBtn);
}

// PAGE LOAD
fetchAndShowPokemons();
fetchBerries();
