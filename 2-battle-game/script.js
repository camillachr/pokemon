// GLOBALE VARIABLER
const selectPokemonContainer = document.querySelector(
  "#select-pokemon-container"
);
const gameCointainer = document.querySelector("#game-container");
const healthBar = document.querySelector("#health-bar");
const battleGround = document.querySelector("#battle-ground");
const yourPokemonHP = document.querySelector("#your-pokemon-health");
const enemyPokemonHP = document.querySelector("#enemy-pokemon-health");
const movePanel = document.querySelector("#move-panel");
const message = document.querySelector("#message");
const yourPokemonImg = document.createElement("div");
const enemyPokemonImg = document.createElement("div");

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
      const url = `https://pokeapi.co/api/v2/pokemon/${pokemonsToFetch[i]}`;
      const response = await fetch(url);
      const data = await response.json();
      const pokemon = {
        name: data.name,
        type: data.types[0].type.name,
        sprites: data.sprites,
        stats: {
          baseHp: 45,
          hp: 45, //satte dette manuelt slik at alle har lik
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
// Looper igjennom, fetcher fra hver moves-URL og oppdaterer hver pokemon med moves detaljer
async function fetchAndUpdateMoveDetails(pokemon) {
  try {
    let movesWithDetails = []; //midlertidig lagring av nye moves
    for (let i = 0; i < pokemon.moves.length; i++) {
      const url = pokemon.moves[i].url;
      const response = await fetch(url);
      const data = await response.json();
      const move = {
        name: data.name,
        power: data.power,
      };
      movesWithDetails.push(move);
    }
    //erstatter move url med fetchede detaljer
    pokemon.moves = movesWithDetails;
    pokemons[2].moves[1].power = 120; //liten manuell fix, api verdien var null
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
      const url = `https://pokeapi.co/api/v2/berry/${berriesToFetch[i]}`;
      const response = await fetch(url);
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

// FORSIDEN ------------------------------------------
// Vis pokemons
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

// Velg pokemon
function selectPokemon(index) {
  yourPokemon = pokemons[index];
  selectRandomEnemy();
}

// Automatisk valg av motstander
function selectRandomEnemy() {
  //filtrerer ut spillers valgte pokemon
  const potentialEnemyPokemons = pokemons.filter(
    (pokemon) => pokemon !== yourPokemon
  );

  //finner en random av de to gjenværende pokemons
  enemyPokemon = chooseRandomItem(potentialEnemyPokemons);

  launchGame();
}

// ÅPNE SPILLET  -------------------------------------------------
function launchGame() {
  selectPokemonContainer.classList.add("hidden");
  gameCointainer.classList.remove("hidden");

  const hint = document.querySelector("#hint");
  hint.classList.remove("hidden");

  showHp();
  showPokemonPlayers();
  updateMovePanel();
}

// Vis HP
function showHp() {
  // Unngår å vise negativ HP
  if (yourPokemon.stats.hp < 0) {
    yourPokemon.stats.hp = 0;
  }
  if (enemyPokemon.stats.hp < 0) {
    enemyPokemon.stats.hp = 0;
  }

  yourPokemonHP.innerHTML = `<p> ${yourPokemon.name} HP: <strong > ${yourPokemon.stats.hp} / ${yourPokemon.stats.baseHp}</strong></p>`;
  enemyPokemonHP.innerHTML = `<p>${enemyPokemon.name} HP: <strong>${enemyPokemon.stats.hp} / ${enemyPokemon.stats.baseHp}</strong></p>`;
}

// Vis spillere
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

// Oppdater move panel
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

// SELVE SPILLET  -------------------------------------------
// Attack
function attack(move) {
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

// Counter attack
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
    setTimeout(function () {
      // 60% sjanse for at berry/virus blir lagt ut
      let chance = Math.random();
      if (chance < 0.6) {
        let virusChance = Math.random();
        // 1/3 av tilfellene legges virus ut
        if (virusChance < 0.33) {
          showVirus();
        } else {
          showBerry();
        }
      }

      updateMovePanel();
    }, 3000);
  }
}

// Kalkuler og gjør damage
function calculateAndDoDamage(move, attacker, defender) {
  const attack = attacker.stats.attack;
  const defense = defender.stats.defense;
  const movePower = move.power;

  // Beregner damage med en fiffig formel fra youtube
  const damage = Math.floor(
    ([(2 * 1) / 5 + 2] * movePower * (attack / defense)) / 50 + 2
  );

  defender.stats.hp -= damage;
  return damage;
}

// Sjekker HP
function checkHealth() {
  if (yourPokemon.stats.hp <= 0) {
    gameIsOver = true;
    yourPokemonImg.remove();
    yourPokemonHP.innerHTML = `${yourPokemon.name} har besvimt.`;
    enemyPokemonHP.innerHTML = `${enemyPokemon.name} vinner!`;
    endGame();
  } else if (enemyPokemon.stats.hp <= 0) {
    gameIsOver = true;
    enemyPokemonImg.remove();
    enemyPokemonHP.innerHTML = `${enemyPokemon.name} har besvimt.`;
    yourPokemonHP.innerHTML = `${yourPokemon.name} vinner!`;
    endGame();
  }
}

// Animasjon når pokemonen gjør et move //REF
function moveAnimation(pokemonImg, attackType) {
  // Overgangseffekt for animasjonen
  pokemonImg.style.transition = "transform 0.3s ease";

  // Retningen på rotasjon avhenger av om det er attack eller counter-attack
  if (attackType == "attack") {
    pokemonImg.style.transform = "rotate(20deg)";
  } else if (attackType == "counter-attack") {
    pokemonImg.style.transform = "rotate(-20deg)";
  }

  setTimeout(function () {
    // fjerner stylingen igjen
    pokemonImg.style.transform = "";
  }, 500);
}

// Animasjon viser HP endring
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
  changeTxt.style.transform = "translate(-50%, -50%)";
  changeTxt.style.fontWeight = "bold";
  changeTxt.style.animation = "slide-up 2s forwards";

  pokemonImg.append(changeTxt);

  setTimeout(function () {
    changeTxt.remove();
  }, 3000);
}

// BERRIES -----------------------------------------------

// Vis berry
function showBerry() {
  const randomBerry = chooseRandomItem(berries);

  const berryImg = document.createElement("div");
  berryImg.innerHTML = `<img src="${randomBerry.img}" width="40px;">`;

  berryImg.addEventListener("click", function () {
    berryClicked = true;
    berryBooster(yourPokemon);
    berryImg.remove();
  });

  randomPlacement(berryImg);
  battleGround.append(berryImg);

  //fjern etter 2 sek og motstander får berryBooster
  setTimeout(function () {
    if (!berryClicked) {
      berryImg.remove();
      berryBooster(enemyPokemon);
    } else {
      berryClicked = false;
    }
  }, 2000);
}

// Berry booster
function berryBooster(pokemonToBoost) {
  //generer random berryBoost mellom 1 og 4
  const berryBoost = Math.floor(Math.random() * 4) + 1;

  //sjekker om bruker rakk å klikke eller ikke, og tildeler boost deretter
  if (pokemonToBoost == yourPokemon) {
    yourPokemon.stats.hp += berryBoost;
    hpAnimation("berryBoost", berryBoost, yourPokemonImg);
    showHp();
  } else if (pokemonToBoost == enemyPokemon) {
    enemyPokemon.stats.hp += berryBoost;
    hpAnimation("berryBoost", berryBoost, enemyPokemonImg);
    showHp();
  }
}

// Vis virus
function showVirus() {
  const virus = document.createElement("div");
  virus.innerHTML = `<img src="/2-battle-game/assets/virus.svg" width="30px;">`;
  virus.style.filter = "drop-shadow(5px 5px 5px white)";

  virus.addEventListener("click", function () {
    yourPokemon.stats.hp -= 4;
    hpAnimation("damage", 4, yourPokemonImg);
    showHp();
    virus.remove();
  });

  randomPlacement(virus);
  battleGround.append(virus);

  setTimeout(function () {
    virus.remove();
  }, 2000);
}

// Random plassering av berry / virus
function randomPlacement(item) {
  item.style.position = "absolute";
  const top = randomPercent();
  const left = randomPercent();
  item.style.top = top;
  item.style.left = left;
}

// Generer random prosent for plassering av berry / virus
function randomPercent() {
  // % mellom 10 og 90 (slik at berry ikke vises delvis utenfor vinduet)
  const randomPercent = Math.floor(Math.random() * 81 + 10) + "%";
  return randomPercent;
}

// SPILLET ER OVER -----------------------------------
function endGame() {
  movePanel.innerHTML = "";
  message.innerHTML = "";

  //Tilbake-knapp
  const goBackBtn = document.createElement("button");
  goBackBtn.classList.add("btn");
  goBackBtn.innerHTML = "Tilbake";
  goBackBtn.addEventListener("click", function () {
    location.reload();
  });

  message.append(goBackBtn);
}

// GENERISK FUNKSJON -------------------------------
// Velger random item/object fra array
function chooseRandomItem(array) {
  const randomItem = array[Math.floor(Math.random() * array.length)];
  return randomItem;
}

// PAGE LOAD ----------------------------------------
fetchAndShowPokemons();
fetchBerries();
