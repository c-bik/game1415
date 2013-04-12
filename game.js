var BOARD_WIDTH     = 4;
var BOARD_HEIGHT    = 4;
var MAX_COUNT       = 15;
var game            = null;
var MAX_TIME        = 76;

var time;
var moves;
var empty_cell_row = -1;
var empty_cell_clm = -1;

function game_over(timeTxt) {    
    $('<div class="ui-dialog-contain ui-overlay-shadow ui-corner-all game-start">'+
      '    <div data-role="header" class="ui-header ui-bar-d" style="padding-top: 0px; padding-bottom: 0px;"><h1>Game over</h1></div>'+
	  '    <div data-role="content" class="ui-content ui-body-c">'+
	  '    	<p>'+timeTxt+'</p>'+
      '     <a href="#" data-role="button" data-rel="back" class="ui-btn ui-shadow ui-btn-corner-all ui-btn-up-b" onclick="build_game()">'+
      '         <span class="ui-btn-inner"><span class="ui-btn-text">Play Again</span></span>'+
      '     </a>'+
	  '    </div>'+
      '</div>')
        .appendTo(document.body)
        .popup({
            afteropen: function( event, ui ) {
                           $('.game-piece').remove();
                           $('.empty_piece').remove();
                           $('#game-time').parent().css('display', 'none');
                       }
        })
        .popup('open');
}

function build_game()
{
    var width = parseInt($('#borad-width').val());
    if (width !== NaN && width > 0) BOARD_WIDTH = width;

    var height = parseInt($('#borad-height').val());
    if (height !== NaN && height > 0) BOARD_HEIGHT = height;

    var max_count = parseInt($('#borad-max').val());
    if (max_count !== NaN && max_count <= width * height) MAX_COUNT = max_count;

    console.log('board layout '+BOARD_WIDTH+'x'+BOARD_HEIGHT+','+MAX_COUNT);

    game = new Array();
    $('#main-body').html('');

    var count = 0;
    var piece_width = $('#main-body').width() / BOARD_WIDTH - 13;
    var piece_height = $('#main-body').height() / BOARD_HEIGHT - 13;
    console.log('piece layout '+piece_width+'x'+piece_height);
    for(var i=0; i < BOARD_WIDTH; ++i) {
        game[i] = new Array();
        for(var j=0; j < BOARD_HEIGHT; ++j) {
            ++count;
            count = (count <= MAX_COUNT ? count : -1);
            var txt = $('<p>').text(count > 0 ? count : '');
            game[i][j] = {
                val: count,
                txt: txt,
                dom: (count > 0
                     ? $('<div>')
                        .addClass('game-piece')
                        .addClass(count%2 == 0 ? 'game_piece_even' : 'game_piece_odd')
                     : $('<div>')
                        .addClass('empty_piece')
                     )
                     .click(function(e) {
                         var pos = $(this).data('index');
                         moves++;
                         move_pieces(pos)
                     })
                     .append(txt)
                     .css('top', piece_height * i + i*12 + 5)
                     .css('left', piece_width * j + j*12 + 5)
                     .width(piece_width - 4)
                     .height(piece_height - 4)
                     .data('index', {row: i, col: j})
                     .appendTo($('#main-body'))
            };
            if(count < 0) {
                empty_cell_row = i;
                empty_cell_clm = j;
            }
        }
    }
    $('.centerText').each( function( index, item) {
         var parent = $(item).parent();
         var $this = $(item);
         parent.css('position', 'absolute');
         $this.css('position', 'absolute').css('top', Math.round((parent.height() - $this.outerHeight()) / 2) + 'px');
    });
    randomize_board(1000 + Math.floor(Math.random()*11));
}

function randomize_board(rand)
{
    if(rand < 0) {
        time = MAX_TIME;
        moves = 0;
        $('#game-time').parent().css('display', 'inline');
        game_timer();
        return;
    }

    move_pieces({ row : Math.floor(Math.random()*BOARD_HEIGHT)
                , col : Math.floor(Math.random()*BOARD_WIDTH)});

    randomize_board(rand-1);
}

function game_timer()
{
    if(!check_game()) {
        time--;
        if(time < 0) {
            game_over('Oops timeout! Better luck next time...');
            time = 0;
        } else {
            $('#game-time').text('Time '+time+', Moves '+moves);
            if (time % 2 == 0)
                $('.game-timer')
                    .css('background-color', 'rgba(0, 255, 255, 0.7)')
                    .css('color', 'black');
            else
                $('.game-timer')
                    .css('background-color', 'rgba(255, 0, 255, 0.7)')
                    .css('color', 'white');
            setTimeout(game_timer, 1000);
        }
    } else {
        game_over('Congradulations! You finished in '+(MAX_TIME - time)+' seconds with '+moves+' moves');
    }
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
    console.time('move_pieces');

    // horizontal move
    if (empty_cell_row == pos.row) {        
        var gr = game[pos.row];
        if(empty_cell_clm < pos.col)
            for(var i=empty_cell_clm; i < pos.col; ++i) {
                var tmp = gr[i].val;
                gr[i].val = gr[i+1].val;
                gr[i+1].val = tmp;
            }
        else if(empty_cell_clm > pos.col)
            for(var i=empty_cell_clm; i > pos.col; --i) {
                var tmp = gr[i].val;
                gr[i].val = gr[i-1].val;
                gr[i-1].val = tmp;
            }
        if (empty_cell_clm != pos.col) {
            console.log('horizontal '+empty_cell_clm+'->'+pos.col);
            render();
        }
    }

    // vertical move
    if (empty_cell_clm == pos.col) {
        if(empty_cell_row < pos.row)
            for(var i=empty_cell_row; i < pos.row; ++i) {
                var tmp = game[i][pos.col].val;
                game[i][pos.col].val = game[i+1][pos.col].val;
                game[i+1][pos.col].val = tmp;
            }
        else if(empty_cell_row > pos.row)
            for(var i=empty_cell_row; i > pos.row; --i) {
                var tmp = game[i][pos.col].val;
                game[i][pos.col].val = game[i-1][pos.col].val;
                game[i-1][pos.col].val = tmp;
            }
        if (empty_cell_row != pos.row) {
            console.log('vertical '+empty_cell_row+'->'+pos.row);
            render();
        }
    }

    console.timeEnd('move_pieces');
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

function render()
{
    var grs = null;
    var gc = null;
    var gcd = null;

    console.time('render');

    for(var i=0; i < game.length; ++i) {
        grs = game[i];
        for(var j=0; j < game[i].length; ++j) {
            gc = grs[j];
            gcd = gc.dom;
            gc.txt.text(gc.val > 0 ? gc.val : '');
            if(gc.val < 0) {
                gcd.removeClass('game_piece_odd')
                   .removeClass('game_piece_even')
                   .addClass('empty_piece');
                empty_cell_row = i;
                empty_cell_clm = j;
            }
            else {
                gcd.removeClass('empty_piece')
                   .addClass('game-piece');
                if(gc.val % 2 == 0) {
                    gcd.removeClass('game_piece_odd')
                       .addClass('game_piece_even');
                } else {
                    gcd.removeClass('game_piece_even')
                       .addClass('game_piece_odd');
                }
            }
        }
    }
    console.timeEnd('render');
}
