/*global require:false*/
(function( express, _, fs, q ) {
'use strict';

var game = express();

game.set( 'title', 'Scores' );
game.use( express.bodyParser() );
game.use( express.static( __dirname + '/public' ) );

game.get( '/', function ( request, response ) {
	response.redirect( '/index.html' );
});

game.get( '/longget', function ( request, response ) {
	var id = new Date().toLocaleTimeString();
	response.header( 'Content-Type', 'text/event-stream' );
	response.header( 'Cache-Control', 'no-cache' );
	response.header( 'Connection', 'keep-alive' );
});

game.get( '/get', function ( request, response ) {
	var scoresFile = readScores();
	scoresFile.then(function ( scores ) {
		response.header( 'Content-Type', 'application/json' );
		response.header( 'Cache-Control', 'no-cache' );
		response.send( 200, scores );
	}).fail(function () {
		response.send( 404, 'FUCK' );
	});
});

function readScores () {
	var fileDeferred = q.defer();
	fs.readFile( 'scores', 'utf-8', function ( error, text ) {
		if ( error ) {
			fileDeferred.reject( new Error( error ) );
		} else {
			fileDeferred.resolve( text );
		}
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