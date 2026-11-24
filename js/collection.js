// گالری کالکشن (نسخه‌ی انگلیسی): کلیک روی عکس کوچک، جایش را با عکس بزرگ عوض می‌کند
(function () {
  var LABEL = 'View larger: ';
  var FADE_MS = 250;

  document.querySelectorAll('.collection').forEach(function (section) {
    var main = section.querySelector('.collection-main img');
    var thumbs = section.querySelectorAll('.collection-thumb');
    var busy = false;
    if (!main || !thumbs.length) return;

    function setLabel(btn) {
      btn.setAttribute('aria-label', LABEL + btn.querySelector('img').alt);
    }

    thumbs.forEach(function (btn) {
      setLabel(btn);

      btn.addEventListener('click', function () {
        if (busy) return;
        busy = true;

        var thumbImg = btn.querySelector('img');
        main.classList.add('fading');

        setTimeout(function () {
          var tmpSrc = main.src;
          var tmpAlt = main.alt;
          main.src = thumbImg.src;
          main.alt = thumbImg.alt;
          thumbImg.src = tmpSrc;
          thumbImg.alt = tmpAlt;
          setLabel(btn);
          main.classList.remove('fading');
          busy = false;
        }, FADE_MS);
      });
    });
  });
})();