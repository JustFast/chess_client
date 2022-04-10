const white = "#8ab7ff";
const black = "#4a90ff";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const boardcanvas = document.createElement("canvas");
const boardctx = boardcanvas.getContext("2d");
const popup_container = document.getElementsByClassName("popup_container")[0];
const popup_text = document.getElementById("popup_text");
const wsurl = document.getElementById("wsurl");

// Remember to close websocket

let game_board = [
    [[0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1]],
    [[0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1]],
    [[0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1]],
    [[0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1]],
    [[0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1]],
    [[0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1]],
    [[0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1]],
    [[0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1], [0, -1]]
];

let images = [[],[]];

async function draw_board() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(boardcanvas, 0, 0);

    for (let i = 0; i < game_board.length; i++) {
        for (let j = 0; j < game_board[i].length; j++) {
            if (game_board[i][j][0] != 0 && game_board[i][j][1] != -1) { // Aspect you better not screw me over
                console.log(images[game_board[i][j][1]][game_board[i][j][0]]);
                ctx.drawImage(
                    images[game_board[i][j][1]][game_board[i][j][0]],
                    (canvas.width / 8) * j,
                    (canvas.height / 8) * i,
                    (canvas.width / 8),
                    (canvas.height / 8)
                );
            }
        }
    }
}

window.onresize = function () {
    if (window.innerWidth <= window.innerHeight) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerWidth;
    } else {
        canvas.width = window.innerHeight;
        canvas.height = window.innerHeight;
    }

    // Generate board canvas
    boardcanvas.width = canvas.width;
    boardcanvas.height = canvas.height;

    // Listen im lazy, don't judge me
    boardctx.fillStyle = white;
    for (let y = 0; y < canvas.height; y += (canvas.height / 8)) {
        for (let x = 0; x < canvas.height; x += (canvas.width / 8)) {
            boardctx.fillRect(x, y, canvas.width / 8, canvas.height / 8);
            if (x != canvas.width - (canvas.width / 8)) { // Hacky solution lmao
                if (boardctx.fillStyle == black) {
                    boardctx.fillStyle = white;
                } else {
                    boardctx.fillStyle = black;
                }
            }
        }
    }
    draw_board();
}

function popup(seconds, text) {
    popup_text.innerHTML = text;
    popup_container.style.display = "block";
    popup_container.style.animation = `${seconds}s popup`;
}

popup_container.onanimationend = function () {
    this.style.display = (this.style.display == "none") ? "block" : "none";
}

wsurl.onkeydown = function (e) {
    if (e.key == "Enter") { // Shhhh...
        connect();
    }
}

function connect() {
    popup(1, "Attempting to connect...");

    let ws;
    try {
        ws = new WebSocket(wsurl.value);
    } catch (e) {
        popup(3, "Failed to connect (see console for error)");
        console.log(e);
        return;
    }

    ws.onopen = function (e) {
        ws.send(JSON.stringify({
            "type": "join",
            "intent": "spectator"
        }));
    }

    ws.onmessage = function (e) {
        let obj = JSON.parse(e.data);
        switch (obj.type) {
            case "game_board":
                game_board = obj.board;
                draw_board();
                break;
            case "game_end":
                let winner_str = (obj.winner == 0) ? "black" : "white";
                popup(5, `${winner_str} won the game due to ${obj.reason}`);
                break;
            case "game_begin":
                popup(1, "Let the game begin!");
                break;
        }
    }

    ws.onerror = function (e) {
        popup(3, "WS ERR (see console for error)");
        console.log(e);
    }
}

(async function () {
    for (let i = 1; i < 7; i++) {
        images[0][i] = new Image();
        images[1][i] = new Image();
        images[0][i].src = `Pieces/${i}_0.png`;
        images[1][i].src = `Pieces/${i}_1.png`;
        await images[0][i].decode();
        await images[1][i].decode();
    }
    window.onresize();
    connect();
})();

