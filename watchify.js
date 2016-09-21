var addonid = document.querySelector('[data-addonid]').getAttribute('data-addonid');
var addonslug = window.location.href.match(/addon\/[^/]+/)[1];
var addonxpi = 'https://addons.mozilla.org/firefox/downloads/latest/' + addonslug + '/addon-' + addonid + '-latest.xpi';
alert('path to xpi:' + addonxpi);
