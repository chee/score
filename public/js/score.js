(function machine ( jQuery ) {
	"use strict";

	var chart = jQuery( ".scores" );
	var oldScore = jQuery( ".old-score" );
	
	String.prototype.lpad = function( padWith, length ) {
		var string = this;
		while ( string.length < length ) {
			string = padWith + string;
		}
		return string;
	};

	var updateScores = function () {
		jQuery.get( "/get", {}, processScores, "json" );
		setTimeout( updateScores, 5000 );
	};
	updateScores();
	
	var sorter = function sorter ( a, b ) {
		return b - a;
	};

	function processScores ( data ) {
		chart.empty();

		// omg FUTURE
		Object.keys( data ).sort( sorter ).forEach(function ( points, i ) {
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

	var cleanScores = function () {
		var scores = jQuery( ".score" );
		var names = jQuery( ".name" );

		scores.each(function() {
			var element = jQuery( this );
			var score = element.text();
			var padded = score.lpad( 0, 6 );
	
			if ( score > 999999 ) {
				score = 999999;
			}
	
			element.text( padded );
		});
		
		oldScore.text( scores.eq( 0 ).text() );
	
		names.each(function() {
			var element = jQuery( this );
			var score = element.text();
			var padded = score.lpad( " ", 10 );
			element.text( padded );
		});
	};

	var articles = jQuery( "article" );
	var winning = articles.eq( 1 );
	var buttons = articles.find( "button" );
	var play = buttons.filter( ".play" );
	var win = buttons.filter( ".win" );
	var player = winning.find( ".player" );
	var max = 10;
	var min = 1;

	play.focus();

	player.keypress(function ( event ) {
		var playerName = player.val();
		if ( event.which === 13 ) {
			return;
		}
		if ( playerName.length > ( max -1 ) ) {
			playerName = playerName.substring( 0, (max -1) );
			player.val( playerName );
		}
	});

	player.keyup(function ( event ) {
		if ( event.which === 13 ) {
			win.trigger( "click" );
		}
	});

	play.click(function () {
		articles.toggle();
		player.focus();
	});

	win.click(function () {
		var playerName = player.val();

		if ( playerName.length > max ) {
			player.val( "" );
			player.attr( "placeholder", "TOO LONG" );
			return;
		} else if ( playerName.length < min ) {
			player.val( "" );
			return;
		} else {
			playerName = playerName.trim().replace( /\s+/g, " " );
			
			jQuery.post( "/put", { player: playerName }, postSuccess );
		}
	});

	function postSuccess() {
		updateScores();
		articles.toggle();
		play.focus();
		player.attr( "placeholder", "INSERT NAME" ).val( "" );
	}
		
})( window.jQuery, undefined );
