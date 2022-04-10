const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const boardcanvas = document.createElement("canvas");
const boardctx = boardcanvas.getContext("2d");
const popup_container = document.getElementsByClassName("popup_container")[0];
const popup_text = document.getElementById("popup_text");

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

async function draw_board() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(boardcanvas, 0, 0);

    for (let i = 0; i < game_board.length; i++) {
        for (let j = 0; j < game_board[i].length; j++) {
            if (game_board[i][j][0] != 0 && game_board[i][j][1] != -1) { // Aspect you better not screw me over
                let piece_str = `Pieces/${game_board[i][j][0]}_${game_board[i][j][1]}".png`;
                let piece = new Image();
                piece.src = piece_str;
                await piece.decode(); // Another stupid hacky solution
                ctx.drawImage(
                    piece,
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
    boardctx.fillStyle = "#ffffff";
    for (let y = 0; y < canvas.height; y += (canvas.height / 8)) {
        for (let x = 0; x < canvas.height; x += (canvas.width / 8)) {
            boardctx.fillRect(x, y, canvas.width / 8, canvas.height / 8);
            if (x != canvas.width - (canvas.width / 8)) { // Hacky solution lmao
                if (boardctx.fillStyle == "#000000") {
                    boardctx.fillStyle = "#ffffff";
                } else {
                    boardctx.fillStyle = "#000000";
                }
            }
        }
    }
    draw_board();
}
window.onresize();

function popup(ms, text) {
    popup_text.innerHTML = text;
    popup_container.style.display = "block";
    popup_container.style.animation = "0.5s pop_out";
    setTimeout(function () {
        popup_container.style.animation = "0.5s pop_in";
        popup_container.onanimationend = function () {
            popup_container.style.display = "none";
        }
    }, ms);
}

function connect() {
    popup(1000, "Attempting to connect...");

    let ws;
    try {
        ws = new WebSocket(document.getElementById("wsurl").value);
    } catch (e) {
        popup(3000, "Failed to connect (see console for error)");
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
                popup(5000, `${winner_str} won the game due to ${obj.reason}`);
                break;
            case "game_begin":
                popup(1000, "Let the game begin!");
                break;
        }
    }

    ws.onerror = function (e) {
        popup(3000, "WS ERR (see console for error)");
        console.log(e);
    }
}

connect();
