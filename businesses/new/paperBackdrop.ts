type Contact = {
    x: number; y: number; clientX: number; clientY: number;
    vx: number; vy: number; at: number;
};
type Trail = Contact & { born: number };
type Grain = { x: number; y: number; vx: number; vy: number };
type QuietZone = { x: number; y: number; w: number; h: number };

const STRENGTH = .4;
const COLORS = [[130, 151, 180], [112, 140, 176], [150, 164, 185]];
const hash = (a: number, b = 0) => {
    const value = Math.sin(a * 127.1 + b * 311.7 + 8.7) * 43758.5453;
    return value - Math.floor(value);
};
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

/** The laboratory's grain renderer, with idle frames suspended and no lab UI. */
export function startPaperBackdrop(layer: HTMLDivElement) {
    const page = layer.parentElement;
    const canvas = layer.querySelector('canvas');
    const ctx = canvas?.getContext('2d');
    if (!page || !canvas || !ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const forced = window.matchMedia('(forced-colors: active)');
    const contacts = new Map<string, Contact>();
    const grains = new Map<string, Grain>();
    const trails: Trail[] = [];
    let quiet: QuietZone[] = [];
    let width = 0, height = 0, dpr = 1, energy = 0, wind = 0, time = 0;
    let frame: number | undefined, lastFrame = 0, scrollY = window.scrollY, lastWheel = 0;
    let disposed = false;

    function queue() {
        if (!disposed && !document.hidden && !forced.matches && frame === undefined) frame = requestAnimationFrame(render);
    }

    function makePaper() {
        const tile = document.createElement('canvas');
        tile.width = tile.height = 192;
        const paper = tile.getContext('2d');
        if (!paper) return;
        const data = paper.createImageData(192, 192);
        for (let i = 0; i < data.data.length; i += 4) {
            data.data[i] = 70; data.data[i + 1] = 99; data.data[i + 2] = 143;
            data.data[i + 3] = hash(i, 72) > .53 ? Math.round(12 + hash(i, 19) * 23) : 0;
        }
        paper.putImageData(data, 0, 0);
        layer.style.setProperty('--paper-noise', `url(${tile.toDataURL()})`);
    }

    function measure() {
        if (disposed) return;
        const b = layer.getBoundingClientRect();
        width = b.width;
        height = window.innerHeight + 96;
        dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        canvas!.width = Math.round(width * dpr);
        canvas!.height = Math.round(height * dpr);
        canvas!.style.height = `${height}px`;
        quiet = Array.from(page!.querySelectorAll('h1,h2,h3,[data-testid="hero-process"],a[class*="primary"],button')).map(el => {
            const r = el.getBoundingClientRect();
            return { x: r.left - b.left - 18, y: r.top - b.top - 12, w: r.width + 36, h: r.height + 24 };
        }).filter(r => r.w > 30 && r.h > 12);
        queue();
    }

    function track(id: string, x: number, y: number) {
        if (reduced.matches || forced.matches) return;
        const b = layer.getBoundingClientRect();
        if (x < b.left || x > b.right || y < Math.max(0, b.top) || y > b.bottom) {
            contacts.delete(id); return;
        }
        const old = contacts.get(id);
        const p = { x: x - b.left, y: y - b.top, clientX: x, clientY: y,
            vx: old ? clamp(x - b.left - old.x, -35, 35) : 0,
            vy: old ? clamp(y - b.top - old.y, -35, 35) : 0, at: performance.now() };
        contacts.set(id, p);
        if (!old || Math.hypot(p.x - old.x, p.y - old.y) > 7) {
            trails.push({ ...p, born: time });
            if (trails.length > 90) trails.shift();
        }
        queue();
    }

    function render(now: number) {
        frame = undefined;
        if (disposed || document.hidden || forced.matches || !width) return;
        if (now - lastFrame < 30) { queue(); return; }
        time += Math.min((now - lastFrame) / 1000 || .033, .06);
        lastFrame = now;
        const b = layer.getBoundingClientRect(), origin = Math.max(0, -b.top - 48);
        canvas!.style.top = `${origin}px`;
        ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx!.clearRect(0, 0, width, height);
        ctx!.translate(0, -origin);
        energy *= .94; wind *= .98;

        const fields: (Contact & { power: number })[] = [];
        if (!reduced.matches) {
            contacts.forEach((p, id) => {
                if (id === 'mouse' && now - p.at > 2200) { contacts.delete(id); return; }
                fields.push({ ...p, power: id === 'mouse' ? Math.max(.2, 1 - (now - p.at) / 2600) : 1 });
            });
            for (let i = trails.length - 1; i >= 0; i--) {
                const p = trails[i], age = time - p.born;
                if (age > 1.3) { trails.splice(i, 1); continue; }
                if (fields.length < 24) fields.push({ ...p, power: Math.pow(1 - age / 1.3, 2) * .13 });
            }
        }

        const visible = new Set<string>();
        let motion = 0;
        ctx!.globalAlpha = STRENGTH;
        for (let j = Math.floor((origin - 80) / 7); j < Math.ceil((origin + height + 80) / 7); j++) {
            for (let i = -4; i < width / 7 + 4; i++) {
                const seed = hash(i, j), x = i * 7 + hash(i + 7, j) * 7, y = j * 7 + hash(i, j + 11) * 7;
                let dx = 0, dy = 0;
                for (const p of fields) {
                    const ax = x - p.x, ay = y - p.y, d = Math.hypot(ax, ay);
                    const g = Math.exp(-d * d / (190 * 190 * .55)) * p.power;
                    dx += (ax / (d + 24) * 62 + p.vx * .6) * g;
                    dy += (ay / (d + 24) * 62 + p.vy * .6) * g;
                }
                const key = `${i},${j}`, p = grains.get(key) || { x: 0, y: 0, vx: 0, vy: 0 };
                if (reduced.matches) { p.x = p.y = p.vx = p.vy = 0; }
                else {
                    p.vx = (p.vx + (dx * STRENGTH + energy * Math.sin(y * .012 + time) * 30 - p.x) * .07) * .78;
                    p.vy = (p.vy + (dy * STRENGTH + wind * energy * 17 - p.y) * .07) * .78;
                    p.x += p.vx; p.y += p.vy;
                }
                grains.set(key, p); visible.add(key);
                motion = Math.max(motion, Math.abs(p.x), Math.abs(p.y), Math.abs(p.vx), Math.abs(p.vy));
                ctx!.fillStyle = `rgba(${COLORS[((i + j) % 3 + 3) % 3].join(',')},${.18 + seed * .16})`;
                const size = 1.4 + seed * 1.7;
                ctx!.fillRect(x + p.x, y + p.y, size, size);
            }
        }
        grains.forEach((_, key) => { if (!visible.has(key)) grains.delete(key); });

        ctx!.save();
        ctx!.globalCompositeOperation = 'destination-out';
        for (const r of quiet) {
            if (r.y + r.h < origin || r.y > origin + height) continue;
            ctx!.save();
            ctx!.translate(r.x + r.w / 2, r.y + r.h / 2);
            ctx!.scale(r.w / 2 + 30, r.h / 2 + 25);
            const gradient = ctx!.createRadialGradient(0, 0, .15, 0, 0, 1.2);
            gradient.addColorStop(0, 'rgba(0,0,0,.53)');
            gradient.addColorStop(.65, 'rgba(0,0,0,.36)');
            gradient.addColorStop(1, 'transparent');
            ctx!.fillStyle = gradient;
            ctx!.fillRect(-1.2, -1.2, 2.4, 2.4);
            ctx!.restore();
        }
        ctx!.restore(); ctx!.globalAlpha = 1;
        if (!reduced.matches && (contacts.size || trails.length || energy > .002 || motion > .02)) queue();
    }

    const pointer = (event: PointerEvent) => {
        if (event.pointerType !== 'touch') track('mouse', event.clientX, event.clientY);
    };
    const leave = () => { contacts.delete('mouse'); queue(); };
    const touch = (event: TouchEvent) => {
        for (const p of Array.from(event.changedTouches)) track(`touch${p.identifier}`, p.clientX, p.clientY);
    };
    const release = (event: TouchEvent) => {
        for (const p of Array.from(event.changedTouches)) contacts.delete(`touch${p.identifier}`);
        queue();
    };
    const impulse = (delta: number) => {
        if (reduced.matches || forced.matches) return;
        energy = clamp(energy + Math.abs(delta) * .003, 0, 1.3);
        wind = Math.sign(delta); queue();
    };
    const wheel = (event: WheelEvent) => {
        if (event.ctrlKey) return;
        lastWheel = performance.now();
        impulse(event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1));
    };
    const scroll = () => {
        const delta = window.scrollY - scrollY; scrollY = window.scrollY;
        if (performance.now() - lastWheel > 90) impulse(delta);
        const b = layer.getBoundingClientRect();
        contacts.forEach(p => { p.x = p.clientX - b.left; p.y = p.clientY - b.top; });
        queue();
    };
    const clear = () => {
        if (frame !== undefined) cancelAnimationFrame(frame);
        frame = undefined; contacts.clear(); trails.length = 0;
        energy = wind = 0; grains.clear(); lastFrame = 0;
        queue();
    };
    const resize = new ResizeObserver(measure);
    page.addEventListener('pointermove', pointer, { passive: true });
    page.addEventListener('pointerdown', pointer, { passive: true });
    page.addEventListener('pointerleave', leave);
    page.addEventListener('touchstart', touch, { passive: true });
    page.addEventListener('touchmove', touch, { passive: true });
    window.addEventListener('touchend', release, { passive: true });
    window.addEventListener('touchcancel', release, { passive: true });
    page.addEventListener('wheel', wheel, { passive: true });
    window.addEventListener('scroll', scroll, { passive: true });
    window.addEventListener('resize', measure, { passive: true });
    window.addEventListener('blur', clear);
    document.addEventListener('visibilitychange', clear);
    reduced.addEventListener('change', clear); forced.addEventListener('change', clear);
    makePaper(); measure(); resize.observe(page);
    document.fonts?.ready.then(measure);

    return () => {
        disposed = true;
        if (frame !== undefined) cancelAnimationFrame(frame);
        resize.disconnect();
        page.removeEventListener('pointermove', pointer);
        page.removeEventListener('pointerdown', pointer);
        page.removeEventListener('pointerleave', leave);
        page.removeEventListener('touchstart', touch);
        page.removeEventListener('touchmove', touch);
        window.removeEventListener('touchend', release);
        window.removeEventListener('touchcancel', release);
        page.removeEventListener('wheel', wheel);
        window.removeEventListener('scroll', scroll);
        window.removeEventListener('resize', measure);
        window.removeEventListener('blur', clear);
        document.removeEventListener('visibilitychange', clear);
        reduced.removeEventListener('change', clear); forced.removeEventListener('change', clear);
        contacts.clear(); grains.clear(); trails.length = 0;
    };
}
