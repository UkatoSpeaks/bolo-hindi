// Run with: node test-converter.js
var unicodeToKrutiDev = require('./converter.js').unicodeToKrutiDev;

var CASES = [
  // Given cases
  ['हिंदी', 'fganh'],
  ['भारत', 'Hkkjr'],
  ['नमस्ते', 'ueLrs'],
  ['कर्म', 'deZ'],
  ['धर्मों', '/keksZa'],
  ['क्षत्रिय', '{kf=k;'],
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
  ['पत्र', 'i=k'],

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
  ['हाँ, ठीक है.', 'gk¡] Bhd gS-']
];

var failed = 0;
CASES.forEach(function (testCase) {
  var input = testCase[0];
  var expected = testCase[1];
  var actual = unicodeToKrutiDev(input);
  var ok = actual === expected;
  if (!ok) failed++;
  console.log((ok ? 'PASS' : 'FAIL') + '  ' + JSON.stringify(input) + ' -> ' + JSON.stringify(actual) +
    (ok ? '' : '   expected ' + JSON.stringify(expected)));
});

console.log('\n' + (CASES.length - failed) + '/' + CASES.length + ' passed');
process.exit(failed ? 1 : 0);
