var addonid = document.querySelector('[data-addonid]').getAttribute('data-addonid');
var addonslug = window.location.href.match(/addon\/([^/]+)/)[1];
var addonxpi = 'https://addons.mozilla.org/firefox/downloads/latest/' + addonslug + '/addon-' + addonid + '-latest.xpi';

// needed to add `"permissions": [ "https://addons.cdn.mozilla.net/*"]` in order for this to work
// console.log('JSZip:', JSZip);

fetch(addonxpi)
.then( response => {
	response.arrayBuffer().then(buf => {
		JSZip.loadAsync(buf).then(zip => {
			// console.log('zip:', zip);

			var file;
			if (file = zip.file('manifest.json')) {
				// its webext
				// console.log('webext');
				mark(true);
			} else if (file = zip.file('package.json')) {
				// its sdk
				// console.log('sdk');
				file.async('string').then( content => {
					console.log('content:', content);
					var json = JSON.parse(content);
					console.log('json:', json);
					if (json.permissions && json.permissions.multiprocess) {
						mark(true);
					} else {
						mark(false);
					}
				});
			} else if (file = zip.file('install.rdf')) {
				// its bootstrap or xul
				// console.log('bootstrap or xul');
				file.async('string').then( content => {
					console.log('content:', content);
					if (/^multiprocessCompatible.*?true$/m.test(content)) {
						mark(true);
					} else {
						mark(false);
					}
				});
			} else {
				// error - unknown addon type
				alert('amo-e10s Error: Failed to identify type of addon');
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
