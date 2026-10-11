(function () {
  'use strict';

  var micBtn = document.getElementById('micBtn');
  var micLabel = document.getElementById('micLabel');
  var statusEl = document.getElementById('status');
  var statusText = document.getElementById('statusText');
  var output = document.getElementById('output');
  var interimLine = document.getElementById('interimLine');
  var interimEl = document.getElementById('interim');
  var clearBtn = document.getElementById('clearBtn');
  var copyUnicodeBtn = document.getElementById('copyUnicodeBtn');
  var copyKrutiBtn = document.getElementById('copyKrutiBtn');
  var messageEl = document.getElementById('message');
  var krutidevOutput = document.getElementById('krutidevOutput');
  var rawToggle = document.getElementById('rawToggle');
  var fontNotice = document.getElementById('fontNotice');
  var fontRadios = document.querySelectorAll('input[name="kdFont"]');
  var textSmaller = document.getElementById('textSmaller');
  var textLarger = document.getElementById('textLarger');
  var stepEls = document.querySelectorAll('.step');
  var toastEl = document.getElementById('toast');
  var toastText = document.getElementById('toastText');
  var toastAction = document.getElementById('toastAction');

  document.getElementById('appVersion').textContent = 'v' + window.KRUTI_DEV_VERSION;

  var LABEL_IDLE = 'बोलिए';
  var LABEL_LISTENING = 'रोकिए';
  var ARIA_IDLE = 'बोलना शुरू करें';
  var ARIA_LISTENING = 'सुनना बंद करें';

  var STATUS = {
    ready: 'तैयार है',
    listening: 'सुन रहा हूँ...',
    paused: 'रुका हुआ',
    unavailable: 'माइक उपलब्ध नहीं'
  };

  var MESSAGES = {
    unsupported: 'कृपया Google Chrome में खोलें / Please open in Google Chrome',
    denied: 'माइक की अनुमति नहीं मिली। कृपया माइक की अनुमति दें और फिर से बटन दबाएँ। / ' +
      'Microphone permission was denied. Please allow the microphone and tap the button again.',
    noMic: 'माइक नहीं मिला। कृपया माइक जाँचें। / No microphone found. Please check your microphone.',
    network: 'इंटरनेट नहीं चल रहा है। कृपया इंटरनेट जाँचें। / No internet connection. Please check your internet.',
    failed: 'सुनने में दिक्कत हो रही है। कृपया फिर से बटन दबाएँ। / ' +
      'Listening keeps stopping. Please tap the button again.'
  };

  var TOASTS = {
    copied: 'कॉपी हो गया ✓ अब Word में पेस्ट करें',
    copiedUnicode: 'Unicode कॉपी हो गया ✓',
    copyFailed: 'कॉपी नहीं हो पाया। कृपया फिर से दबाएँ।',
    nothingToCopy: 'अभी कुछ लिखा नहीं है — पहले बोलिए',
    cleared: 'साफ़ कर दिया',
    undo: 'वापस लाएँ'
  };

  function showMessage(text) {
    messageEl.textContent = text;
    messageEl.hidden = false;
  }

  function hideMessage() {
    messageEl.hidden = true;
    messageEl.textContent = '';
  }

  function loadSetting(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (err) {
      return null;
    }
  }

  function saveSetting(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (err) {
      // Storage blocked or full; the choice just won't be remembered.
    }
  }

  // ---- Steps and status ----

  var isListening = false;
  var copied = false;

  function refreshSteps() {
    var current = isListening ? 1 : copied ? 3 : output.value.trim() ? 2 : 1;
    for (var i = 0; i < stepEls.length; i++) {
      var active = Number(stepEls[i].getAttribute('data-step')) === current;
      stepEls[i].classList.toggle('active', active);
      if (active) stepEls[i].setAttribute('aria-current', 'step');
      else stepEls[i].removeAttribute('aria-current');
    }
  }

  function setStatus(state) {
    statusEl.setAttribute('data-state', state);
    statusText.textContent = STATUS[state];
  }

  // ---- Toast ----

  var toastTimer = null;

  function hideToast() {
    clearTimeout(toastTimer);
    toastEl.hidden = true;
    toastAction.onclick = null;
  }

  // options: { success, duration, actionLabel, onAction }
  function showToast(text, options) {
    options = options || {};
    clearTimeout(toastTimer);
    toastText.textContent = text;
    toastEl.classList.toggle('success', !!options.success);
    if (options.actionLabel) {
      toastAction.textContent = options.actionLabel;
      toastAction.setAttribute('aria-label', options.actionLabel);
      toastAction.hidden = false;
      toastAction.onclick = function () {
        hideToast();
        options.onAction();
      };
    } else {
      toastAction.hidden = true;
      toastAction.onclick = null;
    }
    toastEl.hidden = false;
    toastTimer = setTimeout(hideToast, options.duration || 3000);
  }

  // ---- Text and conversion ----

  var krutiSegments = [];
  var krutiText = '';

  // "/", "#" and "*" are the glyphs for ध्, रु and a closing quote in Kruti
  // Dev fonts, so each one typed as a symbol gets its own Arial span to stay
  // out of the Kruti Dev font. The "/" of a ध, the "#" of a रु and the "*" of
  // a quote stay in the text and in the font.
  function updateKrutiDev() {
    krutiSegments = unicodeToKrutiDevSegments(output.value);
    krutiText = '';
    krutidevOutput.textContent = '';
    for (var i = 0; i < krutiSegments.length; i++) {
      var segment = krutiSegments[i];
      krutiText += segment.text;
      if (segment.literal) {
        var literal = document.createElement('span');
        literal.className = 'literal';
        literal.style.fontFamily = 'Arial';
        literal.textContent = segment.text;
        krutidevOutput.appendChild(literal);
      } else {
        krutidevOutput.appendChild(document.createTextNode(segment.text));
      }
    }
  }

  function textChanged() {
    copied = false;
    updateKrutiDev();
    refreshSteps();
  }

  output.addEventListener('input', textChanged);

  clearBtn.addEventListener('click', function () {
    var previous = output.value;
    interimEl.textContent = '';
    if (!previous) return;
    output.value = '';
    textChanged();
    showToast(TOASTS.cleared, {
      duration: 8000,
      actionLabel: TOASTS.undo,
      onAction: function () {
        // Keep anything spoken since the clear, after the restored text.
        output.value = output.value ? previous + ' ' + output.value : previous;
        textChanged();
      }
    });
  });

  // ---- Copy ----

  function legacyCopy(field) {
    return new Promise(function (resolve, reject) {
      var ok = false;
      field.focus();
      if (field.select) field.select();
      else window.getSelection().selectAllChildren(field);
      try {
        ok = document.execCommand('copy');
      } catch (err) {
        ok = false;
      }
      window.getSelection().removeAllRanges();
      field.blur();
      if (ok) resolve();
      else reject(new Error('copy failed'));
    });
  }

  function copyField(field, text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).catch(function () {
        return legacyCopy(field);
      });
    }
    return legacyCopy(field);
  }

  // Copies the Kruti Dev text with the chosen font attached, so Word applies
  // the font on paste. Plain text goes along for apps that ignore HTML.
  function copyKrutiDev() {
    var text = krutiText;
    if (!window.ClipboardItem || !navigator.clipboard || !navigator.clipboard.write) {
      return copyField(krutidevOutput, text);
    }
    var html = krutiDevToHtml(krutiSegments, 'Kruti Dev ' + selectedFont);
    try {
      return navigator.clipboard.write([new ClipboardItem({
        'text/plain': new Blob([text], { type: 'text/plain' }),
        'text/html': new Blob([html], { type: 'text/html' })
      })]).catch(function () {
        return copyField(krutidevOutput, text);
      });
    } catch (err) {
      return copyField(krutidevOutput, text);
    }
  }

  function copyFailed() {
    showToast(TOASTS.copyFailed);
  }

  copyKrutiBtn.addEventListener('click', function () {
    if (!krutiText.trim()) {
      showToast(TOASTS.nothingToCopy);
      return;
    }
    copyKrutiDev().then(function () {
      copied = true;
      refreshSteps();
      showToast(TOASTS.copied, { success: true });
    }, copyFailed);
  });

  copyUnicodeBtn.addEventListener('click', function () {
    if (!output.value.trim()) {
      showToast(TOASTS.nothingToCopy);
      return;
    }
    copyField(output, output.value).then(function () {
      showToast(TOASTS.copiedUnicode, { success: true });
    }, copyFailed);
  });

  // ---- Text size ----

  var SIZE_MIN = 24;
  var SIZE_MAX = 44;
  var SIZE_STEP = 4;
  var textSize = 28;

  function applyTextSize() {
    document.documentElement.style.setProperty('--ta-size', textSize + 'px');
    textSmaller.disabled = textSize <= SIZE_MIN;
    textLarger.disabled = textSize >= SIZE_MAX;
  }

  function changeTextSize(delta) {
    textSize = Math.min(SIZE_MAX, Math.max(SIZE_MIN, textSize + delta));
    applyTextSize();
    saveSetting('boloHindi.textSize', String(textSize));
  }

  textSmaller.addEventListener('click', function () { changeTextSize(-SIZE_STEP); });
  textLarger.addEventListener('click', function () { changeTextSize(SIZE_STEP); });

  var savedSize = parseInt(loadSetting('boloHindi.textSize'), 10);
  if (savedSize >= SIZE_MIN && savedSize <= SIZE_MAX) textSize = savedSize;
  applyTextSize();

  // ---- Kruti Dev font ----

  var selectedFont = '010';

  function fontNames(variant) {
    return ['Kruti Dev ' + variant, 'KrutiDev' + variant];
  }

  // A font is installed if asking for it changes the measured width of a
  // sample compared with the plain fallback font.
  function isFontInstalled(names) {
    var context = document.createElement('canvas').getContext('2d');
    if (!context) return true; // can't tell; don't show a warning
    var sample = 'fganh Hkkjr deZ mmmmmmmmmmlli 0123';
    var fallbacks = ['monospace', 'serif'];
    for (var f = 0; f < fallbacks.length; f++) {
      context.font = '72px ' + fallbacks[f];
      var baseWidth = context.measureText(sample).width;
      for (var i = 0; i < names.length; i++) {
        context.font = '72px "' + names[i] + '", ' + fallbacks[f];
        if (context.measureText(sample).width !== baseWidth) return true;
      }
    }
    return false;
  }

  function applyFont() {
    var raw = rawToggle.checked;
    var families = fontNames(selectedFont).concat(fontNames('010')).map(function (name) {
      return '"' + name + '"';
    });
    krutidevOutput.classList.toggle('raw', raw);
    krutidevOutput.style.fontFamily = raw ? '' : families.join(', ') + ', sans-serif';
    fontNotice.hidden = isFontInstalled(fontNames(selectedFont));
  }

  // Start on the remembered font, else the first one found on this computer.
  var savedFont = loadSetting('boloHindi.font');
  var startRadio = null;
  for (var r = 0; r < fontRadios.length; r++) {
    if (fontRadios[r].value === savedFont) startRadio = fontRadios[r];
  }
  for (r = 0; r < fontRadios.length && !startRadio; r++) {
    if (isFontInstalled(fontNames(fontRadios[r].value))) startRadio = fontRadios[r];
  }
  if (startRadio) {
    startRadio.checked = true;
    selectedFont = startRadio.value;
  }

  for (r = 0; r < fontRadios.length; r++) {
    fontRadios[r].addEventListener('change', function () {
      selectedFont = this.value;
      saveSetting('boloHindi.font', selectedFont);
      applyFont();
    });
  }

  rawToggle.addEventListener('change', applyFont);
  applyFont();

  updateKrutiDev();
  refreshSteps();

  // ---- Speech recognition ----

  var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    showMessage(MESSAGES.unsupported);
    micBtn.disabled = true;
    setStatus('unavailable');
    return;
  }

  // Chrome on Android repeats earlier words in every result when continuous
  // mode is on, so there we take one phrase at a time and rely on the
  // auto-restart in onend to keep listening.
  var IS_ANDROID = /Android/i.test(navigator.userAgent);

  var recognition = new SpeechRecognition();
  recognition.lang = 'hi-IN';
  recognition.continuous = !IS_ANDROID;
  recognition.interimResults = true;

  var wantListening = false; // true from the Start tap until the Stop tap
  var startedAt = 0;
  var quickEnds = 0; // sessions in a row that ended almost immediately
  var MAX_QUICK_ENDS = 5;

  function setListeningUI(listening) {
    isListening = listening;
    micBtn.classList.toggle('listening', listening);
    micBtn.setAttribute('aria-pressed', String(listening));
    micBtn.setAttribute('aria-label', listening ? ARIA_LISTENING : ARIA_IDLE);
    micLabel.textContent = listening ? LABEL_LISTENING : LABEL_IDLE;
    interimLine.classList.toggle('active', listening);
    setStatus(listening ? 'listening' : 'paused');
    refreshSteps();
  }

  function startRecognition() {
    startedAt = Date.now();
    try {
      recognition.start();
    } catch (err) {
      // Already running; nothing to do.
    }
  }

  function stopListening() {
    wantListening = false;
    setListeningUI(false);
    interimEl.textContent = '';
    recognition.stop();
  }

  function appendFinal(text) {
    text = text.trim();
    if (!text) return;
    var current = output.value;
    var separator = current && !/\s$/.test(current) ? ' ' : '';
    output.value = current + separator + text;
    output.scrollTop = output.scrollHeight;
    textChanged();
  }

  micBtn.addEventListener('click', function () {
    if (wantListening) {
      stopListening();
      return;
    }
    hideMessage();
    wantListening = true;
    quickEnds = 0;
    setListeningUI(true);
    startRecognition();
  });

  recognition.onresult = function (event) {
    var interim = '';
    for (var i = event.resultIndex; i < event.results.length; i++) {
      var result = event.results[i];
      if (result.isFinal) {
        appendFinal(result[0].transcript);
      } else {
        interim += result[0].transcript;
      }
    }
    interimEl.textContent = interim;
    quickEnds = 0;
  };

  recognition.onerror = function (event) {
    switch (event.error) {
      case 'not-allowed':
      case 'service-not-allowed':
        showMessage(MESSAGES.denied);
        stopListening();
        break;
      case 'audio-capture':
        showMessage(MESSAGES.noMic);
        stopListening();
        break;
      case 'network':
        showMessage(MESSAGES.network);
        stopListening();
        break;
      default:
        // 'no-speech' and 'aborted' are normal during pauses; onend restarts.
        break;
    }
  };

  // Chrome ends recognition by itself after a silence. Keep going until the
  // user presses Stop.
  recognition.onend = function () {
    interimEl.textContent = '';
    if (!wantListening) return;

    quickEnds = Date.now() - startedAt < 1000 ? quickEnds + 1 : 0;
    if (quickEnds >= MAX_QUICK_ENDS) {
      showMessage(MESSAGES.failed);
      stopListening();
      return;
    }
    setTimeout(function () {
      if (wantListening) startRecognition();
    }, 250);
  };
})();
