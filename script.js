const wsurl = "placeholder";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const boardcanvas = document.createElement("canvas");
const boardctx = boardcanvas.getContext("2d");

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
                let piece_str = game_board[i][j][0] + '_' + game_board[i][j][1] + ".png";
                let piece = new Image();
                piece.src = "Pieces/" + piece_str;
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

const ws = new WebSocket(wsurl);

ws.onopen = function (e) {
    ws.send(JSON.stringify({
        "type": "join",
        "intent": "spectator"
    }));
}

ws.onmessage = function (e) {
    let obj = JSON.parse(e.data);
    if (obj.type == "game_board") {
        game_board = obj.board;
        draw_board();
    }
}
