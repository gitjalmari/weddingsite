// ─── Iivari on/off ───────────────────────────────────────────────
const IIVARI_ENABLED = true;
// ─────────────────────────────────────────────────────────────────

if (IIVARI_ENABLED) {
  const dog  = document.getElementById('iivari');
  const DOG_W_WALK    = 237; // width when walking
  const DOG_W_SIT     = 171; // width when sitting
  const CONTENT_MAX_W = 720; // matches --max-width in CSS

  // Left/right boundaries the dog respects
  function getEdges() {
    const cw = Math.min(CONTENT_MAX_W, window.innerWidth);
    const cl = (window.innerWidth - cw) / 2;
    const DOG_W = state === 'sitting' ? DOG_W_SIT : DOG_W_WALK;
    return {
      contentLeft:  cl - DOG_W,
      contentRight: cl + cw,
      screenRight:  window.innerWidth - DOG_W
    };
  }

  // Corner positions (near screen edges, outside content)
  function getCorner() {
    const { screenRight } = getEdges();
    return side === 'left' ? 20 : screenRight - 20;
  }

  let posX    = -DOG_W_WALK - 10;
  let targetX = 20;
  let speed   = 240;
  let state   = 'running'; // 'running' | 'sitting' | 'fleeing'
  let side    = 'left';    // which margin
  let facingRight = true;
  let lastTs  = null;

  function setFacing(right) {
    facingRight = right;
    updateClasses();
  }

  function updateClasses() {
    dog.className = '';
    dog.classList.add(state === 'sitting' ? 'iivari-sitting' : 'iivari-walking');
    if (!facingRight) dog.classList.add('iivari-flip');
  }

  // ── Random tail wag ──────────────────────────────────────────
  let wagTimeout = null;

  function scheduleWag() {
    clearTimeout(wagTimeout);
    wagTimeout = setTimeout(() => {
      if (state !== 'sitting') { scheduleWag(); return; }
      dog.classList.remove('iivari-wagging');
      void dog.offsetWidth; // force reflow to restart animation
      dog.classList.add('iivari-wagging');
    }, 1500 + Math.random() * 4000);
  }

  dog.addEventListener('animationend', (e) => {
    if (e.animationName === 'iivari-wag-cycle') {
      dog.classList.remove('iivari-wagging');
      scheduleWag();
    }
  });

  function exitAndReenter(newSide) {
    side    = newSide;
    posX    = newSide === 'left' ? -DOG_W_WALK - 10 : window.innerWidth + 10;
    targetX = getCorner();
    state   = 'running';
    speed   = 240;
    setFacing(newSide === 'left'); // face inward when entering
    dog.style.left = posX + 'px';
  }

  // Start: enter from left
  exitAndReenter('left');

  function loop(ts) {
    if (!lastTs) lastTs = ts;
    const dt = Math.min((ts - lastTs) / 1000, 0.05);
    lastTs = ts;

    if (state !== 'sitting') {
      const { contentLeft, contentRight, screenRight } = getEdges();
      const step    = speed * dt;
      const moveDir = targetX > posX ? 1 : -1;
      let   nextX   = posX + moveDir * step;

      setFacing(moveDir > 0);

      // ── Content boundary bounce ──────────────────────────────
      if (side === 'left' && nextX > contentLeft) {
        nextX   = contentLeft;
        targetX = state === 'fleeing' ? -DOG_W_WALK - 10 : getCorner();
      } else if (side === 'right' && nextX < contentRight) {
        nextX   = contentRight;
        targetX = state === 'fleeing' ? window.innerWidth + 10 : getCorner();
      }

      // ── Screen edge exit ─────────────────────────────────────
      if (nextX <= -DOG_W_WALK) {
        exitAndReenter('right');
        requestAnimationFrame(loop);
        return;
      }
      if (nextX >= window.innerWidth) {
        exitAndReenter('left');
        requestAnimationFrame(loop);
        return;
      }

      posX = nextX;
      dog.style.left = posX + 'px';

      // ── Arrived at target ────────────────────────────────────
      if (state === 'running' && Math.abs(posX - targetX) <= step) {
        posX    = targetX;
        dog.style.left = posX + 'px';
        state   = 'sitting';
        setFacing(side === 'left'); // face inward while sitting
        updateClasses();
        scheduleWag();
      }
    }

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);

  // ── Cursor proximity ─────────────────────────────────────────
  document.addEventListener('mousemove', (e) => {
    if (state !== 'sitting') return;
    const rect  = dog.getBoundingClientRect();
    const dogCX = rect.left + DOG_W_WALK / 2;
    const dogCY = rect.top  + 65;

    if (Math.hypot(e.clientX - dogCX, e.clientY - dogCY) < 120) {
      clearTimeout(wagTimeout);
      dog.classList.remove('iivari-wagging');
      state  = 'fleeing';
      speed  = 500;
      // Flee toward nearest screen edge (away from content)
      if (side === 'left') {
        targetX = -DOG_W_WALK - 10;
        setFacing(false);
      } else {
        targetX = window.innerWidth + 10;
        setFacing(true);
      }
      updateClasses();
    }
  });
}
