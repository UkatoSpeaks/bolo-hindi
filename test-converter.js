// Run with: node test-converter.js
var converter = require('./converter.js');
var unicodeToKrutiDev = converter.unicodeToKrutiDev;
var unicodeToKrutiDevSegments = converter.unicodeToKrutiDevSegments;
var krutiDevToHtml = converter.krutiDevToHtml;

var CASES = [
  // Given cases
  ['हिंदी', 'fganh'],
  ['भारत', 'Hkkjr'],
  ['नमस्ते', 'ueLrs'],
  ['कर्म', 'deZ'],
  ['धर्मों', '/keksZa'],
  ['क्षत्रिय', '{kf=;'],
  ['ज्ञान', 'Kku'],
  ['श्री', 'Jh'],
  ['विद्यालय', 'fo|ky;'],
  ['कृपया', 'd`i;k'],
  ['आप', 'vki'],
  ['पिताजी', 'firkth'],
  ['राम।', 'jkeA'],

  // Half letters and conjuncts
  ['क्या', 'D;k'],
  ['हिन्दी', 'fgUnh'],
  ['स्थिति', 'fLFkfr'],
  ['शक्ति', "'kfDr"],
  ['लक्ष्मी', 'y{eh'],
  ['उत्तर', 'mÙkj'],
  ['बुद्ध', 'cq)'],
  ['द्वार', '}kj'],
  ['चट्टान', 'pêku'],
  ['पत्र', 'i='],
  ['पत्रा', 'i=k'],
  ['मित्र', 'fe='],
  ['त्रिशूल', "f='kwy"],
  ['स्त्री', 'L=h'],

  // Ra below the consonant
  ['प्रेम', 'çse'],
  ['क्रम', 'Øe'],
  ['ग्राम', 'xzke'],
  ['ब्रज', 'czt'],
  ['द्रव', 'æo'],
  ['ट्रेन', 'Vªsu'],
  ['राष्ट्र', 'jk"Vª'],

  // Reph
  ['निर्मित', 'fufeZr'],
  ['कर्मी', 'dehZ'],
  ['वर्षों', 'o"kksZa'],
  ['मर्त्य', 'eR;Z'],
  ['अर्थात्', 'vFkkZr~'],

  // Nukta letters, base + nukta and precomposed
  ['क़लम', 'd+ye'],
  ['ख़बर', '[k+cj'],
  ['ग़लत', 'x+yr'],
  ['ज़रूरी', 't+:jh'],
  ['सड़क', 'lM+d'],
  ['पढ़ाई', 'i<+kbZ'],
  ['फ़ोन', 'Q+ksu'],
  ['ज़मीन', 't+ehu'],
  ['ज़्यादा', 'T+;knk'],

  // Vowels, chandrabindu, special matra glyphs
  ['ऊपर', 'Åij'],
  ['ऐसा', ',slk'],
  ['औरत', 'vkSjr'],
  ['चाँद', 'pk¡n'],
  ['गुरु', 'xq#'],
  ['हृदय', 'ân;'],
  ['मैं ईमानदार हूँ।', 'eSa bZekunkj gw¡A'],

  // Digits, English words, punctuation, newlines
  ['२०२६', '2026'],
  ['मेरे पास 2 mobile हैं।', 'esjs ikl 2 mobile gSaA'],
  ['सत्य॥', 'lR;AA'],
  ['राम\nश्याम', "jke\n';ke"],
  ['क्या हाल है?', 'D;k gky gS\\'],
  ['हाँ, ठीक है.', 'gk¡] Bhd gS-'],

  // Forward slash passes through unchanged
  ['10/10/2026', '10/10/2026'],
  ['हाँ/नहीं', 'gk¡/ugha'],
  ['राम / श्याम', "jke / ';ke"],
  ['पत्र संख्या 45/2026', 'i= la[;k 45/2026'],

  // Hash passes through unchanged; रु is "#"
  ['#123', '#123'],
  ['रुपये', '#i;s'],
  ['गुरु #1 और रुपया', 'xq# #1 vkSj #i;k'],
  ['क्रम संख्या #5/2026', 'Øe la[;k #5/2026'],

  // Asterisk passes through unchanged; an apostrophe is "*"
  ['**बिन्दु**', '**fcUnq**'],
  ["'राम'", '*jke*'],
  ['#### **बिन्दु संख्या:-1,**', '#### **fcUnq la[;k%&1]**'],

  // ध is "/k" and half ध is "/"
  ['विधायक', 'fo/kk;d'],
  ['निर्धारित', 'fu/kkZfjr'],
  ['उपलब्ध', 'miyC/k'],
  ['अधिनियम', 'vf/kfu;e'],
  ['ध्यान', '/;ku'],

  // Half ग is "X"
  ['संलग्नक', 'layXud'],
  ['अग्नि', 'vfXu'],
  ['ग्वाला', 'Xokyk']
];

// Clipboard HTML: [Unicode text, expected HTML]. Only a "/", "#" or "*" typed
// as a symbol sits in an Arial span; the "/" of a ध, the "#" of a रु and the
// "*" of a quote stay in the Kruti Dev font.
var ARIAL_SLASH = '<span style="font-family:Arial">/</span>';
var ARIAL_HASH = '<span style="font-family:Arial">#</span>';
var ARIAL_STAR = '<span style="font-family:Arial">*</span>';
var OPEN = '<span style="font-family:\'Kruti Dev 016\';font-size:14pt">';
var HTML_CASES = [
  ['पत्र संख्या 45/2026', OPEN + 'i= la[;k 45' + ARIAL_SLASH + '2026</span>'],
  ['हाँ/नहीं', OPEN + 'gk¡' + ARIAL_SLASH + 'ugha</span>'],
  ['10/10/2026', OPEN + '10' + ARIAL_SLASH + '10' + ARIAL_SLASH + '2026</span>'],
  ['राम\nकढ़म', OPEN + 'jke<br>d&lt;+e</span>'],
  ['विधायक', OPEN + 'fo/kk;d</span>'],
  ['ध्यान/धन', OPEN + '/;ku' + ARIAL_SLASH + '/ku</span>'],
  ['#123', OPEN + ARIAL_HASH + '123</span>'],
  ['रुपये', OPEN + '#i;s</span>'],
  ['गुरु #1 और रुपया', OPEN + 'xq# ' + ARIAL_HASH + '1 vkSj #i;k</span>'],
  ['क्रम संख्या #5/2026', OPEN + 'Øe la[;k ' + ARIAL_HASH + '5' + ARIAL_SLASH + '2026</span>'],
  ['####', OPEN + ARIAL_HASH + ARIAL_HASH + ARIAL_HASH + ARIAL_HASH + '</span>'],
  ['**बिन्दु**', OPEN + ARIAL_STAR + ARIAL_STAR + 'fcUnq' + ARIAL_STAR + ARIAL_STAR + '</span>'],
  ['#### **बिन्दु संख्या:-1,**', OPEN + ARIAL_HASH + ARIAL_HASH + ARIAL_HASH + ARIAL_HASH + ' ' +
    ARIAL_STAR + ARIAL_STAR + 'fcUnq la[;k%&amp;1]' + ARIAL_STAR + ARIAL_STAR + '</span>']
];

// Segments: [Unicode text, expected segments as [text, literal] pairs].
var SEGMENT_CASES = [
  ['विधायक', [['fo/kk;d', false]]],
  ['माहवार/वर्षवार', [['ekgokj', false], ['/', true], ['o"kZokj', false]]],
  ['/', [['/', true]]],
  ['//', [['/', true], ['/', true]]],
  ['#123', [['#', true], ['123', false]]],
  ['रुपये', [['#i;s', false]]],
  ['गुरु #1 और रुपया', [['xq# ', false], ['#', true], ['1 vkSj #i;k', false]]],
  ['क्रम संख्या #5/2026', [['Øe la[;k ', false], ['#', true], ['5', false], ['/', true], ['2026', false]]],
  ['##', [['#', true], ['#', true]]],
  ['####', [['#', true], ['#', true], ['#', true], ['#', true]]],
  ['#### शीर्षक', [['#', true], ['#', true], ['#', true], ['#', true], [" 'kh\"kZd", false]]],
  ['**बिन्दु**', [['*', true], ['*', true], ['fcUnq', false], ['*', true], ['*', true]]],
  // Reph and short i next to literal symbols
  ['#र्म#', [['#', true], ['eZ', false], ['#', true]]],
  ['##कि##', [['#', true], ['#', true], ['fd', false], ['#', true], ['#', true]]],
  ["'राम'", [['*jke*', false]]],
  ['#### **बिन्दु संख्या:-1,**', [['#', true], ['#', true], ['#', true], ['#', true], [' ', false],
    ['*', true], ['*', true], ['fcUnq la[;k%&1]', false], ['*', true], ['*', true]]],
  ['', []]
];

// Number of Arial spans in the clipboard HTML: [Unicode text, expected count].
var PARAGRAPH = '2. वर्ष 2007 से संबंधित उपलब्ध अभिलेखों के अनुसार विधायक को वास्तव में ' +
  'भुगतान किए गए वेतन एवं प्रत्येक भत्ते की माहवार/वर्षवार राशि वर्ष 2020, मार्च तक के ' +
  'निष्प्रोज्य/नष्ट किये गये है आदेश की प्रमाणित प्रति (संलग्नक- 02)';
var ARIAL_COUNT_CASES = [
  ['विधायक', 0],
  ['निर्धारित', 0],
  ['उपलब्ध', 0],
  ['माहवार/वर्षवार', 1],
  ['निष्प्रोज्य/नष्ट', 1],
  ['45/2026', 1],
  [PARAGRAPH, 2],
  ['#123', 1],
  ['रुपये', 0],
  ['गुरु #1 और रुपया', 1],
  ['क्रम संख्या #5/2026', 2],
  ['####', 4],
  ['##', 2],
  ['#### शीर्षक', 4],
  ['**बिन्दु**', 4],
  ["'राम'", 0],
  ['#### **बिन्दु संख्या:-1,**', 8]
];

var failed = 0;
function check(input, actual, expected) {
  var ok = actual === expected;
  if (!ok) failed++;
  console.log((ok ? 'PASS' : 'FAIL') + '  ' + JSON.stringify(input) + ' -> ' + JSON.stringify(actual) +
    (ok ? '' : '   expected ' + JSON.stringify(expected)));
}

CASES.forEach(function (testCase) {
  check(testCase[0], unicodeToKrutiDev(testCase[0]), testCase[1]);
});
HTML_CASES.forEach(function (testCase) {
  var html = krutiDevToHtml(unicodeToKrutiDevSegments(testCase[0]), 'Kruti Dev 016');
  check(testCase[0], html, testCase[1]);
});
SEGMENT_CASES.forEach(function (testCase) {
  var pairs = unicodeToKrutiDevSegments(testCase[0]).map(function (segment) {
    return [segment.text, segment.literal];
  });
  check(testCase[0], JSON.stringify(pairs), JSON.stringify(testCase[1]));
});
ARIAL_COUNT_CASES.forEach(function (testCase) {
  var html = krutiDevToHtml(unicodeToKrutiDevSegments(testCase[0]), 'Kruti Dev 016');
  check(testCase[0], html.split('font-family:Arial').length - 1, testCase[1]);
});

// The ध words of the paragraph keep their "/" in the Kruti Dev text.
var paragraphKruti = unicodeToKrutiDev(PARAGRAPH);
['miyC/k', 'fo/kk;d', 'lacaf/kr', 'layXud'].forEach(function (word) {
  check('paragraph contains ' + word, paragraphKruti.indexOf(word) !== -1, true);
});

// The cache-busting "?v=" on every link in index.html is the current version.
var indexHtml = require('fs').readFileSync(require('path').join(__dirname, 'index.html'), 'utf8');
['style.css', 'converter.js', 'app.js'].forEach(function (file) {
  check('index.html loads ' + file + ' with the version',
    indexHtml.indexOf('"' + file + '?v=' + converter.VERSION + '"') !== -1, true);
});

var total = CASES.length + HTML_CASES.length + SEGMENT_CASES.length + ARIAL_COUNT_CASES.length + 7;
console.log('\n' + (total - failed) + '/' + total + ' passed');
process.exit(failed ? 1 : 0);
