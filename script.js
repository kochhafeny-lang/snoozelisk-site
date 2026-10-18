(() => {
  'use strict';
  const root = document.documentElement;
  const toggle = document.querySelector('#theme-toggle');
  const front = document.querySelector('.bg-front');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let transitionTimer;
  if (toggle) toggle.addEventListener('click', () => {
    const night = root.dataset.theme !== 'night';
    root.dataset.theme = night ? 'night' : 'day';
    toggle.setAttribute('aria-pressed', String(night));
    toggle.querySelector('.toggle-label').textContent = night ? 'Night shift' : 'Daydream';
    clearTimeout(transitionTimer);
    if (front && !reducedMotion.matches) {
      front.classList.add('pull-down');
      transitionTimer = setTimeout(() => front.classList.remove('pull-down'), 300);
    }
  });

  const canvas = document.querySelector('#meme-canvas');
  const headline = document.querySelector('#meme-headline');
  const task = document.querySelector('#meme-task');
  const download = document.querySelector('#download-meme');
  const status = document.querySelector('#maker-status');
  const ctx = canvas?.getContext('2d');
  const original = new Image();
  let ready = false;
  function fitText(text, centerY, maxWidth, startSize) {
    let size = startSize;
    ctx.font = `700 ${size}px "DM Sans", sans-serif`;
    while (ctx.measureText(text).width > maxWidth && size > 25) {
      size -= 1;
      ctx.font = `700 ${size}px "DM Sans", sans-serif`;
    }
    ctx.fillText(text, canvas.width / 2, centerY, maxWidth);
  }
  function draw() {
    if (!ready || !ctx) return;
    ctx.fillStyle = '#281d2e'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(original, 0, 128, 1254, 1254);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#f6efdc';
    fitText(headline.value.trim() || "i'll do it later.", 66, 1120, 62);
    fitText(task.value.trim() || 'start.', 1443, 1120, 54);
    ctx.font = '700 20px "DM Sans", sans-serif';
    ctx.fillStyle = '#c5d398'; ctx.textAlign = 'right';
    ctx.fillText('@snoozelisk', 1218, 1361);
  }
  if (canvas && ctx) {
    original.onload = async () => {
      try { await document.fonts.ready; } catch (_) { /* use fallback font */ }
      ready = true; draw(); download.disabled = false;
      status.textContent = 'Ready when you are. Your words stay in this browser.';
    };
    original.onerror = () => { status.textContent = 'The template could not load. Refresh to try again, or download the blank template below.'; };
    original.src = 'assets/images/template.webp';
    [headline, task].forEach(input => input.addEventListener('input', () => {
      document.querySelectorAll('[data-prompt]').forEach(item => item.setAttribute('aria-pressed', 'false'));
      draw();
    }));
    document.querySelectorAll('[data-prompt]').forEach(button => button.addEventListener('click', () => {
      task.value = button.dataset.prompt; draw();
      document.querySelectorAll('[data-prompt]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      status.textContent = 'Prompt added. Change the words or download your meme.';
    }));
    document.querySelectorAll('[data-remix-headline]').forEach(button => button.addEventListener('click', () => {
      headline.value = button.dataset.remixHeadline;
      task.value = button.dataset.remixTask;
      document.querySelectorAll('[data-prompt]').forEach(item => item.setAttribute('aria-pressed', 'false'));
      draw();
      status.textContent = 'Example loaded. Put your own spin on it.';
      document.querySelector('#maker')?.scrollIntoView({behavior: reducedMotion.matches ? 'instant' : 'smooth'});
      headline.focus({preventScroll: true});
    }));
    download.addEventListener('click', () => {
      if (!ready) return;
      canvas.toBlob(blob => {
        if (!blob) { status.textContent = 'The image could not be exported. Please try again.'; return; }
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a'); link.href = url; link.download = 'snoozelisk-my-one-task.png';
        document.body.append(link); link.click(); link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 10000);
        status.textContent = 'PNG created. Your browser handles the download.';
      }, 'image/png');
    });
    document.querySelector('#reset-meme')?.addEventListener('click', () => {
      headline.value = "i'll do it later."; task.value = 'reply to that one email.';
      document.querySelectorAll('[data-prompt]').forEach(item => item.setAttribute('aria-pressed', 'false'));
      draw(); status.textContent = 'Fresh excuse. Same sleepy basilisk.';
    });
  }
  const videos = [...document.querySelectorAll('video')];
  let videosVisible = new Set();
  let userPaused = false;
  const motionButton = document.querySelector('#motion-toggle');
  function showMotionState(paused) {
    if (!motionButton) return;
    motionButton.setAttribute('aria-pressed', String(paused));
    motionButton.textContent = paused ? 'Play the daydream' : 'Pause the daydream';
  }
  if (reducedMotion.matches) showMotionState(true);
  function syncVideo(video) {
    if (reducedMotion.matches || userPaused || !videosVisible.has(video) || document.hidden) video.pause();
    else video.play().catch(() => {});
  }
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) videosVisible.add(entry.target); else videosVisible.delete(entry.target);
    syncVideo(entry.target);
  }), {threshold: 0.1});
  videos.forEach(video => observer.observe(video));
  reducedMotion.addEventListener('change', () => {
    videos.forEach(syncVideo);
    if (reducedMotion.matches) showMotionState(true);
  });
  document.addEventListener('visibilitychange', () => videos.forEach(syncVideo));
  document.querySelector('#motion-toggle')?.addEventListener('click', event => {
    const paused = event.currentTarget.getAttribute('aria-pressed') !== 'true';
    userPaused = paused;
    event.currentTarget.setAttribute('aria-pressed', String(paused));
    event.currentTarget.textContent = paused ? 'Play the daydream' : 'Pause the daydream';
    videos.forEach(video => paused ? video.pause() : video.play().catch(() => {}));
  });
})();
