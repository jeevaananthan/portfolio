const cursor = document.getElementById('cursor');
const body = document.body;
const effectsContainer = document.getElementById('click-effects');
const zones = document.querySelectorAll('.zone');

// RAIN EFFECT FOR JOHN WICK (Zone 2)
const canvas = document.getElementById('rain-canvas');
const ctx = canvas ? canvas.getContext('2d') : null;
if (ctx) {
    let drops = [];
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener('resize', resize);
    resize();
    for (let i = 0; i < 100; i++) drops.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, s: Math.random() * 5 + 5 });

    function animateRain() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#00f0ff'; // Cyan rain
        drops.forEach(d => {
            d.y += d.s;
            if (d.y > canvas.height) d.y = -10;
            ctx.fillRect(d.x, d.y, 1, 10);
        });
        requestAnimationFrame(animateRain);
    }
    animateRain();
}

// AUDIO CONTEXT FOR SOUND EFFECTS (No external files needed)
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();

function playSound(type) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    const now = audioCtx.currentTime;

    if (type === 'spiderman') {
        // "Thwip" - Noise burst approximated with rapid frequency sweep
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
        gainNode.gain.setValueAtTime(0.5, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
    } else if (type === 'johnwick') {
        // "Gunshot" - Sharp Triangle with decay
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(0.01, now + 0.1);
        gainNode.gain.setValueAtTime(1, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
    } else if (type === 'tennis') {
        // "Ball Hit" - Soft Pop
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.1);
        gainNode.gain.setValueAtTime(0.8, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
    }
}

// CURSOR & ZONE LOGIC
const updateCursorZone = () => {
    let activeZone = 'spiderman'; // Default
    const scrollY = window.scrollY || window.pageYOffset;
    const centerY = scrollY + (window.innerHeight / 2);

    zones.forEach(zone => {
        // We use offsetTop and offsetHeight for stable static checks relative to document
        // But getBoundingClientRect is better for viewport-relative interaction.
        // Let's stick to viewport center detection.
        const rect = zone.getBoundingClientRect();
        if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
            if (zone.classList.contains('zone-spiderman')) activeZone = 'spiderman';
            else if (zone.classList.contains('zone-johnwick')) activeZone = 'johnwick';
            else if (zone.classList.contains('zone-tennis')) activeZone = 'tennis';
        }
    });

    body.setAttribute('data-cursor', activeZone);
    body.setAttribute('data-active-zone', activeZone);
};

// Update on Scroll AND Mouse Move
window.addEventListener('scroll', updateCursorZone);
document.addEventListener('mousemove', (e) => {
    // Move Cursor
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';

    // Also check zone (redundant but safe)
    updateCursorZone();
});

// CLICK ANIMATIONS
document.addEventListener('click', (e) => {
    const type = body.getAttribute('data-cursor');
    playSound(type); // Play Sound

    const visual = document.createElement('div');
    visual.classList.add('click-anim');

    // Use pageX/Y to position relative to the document (safest for absolute positioning)
    visual.style.left = e.pageX + 'px';
    visual.style.top = e.pageY + 'px';

    if (type === 'spiderman') {
        visual.classList.add('click-web');
    } else if (type === 'johnwick') {
        visual.classList.add('muzzle-flash');
        document.body.style.transform = `translate(${Math.random() * 10 - 5}px, ${Math.random() * 10 - 5}px)`;
        setTimeout(() => document.body.style.transform = 'none', 50);
    } else if (type === 'tennis') {
        visual.classList.add('bounce-ball');
    }

    effectsContainer.appendChild(visual);
    setTimeout(() => visual.remove(), 1000);
});

// --- V7 NAVIGATION LOGIC ---
document.querySelectorAll('#main-nav a').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('data-target');
        const targetSection = document.getElementById(targetId);

        targetSection.scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Optional: Highlight active link based on scroll position (already tracked by mousemove, but could be enhanced)
const updateActiveNav = (zoneClass) => {
    // This could optionally update the active state of the nav links if needed
    // Currently, CSS handles the nav border color via body attributes
};
