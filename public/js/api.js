let playArea = document.getElementById("playArea");

// desenha o grid de "spots"
function drawGrid(params) {
    for (let index = 0; index < spots; index++) {
        let div = document.createElement("div");
        div.classList.add("spot");
        div.dataset.id = index + 1;
        playArea.appendChild(div);
    }
}
function eraseGrid() {
    playArea.innerHTML = "";
}

// funções pikachu
function addPikachu(spot) {
    Array.from(playArea.children)[spot].classList.add("pikachu");
    return;
}
function removePikachu(spot) {
    Array.from(playArea.children)[spot].classList.remove("pikachu");
    return;
}
function movePikachu(direction) {
    removePikachu(pikachuCurrentPosition);
    pikachuCurrentPosition += direction;
    addPikachu(pikachuCurrentPosition);
    colisionTest(); // testa colisão no movimento do pikachu tbm
    return;
}

// movimento do pikachu
document.addEventListener("keydown", (evt) => {
    let key = evt.keyCode; // tecla pressionada
    let direction;
    if (left.includes(key) && pikachuCurrentPosition > width * (width - 2)) {
        direction = -1;
    } else if (right.includes(key) && pikachuCurrentPosition < width * (width - 1) - 1) {
        direction = 1;
    } else {
        return;
    }
    movePikachu(direction);
});

// funções do spearow
function addSpearow(spotList) {
    for (let index = 0; index < spots; index++) {
        if (spotList.includes(index)) {
            Array.from(playArea.children)[index].classList.add("spearow");
        }
    }
    return;
}
function removeSpearow(spotList) {
    for (let index = 0; index < Array.from(playArea.children).length; index++) {
        if (spotList.includes(index)) {
            Array.from(playArea.children)[index].classList.remove("spearow");
        }
    }
    return;
}

// movimento dos spearows
function sidesCheckAndIncrement() {
    if (goingRight) {
        for (let index = 0; index < spearows.length; index++) {
            spearows[index]++;
        }
        for (let index = 0; index < deadSpearows.length; index++) {
            deadSpearows[index]++;
        }
    }
    if ((rightSides.includes(spearows[spearows.length - 1]) || rightSides.includes(spearows[width - 6])) && goingRight) {
        goingRight = false;
        stopped = true;
        return;
    }
    if (leftSides.includes(spearows[0])) {
        goingRight = true;
        stopped = true;
    }
    if (!stopped && !goingRight) {
        for (let index = 0; index < spearows.length; index++) {
            spearows[index]--;
        }
        for (let index = 0; index < deadSpearows.length; index++) {
            deadSpearows[index]--;
        }
    }
    if (stopped) {
        for (let index = 0; index < spearows.length; index++) {
            spearows[index] += width;
        }
        for (let index = 0; index < deadSpearows.length; index++) {
            deadSpearows[index] += width;
        }
        stopped = false;
    }
}
function moveSpearows() {
    addPikachu(pikachuCurrentPosition);

    removeSpearow(spearows);

    sidesCheckAndIncrement(); // testa se chegou nos lados e trata o resultado

    winCheck(); // testa se acertou todos os spearows

    colisionTest(); // testa se o shot acertou o spearow

    addSpearow(spearows);

    removeSpearow(deadSpearows);
}
function colisionTest() {
    for (const spearow of spearows) {
        if (spearow == pikachuCurrentPosition && !deadSpearows.includes(spearow)) {
            clearInterval(moveEnemies);
            Swal.fire({
                title: "Oh não!",
                html: `Você não conseguiu salvar o Ash!`,
                imageUrl: "https://thumbs.gfycat.com/ThoseRemarkableAplomadofalcon-size_restricted.gif",
                imageWidth: 450,
                imageAlt: "Oh não!",
                showDenyButton: true,
                confirmButtonText: "Tentar novamente",
                denyButtonText: "Voltar ao menu",
            }).then((result) => {
                if (result.isConfirmed) {
                    goToIndex();
                    startGame();
                    // colocar leaderboard?
                } else if (result.isDenied || result.isDismissed) {
                    goToIndex();
                }
            });

            break;
        }
        if (spearow > width * height - width && !deadSpearows.includes(spearow)) {
            clearInterval(moveEnemies);
            Swal.fire({
                title: "Oh não!",
                // text: `Você completou em ${document.getElementById("counter").dataset.count} jogadas.`,
                html: `Você não conseguiu salvar o Ash!`,
                imageUrl: "https://thumbs.gfycat.com/ThoseRemarkableAplomadofalcon-size_restricted.gif",
                imageWidth: 450,
                imageAlt: "Oh não!",
                showDenyButton: true,
                confirmButtonText: "Tentar novamente",
                denyButtonText: "Voltar ao menu",
            }).then((result) => {
                if (result.isConfirmed) {
                    goToIndex();
                    startGame();
                    // colocar leaderboard?
                } else if (result.isDenied || result.isDismissed) {
                    goToIndex();
                }
            });
            break;
        }
    }
}

// ataque do pikachu
document.addEventListener("keydown", (evt) => {
    let key = evt.keyCode; // tecla pressionada
    if (up.includes(key)) {
        shot();
    } else {
        return;
    }
});

function shot() {
    let shotId;
    console.log("tiro indo");
    let shotSpot = pikachuCurrentPosition;

    function shotTravel() {
        Array.from(playArea.children)[shotSpot].classList.remove("shot");
        shotSpot = shotSpot - width;
        Array.from(playArea.children)[shotSpot].classList.add("shot");
        if (shotSpot < width) {
            clearInterval(shotId);
            setTimeout(() => Array.from(playArea.children)[shotSpot].classList.remove("shot"), 100);
        }
        if (Array.from(playArea.children)[shotSpot].classList.contains("spearow")) {
            // alert("acerto mizeravel");
            Array.from(playArea.children)[shotSpot].classList.remove("shot");
            Array.from(playArea.children)[shotSpot].classList.remove("spearow");
            Array.from(playArea.children)[shotSpot].classList.add("hit");
            setTimeout(() => Array.from(playArea.children)[shotSpot].classList.remove("hit"), 100);
            clearInterval(shotId);
            deadSpearows.push(shotSpot);
            // spearows.pop(shotSpot);
        }
    }

    shotId = setInterval(shotTravel, 100);
}

function winCheck() {
    if (spearows.length == deadSpearows.length) {
        clearInterval(moveEnemies);
        Swal.fire({
            title: "Parabéns!",
            // text: `Você completou em ${document.getElementById("counter").dataset.count} jogadas.`,
            html: `Você salvou o Ash!`,
            imageUrl: "https://i.makeagif.com/media/9-19-2015/nqVlmA.gif",
            imageWidth: 450,
            imageAlt: "Parabéns!",
            confirmButtonText: "Jogar novamente",
            showDenyButton: true,
            denyButtonText: "Voltar ao menu",
        }).then((result) => {
            if (result.isConfirmed) {
                goToIndex();
                startGame();
                // colocar leaderboard?
            } else if (result.isDenied || result.isDismissed) {
                goToIndex();
            }
        });
    }
}

let width = 15; // largura do grid
let height = 15; // altura do grid
let spots = width * height; // quantidade de "lugares" no grid
let pikachuCurrentPosition = width * height - 2 * width + Math.floor(width / 2); // posição do pikachu

let spearows = [
    // ultima linha
    // segunda linha
    // primeira linha
];

// gerador de spearows
function spearowsPositionMaker(width, height) {
    for (let index = 0; index < Math.floor(height / 3); index++) {
        for (let index2 = 0; index2 < Math.floor((width / 3) * 2); index2++) {
            spearows.push(index2 + width * index);
        }
    }
}

// variaveis de movimentação do pikachu
let left = [37, 65]; // 37 || 65 = seta esquerda + 'a'
let right = [39, 68]; // 39 || 68 = seta direita + 'd'

// variaveis de ataque do pikachu
let up = [38, 87, 32]; // 38 || 87 || 32 = seta cima + 'w' + 'space'

// variaveis de movimentação do spearow
let leftSides = [0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180, 195, 210];
let rightSides = [14, 29, 44, 59, 74, 89, 104, 119, 134, 149, 164, 179, 194, 209, 224];
let goingRight = true;
let stopped = false;

let deadSpearows = [];

let moveEnemies;

function startGame() {
    eraseGrid();
    document.getElementById("buttons").style.display = "none"; // esconde os botões
    document.getElementById("settings").style.display = "none"; // esconde as settings
    document.getElementById("playArea").style.display = "flex"; // mostra a playArea

    drawGrid();
    addPikachu(pikachuCurrentPosition);
    spearowsPositionMaker(width, height);
    addSpearow(spearows);
    moveEnemies = setInterval(moveSpearows, 500);
}

function goToSettings() {
    document.getElementById("buttons").style.display = "none"; // esconde os botões
    document.getElementById("playArea").style.display = "none"; // esconde a playArea
    document.getElementById("settings").style.display = "flex"; // mostra as settings
}

function goToIndex() {
    document.getElementById("buttons").style.display = "flex"; // esconde os botões
    document.getElementById("playArea").style.display = "none"; // esconde a playArea
    document.getElementById("settings").style.display = "none"; // mostra as settings
    eraseGrid();
    spearows = [];
    deadSpearows = [];
    pikachuCurrentPosition = width * height - 2 * width + Math.floor(width / 2);
    goingRight = true;
    stopped = false;
    if (moveEnemies) clearInterval(moveEnemies);
}
