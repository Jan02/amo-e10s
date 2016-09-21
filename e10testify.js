var addonid = document.querySelector('[data-addonid]').getAttribute('data-addonid');
var addonslug = window.location.href.match(/addon\/([^/]+)/)[1];
var addonxpi = 'https://addons.mozilla.org/firefox/downloads/latest/' + addonslug + '/addon-' + addonid + '-latest.xpi';

var href = document.querySelector('.installer');
if (href) {
	href = href.href;
}

// needed to add `"permissions": [ "https://addons.cdn.mozilla.net/*"]` in order for this to work
// console.log('JSZip:', JSZip);

markProgress('Downloading Addon Data');

fetch(href || adonxpi)
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
						// author marked it COMPAT
						mark(true);
					} else {
						if (!json.permissions || !('multiprocess' in json.permissions)) {
							// author did not mark it yet
							mark(undefined);
						} else {
							// author marked it NOT COMPAT
							mark(false);
						}
					}
				});
			} else if (file = zip.file('install.rdf')) {
				// its bootstrap or xul
				// console.log('bootstrap or xul');
				file.async('string').then( content => {
					console.log('content:', content);
					if (/multiprocessCompatible/i.test(content)) {
						if (/^multiprocessCompatible.*?true$/m.test(content)) {
							// author marked it COMPAT
							mark(true);
						} else {
							// author marked it NOT COMPAT
							mark(true);
						}
					} else {
						// author did not mark it yet
						mark(undefined);
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

function markProgress(txt) {
	var tag = document.getElementById('amoe10s_prog');
	if (!tag) {
		tag = document.createElement('span');
		tag.setAttribute('id', 'amoe10s_prog');
		tag.classList.add('requires-restart');
		tag.setAttribute('style', 'background-color:#000;')
		var parent = document.querySelector('h1.addon');
		parent.appendChild(tag);
	}
	tag.textContent = 'amo e10s: ' + txt + '...';
}

function mark(compat) {
	// compat - boolean/undefined - tells if its e10s compatible or not. undefined says author did not mark it so it MAY be compat
	var progel = document.getElementById('amoe10s_prog');
	if (progel) progel.parentNode.removeChild(progel);

	var parent = document.querySelector('h1.addon');
	var tag = document.createElement('span');
	tag.classList.add('requires-restart');
	if (compat) {
		tag.setAttribute('style', 'background-color:#2453b4;')
		tag.textContent = 'E10s Compatible';
	} else if (compat === false) {
		tag.setAttribute('style', 'background-color:#b42424;')
		tag.textContent = 'Not E10s Compatible';
	} else {
		tag.setAttribute('style', 'background-color:#cfc700;')
		tag.textContent = 'Maybe E10s Compatible';
	}
	parent.appendChild(tag);
}
