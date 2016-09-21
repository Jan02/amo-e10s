var addonid = document.querySelector('[data-addonid]').getAttribute('data-addonid');
var addonslug = window.location.href.match(/addon\/([^/]+)/)[1];
var addonxpi = 'https://addons.mozilla.org/firefox/downloads/latest/' + addonslug + '/addon-' + addonid + '-latest.xpi';
alert(addonxpi);

// needed to add `"permissions": [ "https://addons.cdn.mozilla.net/*"]` in order for this to work

fetch(addonxpi)
.then( response => {
	response.arrayBuffer().then(function(buf) {
		console.log('buf:', buf);
		alert('got buf now reading')
	});
})
.catch( err => alert('amo-e10s Error: Failed to read XPI contents to detect e10s compatibility') );
