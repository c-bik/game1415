var BOARD_WIDTH     = 4;
var BOARD_HEIGHT    = 4;
var MAX_COUNT       = 15;
var game            = null;

function build_game()
{
    var width = parseInt($('#borad-width').val());
    if (width !== NaN && width > 0) BOARD_WIDTH = width;
    else return;

    var height = parseInt($('#borad-height').val());
    if (height !== NaN && height > 0) BOARD_HEIGHT = height;
    else return;

    var max_count = parseInt($('#borad-max').val());
    if (max_count !== NaN && max_count <= width * height) MAX_COUNT = max_count;
    else return;

    console.log('board layout '+BOARD_WIDTH+'x'+BOARD_HEIGHT+','+MAX_COUNT);

    game = new Array();
    $('#main-body').html('');

    var count = 0;
    var piece_width = $('#main-body').width() / BOARD_WIDTH - 1;
    var piece_height = $('#main-body').height() / BOARD_HEIGHT - 1;
    console.log('piece layout '+piece_width+'x'+piece_height);
    for(var i=0; i < BOARD_WIDTH; ++i) {
        game[i] = new Array();
        for(var j=0; j < BOARD_HEIGHT; ++j) {
            ++count;
            count = (count <= MAX_COUNT ? count : -1);
            game[i][j] = {
                val: count,
                dom: (count > 0
                     ? $('<div>')
                        .addClass('game-piece')
                        .addClass(count%2 == 0 ? 'game_piece_even' : 'game_piece_odd')
                        .text(count)
                     : $('<div>')
                        .addClass('empty_piece')
                     )
                     .click(function(e) {
                         var pos = $(this).data('index');
                         move_pieces(pos);
                     })
                     .css('top', piece_height * i + i*1 + 1)
                     .css('left', piece_width * j + j*1 + 1)
                     .width(piece_width - 2)
                     .height(piece_height - 2)
                     .data('index', {row: i, col: j})
                     .appendTo($('#main-body'))
            };
        }
    }
    randomize_board(100 + Math.floor(Math.random()*11));
}

var time = 0;
function randomize_board(rand)
{
    if(rand < 0) {
        time = 0;
        game_timer();
        return;
    }

    move_pieces({ row : Math.floor(Math.random()*BOARD_HEIGHT)
                , col : Math.floor(Math.random()*BOARD_WIDTH)});
    setTimeout(function() {
        randomize_board(rand-1);
    }, 50);
}

function game_timer()
{
    if(!check_game()) {
        time++;
        $('#game-time').text(time);
    }

    setTimeout(game_timer, 1000);
}

function check_game()
{
    var count = 0;
    for(var i=0; i < BOARD_WIDTH; ++i)
        for(var j=0; j < BOARD_HEIGHT; ++j) {
            ++count;
            count = (count <= MAX_COUNT ? count : -1);
            if(game[i][j].val != count)
                return false;
        }
    return true;
}

function move_pieces(pos)
{
    var moveToVirt = -1;
    var moveToHorz = -1;
    for(var i=0; i < game[pos.row].length; ++i)
        if(game[pos.row][i].val < 0) {
                moveToVirt = i;
                break;
        }
    for(var i=0; i < BOARD_HEIGHT; ++i)
        if(game[i][pos.col].val < 0) {
                moveToHorz = i;
                break;
        }
    
    if(moveToVirt > 0 && moveToHorz > 0)
        return;

    print_game();

    // virtical move
    if (moveToVirt >= 0) {
        if(moveToVirt < pos.col)
            for(var i=moveToVirt; i < pos.col; ++i) {
                var tmp = game[pos.row][i].val;
                game[pos.row][i].val = game[pos.row][i+1].val;
                game[pos.row][i+1].val = tmp;
            }
        else
            for(var i=moveToVirt; i > pos.col; --i) {
                var tmp = game[pos.row][i].val;
                game[pos.row][i].val = game[pos.row][i-1].val;
                game[pos.row][i-1].val = tmp;
            }
    }

    // horizontal move
    if (moveToHorz >= 0) {
        if(moveToHorz < pos.row)
            for(var i=moveToHorz; i < pos.row; ++i) {
                var tmp = game[i][pos.col].val;
                game[i][pos.col].val = game[i+1][pos.col].val;
                game[i+1][pos.col].val = tmp;
            }
        else
            for(var i=moveToHorz; i > pos.row; --i) {
                var tmp = game[i][pos.col].val;
                game[i][pos.col].val = game[i-1][pos.col].val;
                game[i-1][pos.col].val = tmp;
            }
    }

    print_game();
    render();
}

function print_game() {
    var row = '';
    for(var i=0; i < game.length; ++i) {
        row = '';
        for(var j=0; j < game[i].length; ++j) {
            row += game[i][j].val + ' ';
        }
        console.log(row);
    }
}

function render() {
    for(var i=0; i < game.length; ++i) {
        for(var j=0; j < game[i].length; ++j) {
            game[i][j].dom.text(game[i][j].val > 0 ? game[i][j].val : '');
            if(game[i][j].val < 0)
                game[i][j].dom
                    .removeClass('game-piece')
                    .addClass('empty_piece');
            else {
                game[i][j].dom
                    .removeClass('empty_piece')
                    .addClass('game-piece');
                if(game[i][j].val % 2 == 0)
                    game[i][j].dom
                        .removeClass('game_piece_odd')
                        .addClass('game_piece_even');
                else
                    game[i][j].dom
                        .removeClass('game_piece_even')
                        .addClass('game_piece_odd');
            }
        }
    }
}

function adjust_pieces() {
    var piece_width = $('#main-body').width() / BOARD_WIDTH - 1;
    var piece_height = $('#main-body').height() / BOARD_HEIGHT - 1;
    for(var i=0; i < game.length; ++i) {
        for(var j=0; j < game[i].length; ++j) {
            game[i][j].dom
                .css('top', piece_height * i + i*1 + 1)
                .css('left', piece_width * j + j*1 + 1)
                .width(piece_width - 2)
                .height(piece_height - 2);
        }
    }
}
