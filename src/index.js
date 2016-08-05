var PNG 		= require('pngjs').PNG;
var pngCipher 	= {};

pngCipher.encode = function(s, cb) {
	var filesize 	= s.length;
	var width 		= Math.ceil(Math.sqrt(filesize / 3));
	var height 		= width;
	var p 			= new PNG({ 'width': width, 'height': height });
	var buffer 		= [];

	p.data = _textToData(s);
	p.pack()
	.on("data", function(data) {
		// not working?! WTF
		// buffer = buffer.concat(data);
		// I guess we'll do it the hard way... merp :(
		for ( var i = 0; i < data.length; i++ ) {
			buffer.push(data[i]);
		}
	})
	.on('end', function() {
		cb(_arrayBufferToBase64(buffer));
	});
};

pngCipher.decode = function(data, onError, onSuccess) {
	var p1 = new PNG();
	p1.parse(_base64StringToArrayBuffer(data), function(error, data) {
		if ( error ) {
			onError(error);
		} else {
			onSuccess(_dataToText(data.data));
		}
	});
};

function _arrayBufferToBase64( buffer ) {
	var binary = '';
	var bytes = new Uint8Array( buffer );
	var len = bytes.byteLength;
	for (var i = 0; i < len; i++) {
		binary += String.fromCharCode( bytes[ i ] );
	}
	
	return window.btoa( binary );
}

function _base64StringToArrayBuffer( string ) {
	var aTemp 	= [];
	var s 		= window.atob(string);
	var a 		= s.split('');

	for ( var i = 0; i < a.length; i++ ) {
		aTemp.push(a[i].charCodeAt());
	}

	return aTemp;
}

function _textToData (text) {
	var data = [];

	var filesize = text.length;
	var width = Math.ceil(Math.sqrt(filesize / 3));
	var height = width;

	var i = 0;
	for (var y = 0; y < height; y++) {
		for (var x = 0; x < width; x++) {
			var idx = (width * y + x) << 2;

			var d0 = ( i < text.length ) ? text[i++] : "";
			var d1 = ( i < text.length ) ? text[i++] : "";
			var d2 = ( i < text.length ) ? text[i++] : "";
			if (d0 || d1 || d2) {
				var c0 = 0, 
				    c1 = 0,
				    c2 = 0;

				c0 = d0 ? d0.charCodeAt() : 0;
				c1 = d1 ? d1.charCodeAt() : 0;
				c2 = d2 ? d2.charCodeAt() : 0;

				data[idx] 		= c0;
				data[idx + 1] 	= c1;
				data[idx + 2] 	= c2;
				data[idx + 3] 	= 0xff; // 255
			} else {
				data[idx] 		= 0;
				data[idx + 1] 	= 0;
				data[idx + 2] 	= 0;
				data[idx + 3] 	= 0xff; // 255
			}
		}
	}

	return data;
}

function _dataToText (data) {
	var s = '';

	var i = 0;
	for ( i = 0; i < data.length; i++ ) {
		s += ( i < data.length ) ? String.fromCharCode(data[i++]) : "";
		s += ( i < data.length ) ? String.fromCharCode(data[i++]) : "";
		s += ( i < data.length ) ? String.fromCharCode(data[i++]) : "";
	}

	return s;
}

module.exports = pngCipher