// Run with: node test-converter.js
var converter = require('./converter.js');
var unicodeToKrutiDev = converter.unicodeToKrutiDev;
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
  ['पत्र संख्या 45/2026', 'i= la[;k 45/2026']
];

// Clipboard HTML for Kruti Dev text: [Kruti Dev text, expected HTML].
// Every "/" sits in an Arial span; the rest stays in the Kruti Dev font.
var ARIAL_SLASH = '<span style="font-family:Arial">/</span>';
var OPEN = '<span style="font-family:\'Kruti Dev 016\';font-size:14pt">';
var HTML_CASES = [
  [unicodeToKrutiDev('पत्र संख्या 45/2026'), OPEN + 'i= la[;k 45' + ARIAL_SLASH + '2026</span>'],
  [unicodeToKrutiDev('हाँ/नहीं'), OPEN + 'gk¡' + ARIAL_SLASH + 'ugha</span>'],
  ['10/10/2026', OPEN + '10' + ARIAL_SLASH + '10' + ARIAL_SLASH + '2026</span>'],
  ['jke\nd<e', OPEN + 'jke<br>d&lt;e</span>']
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
  check(testCase[0], krutiDevToHtml(testCase[0], 'Kruti Dev 016'), testCase[1]);
});

var total = CASES.length + HTML_CASES.length;
console.log('\n' + (total - failed) + '/' + total + ' passed');
process.exit(failed ? 1 : 0);
