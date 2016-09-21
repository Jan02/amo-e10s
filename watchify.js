var addonid = document.querySelector('[data-addonid]').getAttribute('data-addonid');
var addonslug = window.location.href.match(/addon\/([^/]+)/)[1];
var addonxpi = 'https://addons.mozilla.org/firefox/downloads/latest/' + addonslug + '/addon-' + addonid + '-latest.xpi';
alert(addonxpi);

// needed to add `"permissions": [ "https://addons.cdn.mozilla.net/*"]` in order for this to work
console.error('JSZip:', JSZip);

fetch(addonxpi)
.then( response => {
	response.arrayBuffer().then(buf => {
		console.log('buf:', buf);
		alert('got buf now reading');

		JSZip.loadAsync(buf).then(zip => {
			alert('opened zip');
			console.log('zip:', zip);

			if (zip.files['manifest.json']) {
				// its webext
				mark(true);
			} else if (zip.files['package.json']) {
				// its sdk
			} else if (zip.files['install.rdf']) {
				// its bootstrap or xul
			} else {
				// error - unknown addon type
				alert('error - uknown addon type');
			}
		});
	});
})
.catch( err => alert('amo-e10s Error: Failed to read XPI contents to detect e10s compatibility') );

function mark(compat) {
	// compat - boolean - tells if its e10s compatible or not
	var parent = document.querySelector('h1.addon');
	var tag = document.createElement('span');
	tag.classList.add('requires-restart');
	if (compat) {
		tag.setAttribute('style', 'background-color:#2453b4;')
		tag.textContent = 'E10s Compatible';
	} else {
		tag.setAttribute('style', 'background-color:#b42424;')
		tag.textContent = 'Not E10s Compatible';
	}
	parent.appendChild(tag);
}
