(function ($) {
    $(document).ready(function () {

        var difficulty = {
            easy: {
                rows: 8,
                cols: 8,
                width: 36,
                height: 36,
                mines: 10
            },
            medium: {
                rows: 16,
                cols: 16,
                width: 36,
                height: 36,
                mines: 40
            },
            hard: {
                rows: 22,
                cols: 22,
                width: 36,
                height: 36,
                mines: 99
            }
        }


        var mX;
        var mY;
        var clickedX;
        var clickedY;

        var bombs = [];
        var clickedBoxes = [];

        var rightClickedX;
        var rightClickedY;
        var rightClickedBoxes = [];

        var totalClicked;

        var board = $("#board");

        var gameLevel = difficulty.easy;
        var flaggedMines = gameLevel.mines;

        var firstClick = false;
        var start = true;

        setBoard(board);
        init();


        $("#easy").on("click", function () {
            gameLevel = difficulty.easy;
            setBoard(board);
        });

        $("#medium").on("click", function () {
            gameLevel = difficulty.medium;
            setBoard(board);
        });

        $("#hard").on("click", function () {
            gameLevel = difficulty.hard;
            setBoard(board);
        });

        function setBoard(board) {
            board.html("");
            board.css("height", gameLevel.rows * gameLevel.width + "px");
            board.css("width", gameLevel.rows * gameLevel.width + "px");
            $("#controls").css("width", gameLevel.rows * gameLevel.width + "px");
            $(".container").css("width", gameLevel.rows * gameLevel.width + "px");
            for (var i = 0; i < gameLevel.rows; i++) {
                for (var n = 0; n < gameLevel.cols; n++) {
                    board.append(`<div class="square" id="${i}-${n}"></div>`)
                }
                board.append(`<br>`)
            }
            $("#mines").text(`Mines: ${gameLevel.mines}`);
        }


        $("#board").on("click", clickHandler);

        function clickHandler(event) {

            if (firstClick === false) {
                timer();
                firstClick = true;
            }

            mX = $(event.target).position().left;
            mY = $(event.target).position().top;

            clickedX = Math.floor(mX / gameLevel.width);
            clickedY = Math.floor(mY / gameLevel.height);

            var clickedBomb = false;

            for (var i = 0; i < gameLevel.mines; i++) {
                if (clickedX == bombs[i][0] && clickedY == bombs[i][1]) {
                    clickedBomb = true;
                    lose();
                }
            }

            if (clickedBomb === false) {
                openClickedBoxes(clickedX, clickedY);
                checkIfUserWon();
            }
        }

        function checkIfUserWon() {
            totalClicked = rightClickedBoxes.length + clickedBoxes.length;
            if (totalClicked == gameLevel.rows * gameLevel.cols) {
                win();
            }
        }

        $("#board").contextmenu(function (e) {
            e.preventDefault();

            if (firstClick === false) {
                timer();
                firstClick = true;
            }

            mX = $(e.target).position().left;
            mY = $(e.target).position().top;

            rightClickedX = Math.floor(mX / gameLevel.width);
            rightClickedY = Math.floor(mY / gameLevel.height);

            var isInRightClickedBoxes = [false, 0];

            for (var i in rightClickedBoxes) {
                if (rightClickedBoxes[i][0] == rightClickedX && rightClickedBoxes[i][1] == rightClickedY) {
                    isInRightClickedBoxes = [true, i];
                }
            }

            if (isInRightClickedBoxes[0] == false) {
                if (rightClickedBoxes.length < gameLevel.mines) {

                    var n = rightClickedBoxes.length;
                    rightClickedBoxes[n] = [];
                    rightClickedBoxes[n][0] = rightClickedX;
                    rightClickedBoxes[n][1] = rightClickedY;
                    $("#mines").text(`Mines: ${flaggedMines - 1}`);
                    flaggedMines--;
                    checkIfUserWon();
                }
            } else {
                rightClickedBoxes.splice(isInRightClickedBoxes[1], 1);
                $("#mines").text(`Mines: ${flaggedMines + 1}`);
                flaggedMines++;
            }

            drawBoard();
        });

        function init() {
            var i = 0;

            var bomb0 = [
                Math.floor(Math.random() * gameLevel.cols),
                Math.floor(Math.random() * gameLevel.rows)
            ];

            bombs.push(bomb0);

            do {
                var bomb = [
                    Math.floor(Math.random() * gameLevel.cols),
                    Math.floor(Math.random() * gameLevel.rows)
                ];

                if (!isItemInArray(bombs, bomb)) {
                    bombs.push(bomb);
                    i++;
                }
            } while (i < gameLevel.mines - 1)
            drawBoard();
        }

        function isItemInArray(array, item) {
            for (var i = 0; i < array.length; i++) {
                if (array[i][0] == item[0] && array[i][1] == item[1]) {
                    return true;
                }
            }
            return false;
        }


        function openClickedBoxes(coordinateX, coordinateY) {
            var neighborBoxes = [
                [-1, -1],
                [0, -1],
                [1, -1],
                [1, 0],
                [1, 1],
                [0, 1],
                [-1, 1],
                [-1, 0]
            ];

            var numOfBombsSurrounding = 0;

            for (var i in neighborBoxes) {
                for (var n = 0; n < gameLevel.mines; n++) {
                    if (checkForBomb(n, coordinateX + neighborBoxes[i][0], coordinateY + neighborBoxes[i][1]) == true) {
                        numOfBombsSurrounding++;
                    }
                }
            }

            for (var k in rightClickedBoxes) {
                if (rightClickedBoxes[k][0] == coordinateX && rightClickedBoxes[k][1] == coordinateY) {
                    rightClickedBoxes.splice(k, 1);
                }
            }

            var clicked = false;

            for (var k in clickedBoxes) {
                if (clickedBoxes[k][0] == coordinateX && clickedBoxes[k][1] == coordinateY) {
                    clicked = true;
                }
            }

            if (clicked === false) {
                clickedBoxes[(clickedBoxes.length)] = [coordinateX, coordinateY, numOfBombsSurrounding];
            }

            if (numOfBombsSurrounding == 0) {
                for (var i in neighborBoxes) {
                    if (coordinateX + neighborBoxes[i][0] >= 0 && coordinateX + neighborBoxes[i][0] <= (gameLevel.rows - 1) &&
                        coordinateY + neighborBoxes[i][1] >= 0 && coordinateY + neighborBoxes[i][1] <= (gameLevel.cols - 1)) {
                        var x1 = coordinateX + neighborBoxes[i][0];
                        var y1 = coordinateY + neighborBoxes[i][1];

                        var alreadyClicked = false;
                        for (var n in clickedBoxes) {
                            if (clickedBoxes[n][0] == x1 && clickedBoxes[n][1] == y1) {
                                alreadyClicked = true;
                            }
                        }

                        if (alreadyClicked == false) {
                            openClickedBoxes(x1, y1);
                        }
                    }
                }
            }
            drawBoard();
        }

        function checkForBomb(i, x, y) {
            if (bombs[i][0] == x && bombs[i][1] == y) {
                return true;
            } else {
                return false;
            }
        }

        function lose() {
            start = false;
            for (var i in bombs) {
                $("#" + bombs[i][1] + "-" + bombs[i][0]).addClass("bomb");
            }
            $("#board").unbind("click");
            $("#winOrLose").text('\u2620');
        }

        function win() {
            start = false;
            for (var i in bombs) {
                $("#" + bombs[i][1] + "-" + bombs[i][0]).addClass("bomb");
            }
            $("#winOrLose").text('\u263B');
        }

        $(".newGame").on("click", function newGame() {
            start = true;
            $("#timer").text("00:00");
            if (firstClick) {
                firstClick = false;
                $("#board").bind("click", clickHandler);
            }
            bombs = [];
            clickedBoxes = [];
            rightClickedBoxes = [];
            totalClicked = 0;
            init();
            emptyBoard();
            $("#winOrLose").text("");
            flaggedMines = gameLevel.mines;
        });

        function timer() {
            var gameTimer = $("#timer");

            function update() {
                var myTime = gameTimer.html();
                var ss = myTime.split(":");
                var dt = new Date();
                dt.setHours(0);
                dt.setMinutes(ss[0]);
                dt.setSeconds(ss[1]);

                var dt2 = new Date(dt.valueOf() + 100);
                var temp = dt2.toTimeString().split(" ");
                var ts = temp[0].split(":");

                gameTimer.html(ts[1] + ":" + ts[2]);
                if (start) {
                    setTimeout(update, 100);
                }
            }

            if (start) {
                setTimeout(update, 100);
            }
        }

        function drawBoard() {
            for (var i = 0; i < gameLevel.rows; i++) {
                for (var n = 0; n < gameLevel.cols; n++) {

                    var beenClicked = [0, false];

                    if (clickedBoxes.length > 0) {
                        for (var k = 0; k < clickedBoxes.length; k++) {
                            if (clickedBoxes[k][0] == n && clickedBoxes[k][1] == i) {
                                beenClicked = [k, true];
                            }
                        }
                    }

                    if (beenClicked[1] === true) {
                        $("#" + i + "-" + n).removeClass("flagged");
                        $("#" + i + "-" + n).text("");
                        $("#" + i + "-" + n).addClass("exposed");
                    } else {
                        var rBeenClicked = [0, false];

                        if (rightClickedBoxes.length > 0) {
                            for (var k = 0; k < rightClickedBoxes.length; k++) {
                                if (rightClickedBoxes[k][0] == n && rightClickedBoxes[k][1] == i) {
                                    rBeenClicked = [k, true];
                                }
                            }
                        }

                        if (rBeenClicked[1] === true) {
                            $("#" + i + "-" + n).addClass("flagged");
                            $("#" + i + "-" + n).text('\u2691');
                        } else {
                            $("#" + i + "-" + n).removeClass("flagged");
                            $("#" + i + "-" + n).text("");
                        }
                    }
                }
            }

            for (var i in clickedBoxes) {
                if (clickedBoxes[i][2] > 0) {
                    $(`#${clickedBoxes[i][1]}-${clickedBoxes[i][0]}`).text(clickedBoxes[i][2]);
                }
            }
        }

        function emptyBoard() {
            for (var i = 0; i < gameLevel.rows; i++) {
                for (var n = 0; n < gameLevel.cols; n++) {

                    $("#" + i + "-" + n).removeClass("exposed");
                    $("#" + i + "-" + n).removeClass("flagged");
                    $("#" + i + "-" + n).removeClass("bomb");
                    $("#" + i + "-" + n).text("");
                }
            }
        }
    });
})(jQuery);