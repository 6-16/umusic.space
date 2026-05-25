

(function () {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let W, H, cols, rows, grid, nextGrid;
    const CELL = 6;

    function resize() {
        W = canvas.width  = window.innerWidth;
        H = canvas.height = window.innerHeight;
        cols = Math.ceil(W / CELL) + 2;
        rows = Math.ceil(H / CELL) + 2;
        grid     = new Uint8Array(cols * rows);
        nextGrid = new Uint8Array(cols * rows);
        for (let i = 0; i < grid.length; i++) {
            grid[i] = Math.random() < 0.28 ? 1 : 0;
        }
    }

    function idx(x, y) { return y * cols + x; }

    function step() {
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                let n = 0;
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        if (dx === 0 && dy === 0) continue;
                        const nx = (x + dx + cols) % cols;
                        const ny = (y + dy + rows) % rows;
                        n += grid[idx(nx, ny)];
                    }
                }
                const alive = grid[idx(x, y)];
                nextGrid[idx(x, y)] = (alive && (n === 2 || n === 3)) || (!alive && n === 3) ? 1 : 0;
            }
        }
        
        if (Math.random() < 0.04) {
            const cx = Math.floor(Math.random() * cols);
            const cy = Math.floor(Math.random() * rows);
            for (let dy = -3; dy <= 3; dy++) {
                for (let dx = -3; dx <= 3; dx++) {
                    const nx = (cx + dx + cols) % cols;
                    const ny = (cy + dy + rows) % rows;
                    nextGrid[idx(nx, ny)] = Math.random() < 0.5 ? 1 : 0;
                }
            }
        }
        const tmp = grid; grid = nextGrid; nextGrid = tmp;
    }

    let glitchTimer = 0, glitchActive = false;
    let glitchY = 0, glitchH = 0, glitchShift = 0;

    function draw() {
        ctx.clearRect(0, 0, W, H);

        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                if (!grid[idx(x, y)]) continue;
                const r = Math.random();
                ctx.fillStyle = r < 0.05 ? '#00ffcc22' : r < 0.15 ? '#00aaff18' : '#00aaff0a';
                ctx.fillRect(x * CELL, y * CELL, CELL - 1, CELL - 1);
            }
        }

        glitchTimer--;
        if (glitchTimer <= 0) {
            glitchTimer  = 30 + Math.floor(Math.random() * 120);
            glitchActive = Math.random() < 0.55;
            glitchY      = Math.floor(Math.random() * H);
            glitchH      = 2 + Math.floor(Math.random() * 18);
            glitchShift  = (Math.random() < 0.5 ? -1 : 1) * (4 + Math.floor(Math.random() * 40));
        }
        if (glitchActive) {
            const slice = ctx.getImageData(0, glitchY, W, glitchH);
            ctx.putImageData(slice, glitchShift, glitchY);
            ctx.fillStyle = 'rgba(0,170,255,0.06)';
            ctx.fillRect(0, glitchY, W, glitchH);
        }

        for (let i = 0; i < 6; i++) {
            ctx.fillStyle = Math.random() < 0.5 ? 'rgba(0,170,255,0.6)' : 'rgba(0,255,204,0.5)';
            ctx.fillRect(Math.floor(Math.random() * W), Math.floor(Math.random() * H), 1, 1);
        }

        if (Math.random() < 0.04) {
            const lx = Math.floor(Math.random() * W);
            ctx.strokeStyle = 'rgba(0,170,255,0.12)';
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(lx, 0); ctx.lineTo(lx, H); ctx.stroke();
        }
    }

    let frame = 0;
    function loop() {
        frame++;
        if (frame % 3 === 0) step();
        draw();
        requestAnimationFrame(loop);
    }

    window.addEventListener('resize', resize);
    resize();
    loop();
})();