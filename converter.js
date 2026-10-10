// Unicode Hindi -> Kruti Dev converter.
// Pure string code, no DOM: works in the browser (global unicodeToKrutiDev)
// and in Node (module.exports).
(function (root) {
  'use strict';

  var HALANT = '्';
  var NUKTA = '़';
  var RA = 'र';
  var I_MATRA = 'ि';

  // [consonant, full form, half form]. Letters without a half glyph in
  // Kruti Dev have none; they fall back to full form + visible halant (~).
  var CONSONANTS = [
    ['क', 'd', 'D'], ['ख', '[k', '['], ['ग', 'x', 'X'], ['घ', '?k', '?'], ['ङ', '³'],
    ['च', 'p', 'P'], ['छ', 'N'], ['ज', 't', 'T'], ['झ', '>', '÷'], ['ञ', '¥'],
    ['ट', 'V'], ['ठ', 'B'], ['ड', 'M'], ['ढ', '<'], ['ण', '.k', '.'],
    ['त', 'r', 'R'], ['थ', 'Fk', 'F'], ['द', 'n'], ['ध', '/k', '/'], ['न', 'u', 'U'],
    ['प', 'i', 'I'], ['फ', 'Q', '¶'], ['ब', 'c', 'C'], ['भ', 'Hk', 'H'], ['म', 'e', 'E'],
    ['य', ';', '¸'], ['र', 'j'], ['ल', 'y', 'Y'], ['ळ', 'G'], ['व', 'o', 'O'],
    ['श', "'k", "'"], ['ष', '"k', '"'], ['स', 'l', 'L'], ['ह', 'g', 'º']
  ];

  // Conjuncts with their own glyphs. Matched longest-first, before the
  // single consonants above.
  var CLUSTER = {
    'क्ष': '{k', 'क्ष्': '{',
    'त्र': '=k', 'त्र्': '=',
    'त्त': 'Ùk', 'त्त्': 'Ù',
    'ज्ञ': 'K', 'श्र': 'J',
    'द्य': '|', 'द्ध': ')', 'द्व': '}', 'द्द': 'í',
    'ह्म': 'ã', 'ह्य': 'á', 'ह्न': 'à', 'ह्र': 'ºz',
    'ट्ट': 'ê', 'ट्ठ': 'ë', 'ड्ड': 'ì', 'ड्ढ': 'ï',
    'ट्य': 'Vî', 'ठ्य': 'Bî', 'ड्य': 'Mî', 'ढ्य': '<î', 'छ्य': 'Nî',
    // ra below the consonant
    'क्र': 'Ø', 'प्र': 'ç', 'फ्र': 'Ý', 'द्र': 'æ',
    'ट्र': 'Vª', 'ठ्र': 'Bª', 'ड्र': 'Mª', 'ढ्र': '<ª', 'छ्र': 'Nª'
  };
  CLUSTER[HALANT + RA] = 'z'; // any other consonant + ra, e.g. ग्र = xz
  CLUSTER[HALANT] = '~';
  CLUSTER[NUKTA] = '+'; // क़ = d+, ड़ = M+, ...

  CONSONANTS.forEach(function (row) {
    CLUSTER[row[0]] = row[1];
    if (row[2]) {
      CLUSTER[row[0] + HALANT] = row[2];
      CLUSTER[row[0] + NUKTA + HALANT] = row[2] + '+';
    }
  });

  var MAX_KEY_LENGTH = Object.keys(CLUSTER).reduce(function (max, key) {
    return Math.max(max, key.length);
  }, 0);

  // Consonant + matra pairs that have a single glyph.
  var CONSONANT_MATRA = { 'रु': '#', 'रू': ':', 'हृ': 'â', 'दृ': '–' };

  // Everything outside a consonant cluster, one character at a time.
  var SINGLE = {
    'अ': 'v', 'आ': 'vk', 'इ': 'b', 'ई': 'bZ', 'उ': 'm', 'ऊ': 'Å', 'ऋ': '_',
    'ए': ',', 'ऐ': ',s', 'ओ': 'vks', 'औ': 'vkS', 'ऑ': 'v‚', 'ऍ': ',W',

    'ा': 'k', 'ि': 'f', 'ी': 'h', 'ु': 'q', 'ू': 'w', 'ृ': '`',
    'े': 's', 'ै': 'S', 'ो': 'ks', 'ौ': 'kS', 'ॉ': '‚', 'ॅ': 'W',
    'ं': 'a', 'ँ': '¡', 'ः': '%', 'ऽ': '·',

    '।': 'A', '॥': 'AA', '॰': 'Œ',

    '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
    '५': '5', '६': '6', '७': '7', '८': '8', '९': '9',

    // These ASCII characters are Hindi letters in Kruti Dev (a comma is ए,
    // a full stop is ण्), so the punctuation marks live on other codes.
    ',': ']', '.': '-', '?': '\\', '-': '&', '(': '¼', ')': '½',
    ';': '(', ':': '%', '+': '$', '=': '¾', '{': '¿', '}': 'À',
    "'": '*', '"': 'ß', '‘': '^', '’': '*', '“': 'Þ', '”': 'ß'
  };
  SINGLE[HALANT] = '~';
  SINGLE[NUKTA] = '+';

  // NFC keeps these three precomposed; split them like the other nukta letters.
  var NUKTA_SPLIT = { 'ऩ': 'न' + NUKTA, 'ऱ': RA + NUKTA, 'ऴ': 'ळ' + NUKTA };

  function isConsonant(ch) {
    return ch >= 'क' && ch <= 'ह';
  }

  function isMatra(ch) {
    return ch >= 'ा' && ch <= 'ौ';
  }

  function isModifier(ch) {
    return ch >= 'ँ' && ch <= 'ः';
  }

  function lookup(table, key) {
    return Object.prototype.hasOwnProperty.call(table, key) ? table[key] : null;
  }

  function convertSingle(ch) {
    var mapped = lookup(SINGLE, ch);
    return mapped === null ? ch : mapped;
  }

  // cluster is consonants joined by halants, e.g. "स्त" or "ष्ट्र".
  function convertCluster(cluster) {
    var out = '';
    var pos = 0;
    while (pos < cluster.length) {
      var matched = false;
      for (var len = Math.min(MAX_KEY_LENGTH, cluster.length - pos); len > 0; len--) {
        var key = cluster.substr(pos, len);
        var value = lookup(CLUSTER, key);
        if (value === null) continue;
        // A following ra hangs under the full letter (ग्र = xz), so the
        // half form must not swallow the halant here.
        if (len > 1 && key.charAt(len - 1) === HALANT &&
            cluster.charAt(pos + len) === RA && cluster.charAt(pos + len + 1) !== NUKTA) {
          continue;
        }
        out += value;
        pos += len;
        matched = true;
        break;
      }
      if (!matched) {
        out += cluster.charAt(pos);
        pos++;
      }
    }
    return out;
  }

  function unicodeToKrutiDev(text) {
    text = String(text)
      .normalize('NFC')
      .replace(/[‌‍]/g, '')
      .replace(/[ऩऱऴ]/g, function (ch) { return NUKTA_SPLIT[ch]; });

    var out = '';
    var i = 0;
    var n = text.length;

    while (i < n) {
      if (!isConsonant(text.charAt(i))) {
        out += convertSingle(text.charAt(i));
        i++;
        continue;
      }

      // One syllable: consonant cluster, then vowel matras, then modifiers.
      var consonants = [];
      var trailingHalant = false;
      while (true) {
        var consonant = text.charAt(i++);
        if (text.charAt(i) === NUKTA) {
          consonant += NUKTA;
          i++;
        }
        consonants.push(consonant);
        if (text.charAt(i) !== HALANT) break;
        i++;
        if (i < n && isConsonant(text.charAt(i))) continue;
        trailingHalant = true;
        break;
      }

      // Reph: र् at the start of a cluster is written as Z after the syllable.
      var reph = consonants.length > 1 && consonants[0] === RA;
      if (reph) consonants.shift();

      var hasShortI = false;
      var matras = '';
      while (i < n && isMatra(text.charAt(i))) {
        if (text.charAt(i) === I_MATRA) hasShortI = true;
        else matras += text.charAt(i);
        i++;
      }

      var modifiers = '';
      while (i < n && isModifier(text.charAt(i))) {
        modifiers += convertSingle(text.charAt(i));
        i++;
      }

      var body;
      var special = consonants.length === 1 && matras
        ? lookup(CONSONANT_MATRA, consonants[0] + matras.charAt(0))
        : null;
      if (special !== null) {
        body = special;
        matras = matras.slice(1);
      } else {
        body = convertCluster(consonants.join(HALANT));
      }
      for (var m = 0; m < matras.length; m++) {
        body += convertSingle(matras.charAt(m));
      }

      // Short i goes before the whole cluster; reph goes after the vowel
      // matras but before anusvara / chandrabindu.
      out += (hasShortI ? 'f' : '') + body + (trailingHalant ? '~' : '') +
        (reph ? 'Z' : '') + modifiers;
    }

    return out;
  }

  root.unicodeToKrutiDev = unicodeToKrutiDev;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { unicodeToKrutiDev: unicodeToKrutiDev };
  }
})(typeof window !== 'undefined' ? window : globalThis);
