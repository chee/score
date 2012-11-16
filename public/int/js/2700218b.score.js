// Avoid `console` errors in browsers that lack a console.
if (!(window.console && console.log)) {
    (function() {
        var noop = function() {};
        var methods = ['assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error', 'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log', 'markTimeline', 'profile', 'profileEnd', 'markTimeline', 'table', 'time', 'timeEnd', 'timeStamp', 'trace', 'warn'];
        var length = methods.length;
        var console = window.console = {};
        while (length--) {
            console[methods[length]] = noop;
        }
    }());
}

// Place any jQuery/helper plugins in here.

String.prototype.lpad = function( padWith, length ) {
	var string = this;
	while ( string.length < length ) {
		string = padWith + string;
	}
	return string;
};

(function machine() {
	var chart = jQuery( ".scores" );
	
	var updateScores = function() {
		jQuery.get( "/get", {}, processScores, "json" );
	};
	updateScores();
	
	var sorter = function sorter( a, b ) {
		return b - a;
	}

	function processScores( data ) {
		chart.empty();
		console.log( data );	
		// omg FUTURE
		Object.keys( data ).sort( sorter ).forEach(function( points, i ) {
			if ( i > 8 ) { return; }
			var name = data[ points ];
			var li = jQuery( "<li>" );
			
			var nameSpan = jQuery( "<span>" ).addClass( "name" ).text( name );
			var scoreSpan = jQuery( "<span>" ).addClass( "score" ).text( points );

			li.append( nameSpan ).append( " " ).append( scoreSpan );

			chart.append( li );
		});
		cleanScores();
	}

	var cleanScores = function() {
		var scores = jQuery( ".score" );
		var names = jQuery( ".name" );

		scores.each(function() {
			var element = jQuery( this );
			var score = element.text();
			var padded = score.lpad( 0, 6 );
	
			if ( score > 999999 ) { score = 999999 }
	
			element.text( padded );
		});
	
		names.each(function() {
			var element = jQuery( this );
			var score = element.text();
			var padded = score.lpad( " ", 3 );
			element.text( padded );
		});
	}

	var articles = jQuery( "article" );
	var scoreboard = articles.eq( 0 );
	var winning = articles.eq( 1 );
	var buttons = articles.find( "button" );
	var play = buttons.filter( ".play" );
	var win = buttons.filter( ".win" );
	var player = winning.find( ".player" );

	play.click(function() {
		articles.toggle();
	});

	win.click(function() {
		var max = 3;
		var min = 1;
		var playerName = player.val();

		if ( playerName.length > max ) {
			player.val( "" );
			player.attr( "placeholder", "TOO LONG")
			return;
		} else if ( playerName.length < min ) {
			player.val( "" );
			player.attr( "placeholder", "NOT LONG" );
			return;
		} else {
			jQuery.post( "/put", { player: playerName }, postSuccess )
			  .fail(function(){
			  	console.error( "damn", arguments )
			  });
		}
	});

	function postSuccess( response ) {
		updateScores();
		articles.toggle();
		player.attr( "placeholder", "INSERT NAME" ).val( "" );
	}
		
})();
