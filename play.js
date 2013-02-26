/*global require:false*/
(function( express, _, fs, q ) {
'use strict';

var game = express();

game.set( 'title', 'Scores' );
game.set( 'scores file', 'scores' );
game.use( express.bodyParser() );
game.use( express.static( __dirname + '/public' ) );

game.get( '/', function ( request, response ) {
	response.redirect( '/index.html' );
});

game.get( '/longget', function ( request, response ) {
	var scoresFile = readScores();

	response.header( 'Content-Type', 'text/event-stream' );
	response.header( 'Cache-Control', 'no-cache' );
	response.header( 'Connection', 'keep-alive' );

	function writeData ( text ) {
		response.write( 'id: ' + new Date().getTime() + '\n' );
		response.write( 'event: data\n' );
		response.write( 'data: ' + text + '\n\n' );
	}

	function writeScoresData () {
		readScores().then(function ( text ) {
			writeData( JSON.stringify( topScores( text ) ) );
		});
	}

	// do it once
	writeScoresData();

	// do it forever
	watchScores().then(function () {
		writeScoresData();
	});
});

game.get( '/get', function ( request, response ) {
	var scoresFile = readScores();
	scoresFile.then(function ( text ) {
		response.header( 'Content-Type', 'application/json' );
		response.header( 'Cache-Control', 'no-cache' );
		response.send( 200, topScores( text ) );
	}).fail(function () {
		response.send( 404, 'FUCK' );
	});
});

function topScores ( text ) {
	var scores = {};
	var json = JSON.parse( text );

	_( json ).keys().sort(function ( a, b ) {
		return b - a;
	}).each(function ( points, i ) {
		if ( i > 8 ) {
			return;
		}
		var name = json[ points ];
		scores[ points ] = name;
	});

	return scores;
}

function readScores () {
	var fileDeferred = q.defer();
	fs.readFile( game.get( 'scores file' ), 'utf-8', function ( error, text ) {
		if ( error ) {
			fileDeferred.reject( new Error( error ) );
		} else {
			fileDeferred.resolve( text );
		}
	});
	return fileDeferred.promise;
}

function watchScores () {
	var fileDeferred = q.defer();
	fs.watch( game.get( 'scores file' ), function ( event ) {
		fileDeferred.resolve( event );
	});
	return fileDeferred.promise;
}

game.post( '/put', function ( request, response ) {
	var name = request.body.player;
	if ( name && name.length < 11 ) {
		compete( name, response ).then(function () {
			response.send( 200, 'yay' );
		});
	} else {
		response.send( 404, 'FUCK' );
	}
});

function compete ( name ) {
	return readScores().then(function ( text ) {
		var scores = JSON.parse( text );
		var points = Object.keys( scores );
		var highPoint = points[ points.length - 1 ];
		var score = +highPoint + _.random( 1, 24 );
		return addScore({
			score: +score,
			name: name
		});
	});
}

function addScore ( scoreObject ) {
	return readScores().then(function ( text ) {
		var scores = JSON.parse( text );
		scores[ scoreObject.score ] = scoreObject.name;
		return writeScores( JSON.stringify( scores ) );
	});
}

function writeScores ( scores ) {
	return q.nfcall( fs.writeFile, 'scores', scores );
}

return game;

})( require( 'express' ), require( 'lodash' ), require( 'fs' ), require( 'q' ) )
.listen( 3000 );