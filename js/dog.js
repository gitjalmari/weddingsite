// ─── Iivari on/off ───────────────────────────────────────────────
const IIVARI_ENABLED = true;
// ─────────────────────────────────────────────────────────────────

if (IIVARI_ENABLED) {
  const dog = document.getElementById('iivari');
  if (!dog) throw new Error('iivari element not found');

  let posX        = -260;
  let targetX     = 0;
  let speed       = 240;
  let state       = 'running';
  let facingRight = true;
  let lastTs      = null;

  function pickRestSpot() {
    return Math.floor(window.innerWidth * (0.15 + Math.random() * 0.55));
  }

  function setFacing(right) {
    facingRight = right;
    updateClasses();
  }

  function updateClasses() {
    dog.className = '';
    dog.classList.add(state === 'sitting' ? 'iivari-sitting' : 'iivari-walking');
    if (!facingRight) dog.classList.add('iivari-flip');
  }

  posX    = -260;
  targetX = pickRestSpot();
  setFacing(true);
  updateClasses();

  function loop(ts) {
    if (!lastTs) lastTs = ts;
    const dt = Math.min((ts - lastTs) / 1000, 0.05);
    lastTs = ts;

    if (state === 'running' || state === 'fleeing') {
      const dir  = targetX > posX ? 1 : -1;
      const step = speed * dt;

      if (Math.abs(targetX - posX) <= step) {
        posX = targetX;
        dog.style.left = posX + 'px';

        if (state === 'fleeing') {
          if (facingRight) {
            posX = window.innerWidth + 10;
            setFacing(false);
          } else {
            posX = -260;
            setFacing(true);
          }
          targetX = pickRestSpot();
          state   = 'running';
          speed   = 240;
        } else {
          state = 'sitting';
        }
        updateClasses();
      } else {
        posX += dir * step;
        setFacing(dir > 0);
        dog.style.left = posX + 'px';
      }
    }

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);

  document.addEventListener('mousemove', (e) => {
    if (state !== 'sitting') return;
    const rect  = dog.getBoundingClientRect();
    const dogCX = rect.left + rect.width / 2;
    const dogCY = rect.top  + rect.height / 2;
    if (Math.hypot(e.clientX - dogCX, e.clientY - dogCY) < 120) {
      state = 'fleeing';
      speed = 500;
      if (e.clientX > dogCX) { setFacing(false); targetX = -270; }
      else                   { setFacing(true);  targetX = window.innerWidth + 10; }
      updateClasses();
    }
  });
}
