"use client";

import { useEffect, useRef } from "react";

export default function Background() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;

        if (!canvas) return;

        const ctx = canvas.getContext("2d");

        if (!ctx) return;

        let animationFrame;
        let resizeObserver;

        let width = 0;
        let height = 0;
        let previousHeight = 0;

        let dpr = 1;

        let particles = [];

        // ==================================================
        // CONFIGURATION
        // ==================================================

        const CONFIG = {
            // Approximate page area per particle.
            // Lower = more particles.
            particleArea: 7000,

            minParticles: 70,
            maxParticles: 420,

            // Particle size
            minSize: 0.8,
            maxSize: 2.4,

            // Particle movement
            minSpeed: 0.15,
            maxSpeed: 0.55,

            // Connection distance
            connectionDistance: 140,

            // Mouse interaction
            mouseRadius: 240,
            mouseForce: 2.0,

            // Small percentage of cyan nodes
            cyanChance: 0.055,

            // Randomness inside each distribution cell.
            // Keeps the network organic instead of looking
            // like a perfect grid.
            cellJitter: 0.32,

            // Don't create particles for tiny page
            // height changes.
            growthThreshold: 80,
        };

        // ==================================================
        // MOUSE
        // ==================================================

        const mouse = {
            x: null,
            y: null,
        };

        // ==================================================
        // RANDOM HELPER
        // ==================================================

        function random(min, max) {
            return (
                Math.random() *
                    (max - min) +
                min
            );
        }

        // ==================================================
        // PARTICLE COUNT
        // ==================================================

        function calculateParticleCount(
            targetWidth = width,
            targetHeight = height
        ) {
            const area =
                targetWidth *
                targetHeight;

            return Math.max(
                CONFIG.minParticles,
                Math.min(
                    CONFIG.maxParticles,
                    Math.floor(
                        area /
                            CONFIG.particleArea
                    )
                )
            );
        }

        // ==================================================
        // PARTICLE
        // ==================================================

        class Particle {
            constructor(x, y) {
                this.x = x;
                this.y = y;

                this.size = random(
                    CONFIG.minSize,
                    CONFIG.maxSize
                );

                const speed = random(
                    CONFIG.minSpeed,
                    CONFIG.maxSpeed
                );

                const angle =
                    Math.random() *
                    Math.PI *
                    2;

                this.speedX =
                    Math.cos(angle) *
                    speed;

                this.speedY =
                    Math.sin(angle) *
                    speed;

                this.isCyan =
                    Math.random() <
                    CONFIG.cyanChance;
            }

            update() {
                // ------------------------------------------
                // MOVEMENT
                // ------------------------------------------

                this.x += this.speedX;
                this.y += this.speedY;

                // ------------------------------------------
                // WRAP AROUND
                // ------------------------------------------

                if (this.x < 0) {
                    this.x = width;
                }

                if (this.x > width) {
                    this.x = 0;
                }

                if (this.y < 0) {
                    this.y = height;
                }

                if (this.y > height) {
                    this.y = 0;
                }

                // ------------------------------------------
                // MOUSE INTERACTION
                // ------------------------------------------

                if (
                    mouse.x !== null &&
                    mouse.y !== null
                ) {
                    const dx =
                        this.x -
                        mouse.x;

                    const dy =
                        this.y -
                        mouse.y;

                    const distance =
                        Math.sqrt(
                            dx * dx +
                                dy * dy
                        );

                    if (
                        distance <
                            CONFIG.mouseRadius &&
                        distance > 0
                    ) {
                        const force =
                            (CONFIG.mouseRadius -
                                distance) /
                            CONFIG.mouseRadius;

                        this.x +=
                            (dx /
                                distance) *
                            force *
                            CONFIG.mouseForce;

                        this.y +=
                            (dy /
                                distance) *
                            force *
                            CONFIG.mouseForce;
                    }
                }
            }

            draw() {
                ctx.beginPath();

                ctx.arc(
                    this.x,
                    this.y,
                    this.size,
                    0,
                    Math.PI * 2
                );

                ctx.fillStyle = this.isCyan
                    ? "rgba(0, 220, 255, 0.85)"
                    : "rgba(255, 90, 0, 0.82)";

                ctx.fill();
            }
        }

        // ==================================================
        // CREATE EVENLY DISTRIBUTED PARTICLES
        // ==================================================
        //
        // One particle is placed in each logical cell.
        //
        // This prevents:
        //
        // ❌ random clusters
        // ❌ huge empty areas
        //
        // while jitter prevents:
        //
        // ❌ obvious grid pattern
        //
        // ==================================================

        function createEvenParticles(
            count,
            regionTop,
            regionHeight
        ) {
            const result = [];

            if (
                count <= 0 ||
                regionHeight <= 0
            ) {
                return result;
            }

            const aspectRatio =
                width /
                Math.max(
                    regionHeight,
                    1
                );

            let columns = Math.ceil(
                Math.sqrt(
                    count *
                        aspectRatio
                )
            );

            columns = Math.max(
                1,
                columns
            );

            const rows = Math.ceil(
                count /
                    columns
            );

            const cellWidth =
                width /
                columns;

            const cellHeight =
                regionHeight /
                rows;

            for (
                let row = 0;
                row < rows;
                row++
            ) {
                for (
                    let column = 0;
                    column < columns;
                    column++
                ) {
                    if (
                        result.length >=
                        count
                    ) {
                        break;
                    }

                    // --------------------------------------
                    // CELL CENTER
                    // --------------------------------------

                    const centerX =
                        column *
                            cellWidth +
                        cellWidth / 2;

                    const centerY =
                        regionTop +
                        row *
                            cellHeight +
                        cellHeight / 2;

                    // --------------------------------------
                    // CONTROLLED RANDOM OFFSET
                    // --------------------------------------

                    const jitterX =
                        cellWidth *
                        CONFIG.cellJitter;

                    const jitterY =
                        cellHeight *
                        CONFIG.cellJitter;

                    let x =
                        centerX +
                        random(
                            -jitterX,
                            jitterX
                        );

                    let y =
                        centerY +
                        random(
                            -jitterY,
                            jitterY
                        );

                    // --------------------------------------
                    // KEEP INSIDE CANVAS
                    // --------------------------------------

                    x = Math.max(
                        2,
                        Math.min(
                            width - 2,
                            x
                        )
                    );

                    y = Math.max(
                        regionTop + 2,
                        Math.min(
                            regionTop +
                                regionHeight -
                                2,
                            y
                        )
                    );

                    result.push(
                        new Particle(
                            x,
                            y
                        )
                    );
                }
            }

            return result;
        }

        // ==================================================
        // INITIAL PARTICLES
        // ==================================================

        function buildInitialParticles() {
            const count =
                calculateParticleCount();

            particles =
                createEvenParticles(
                    count,
                    0,
                    height
                );
        }

        // ==================================================
        // ADD PARTICLES ONLY TO NEW BOTTOM AREA
        // ==================================================
        //
        // IMPORTANT:
        //
        // Existing particles are NOT moved.
        //
        // If page changes:
        //
        //       1000px
        //         ↓
        //       1800px
        //
        // new particles are created only in:
        //
        //       1000px → 1800px
        //
        // ==================================================

        function addParticlesToBottom(
            oldHeight,
            newHeight
        ) {
            const targetCount =
                calculateParticleCount(
                    width,
                    newHeight
                );

            const currentCount =
                particles.length;

            const additionalCount =
                targetCount -
                currentCount;

            if (
                additionalCount <= 0
            ) {
                return;
            }

            const growthHeight =
                newHeight -
                oldHeight;

            if (
                growthHeight <
                CONFIG.growthThreshold
            ) {
                return;
            }

            const newParticles =
                createEvenParticles(
                    additionalCount,
                    oldHeight,
                    growthHeight
                );

            particles.push(
                ...newParticles
            );
        }

        // ==================================================
        // REMOVE EXCESS PARTICLES
        // ==================================================

        function trimParticles() {
            const targetCount =
                calculateParticleCount();

            if (
                particles.length >
                targetCount
            ) {
                particles =
                    particles.slice(
                        0,
                        targetCount
                    );
            }
        }

        // ==================================================
        // SPATIAL GRID
        // ==================================================
        //
        // Instead of checking every particle against
        // every other particle, only nearby particles
        // are checked.
        //
        // Much better for long pages.
        //
        // ==================================================

        function createSpatialGrid() {
            const cellSize =
                CONFIG.connectionDistance;

            const grid =
                new Map();

            for (
                const particle of particles
            ) {
                const cellX =
                    Math.floor(
                        particle.x /
                            cellSize
                    );

                const cellY =
                    Math.floor(
                        particle.y /
                            cellSize
                    );

                const key =
                    `${cellX},${cellY}`;

                let cell =
                    grid.get(key);

                if (!cell) {
                    cell = [];

                    grid.set(
                        key,
                        cell
                    );
                }

                cell.push(
                    particle
                );
            }

            return {
                grid,
                cellSize,
            };
        }

        // ==================================================
        // CONNECT PARTICLES
        // ==================================================

        function connectParticles() {
            if (
                particles.length <
                2
            ) {
                return;
            }

            const {
                grid,
                cellSize,
            } = createSpatialGrid();

            const maxDistance =
                CONFIG.connectionDistance;

            const maxDistanceSquared =
                maxDistance *
                maxDistance;

            for (
                const [
                    key,
                    cellParticles,
                ] of grid
            ) {
                const [
                    cellX,
                    cellY,
                ] = key
                    .split(",")
                    .map(Number);

                // ------------------------------------------
                // CHECK ONLY NEIGHBORING CELLS
                // ------------------------------------------

                for (
                    let offsetX = -1;
                    offsetX <= 1;
                    offsetX++
                ) {
                    for (
                        let offsetY = -1;
                        offsetY <= 1;
                        offsetY++
                    ) {
                        const neighborKey =
                            `${cellX + offsetX},${
                                cellY + offsetY
                            }`;

                        const neighbors =
                            grid.get(
                                neighborKey
                            );

                        if (!neighbors) {
                            continue;
                        }

                        for (
                            const particleA of cellParticles
                        ) {
                            for (
                                const particleB of neighbors
                            ) {
                                if (
                                    particleA ===
                                    particleB
                                ) {
                                    continue;
                                }

                                // ----------------------------------
                                // Prevent duplicate connections.
                                // ----------------------------------

                                if (
                                    particleA.x >
                                    particleB.x
                                ) {
                                    continue;
                                }

                                if (
                                    particleA.x ===
                                        particleB.x &&
                                    particleA.y >
                                        particleB.y
                                ) {
                                    continue;
                                }

                                const dx =
                                    particleA.x -
                                    particleB.x;

                                const dy =
                                    particleA.y -
                                    particleB.y;

                                const distanceSquared =
                                    dx * dx +
                                    dy * dy;

                                if (
                                    distanceSquared >
                                    maxDistanceSquared
                                ) {
                                    continue;
                                }

                                const distance =
                                    Math.sqrt(
                                        distanceSquared
                                    );

                                const opacity =
                                    1 -
                                    distance /
                                        maxDistance;

                                ctx.beginPath();

                                const isCyan =
                                    particleA.isCyan ||
                                    particleB.isCyan;

                                ctx.strokeStyle =
                                    isCyan
                                        ? `rgba(0, 220, 255, ${
                                              opacity *
                                              0.14
                                          })`
                                        : `rgba(255, 90, 0, ${
                                              opacity *
                                              0.18
                                          })`;

                                ctx.lineWidth =
                                    0.7;

                                ctx.moveTo(
                                    particleA.x,
                                    particleA.y
                                );

                                ctx.lineTo(
                                    particleB.x,
                                    particleB.y
                                );

                                ctx.stroke();
                            }
                        }
                    }
                }
            }
        }

        // ==================================================
        // CANVAS RESIZE
        // ==================================================

        function resizeCanvas() {
            const documentElement =
                document.documentElement;

            const body =
                document.body;

            const newWidth =
                Math.max(
                    window.innerWidth,
                    documentElement.clientWidth
                );

            const newHeight =
                Math.max(
                    documentElement.scrollHeight,
                    body?.scrollHeight || 0,
                    window.innerHeight
                );

            const oldHeight =
                height;

            width = newWidth;
            height = newHeight;

            // ------------------------------------------
            // DEVICE PIXEL RATIO
            // ------------------------------------------

            dpr = Math.min(
                window.devicePixelRatio ||
                    1,
                1.5
            );

            canvas.width =
                Math.floor(
                    width * dpr
                );

            canvas.height =
                Math.floor(
                    height * dpr
                );

            canvas.style.width =
                `${width}px`;

            canvas.style.height =
                `${height}px`;

            ctx.setTransform(
                dpr,
                0,
                0,
                dpr,
                0,
                0
            );

            // ------------------------------------------
            // FIRST INITIALIZATION
            // ------------------------------------------

            if (
                particles.length === 0
            ) {
                buildInitialParticles();

                previousHeight =
                    height;

                return;
            }

            // ------------------------------------------
            // PAGE GREW
            // ------------------------------------------
            //
            // Existing particles stay where they are.
            // New particles are created ONLY below.
            //
            // ------------------------------------------

            if (
                height >
                oldHeight +
                    CONFIG.growthThreshold
            ) {
                addParticlesToBottom(
                    oldHeight,
                    height
                );
            }

            // ------------------------------------------
            // PAGE SHRANK
            // ------------------------------------------

            if (
                height <
                oldHeight
            ) {
                trimParticles();
            }

            previousHeight =
                height;
        }

        // ==================================================
        // MOUSE EVENTS
        // ==================================================

        function handleMouseMove(
            event
        ) {
            mouse.x =
                event.clientX;

            mouse.y =
                event.clientY +
                window.scrollY;
        }

        function handleMouseLeave() {
            mouse.x = null;
            mouse.y = null;
        }

        // ==================================================
        // ANIMATION
        // ==================================================

        function animate() {
            // ------------------------------------------
            // BACKGROUND
            // ------------------------------------------

            ctx.fillStyle =
                "#000000";

            ctx.fillRect(
                0,
                0,
                width,
                height
            );

            // ------------------------------------------
            // SUBTLE ORANGE AMBIENT GLOW
            // ------------------------------------------

            const glowRadius =
                Math.max(
                    width,
                    height
                ) *
                0.65;

            const glow =
                ctx.createRadialGradient(
                    width * 0.5,
                    height * 0.05,
                    0,
                    width * 0.5,
                    height * 0.05,
                    glowRadius
                );

            glow.addColorStop(
                0,
                "rgba(255, 90, 0, 0.055)"
            );

            glow.addColorStop(
                1,
                "rgba(255, 90, 0, 0)"
            );

            ctx.fillStyle =
                glow;

            ctx.fillRect(
                0,
                0,
                width,
                height
            );

            // ------------------------------------------
            // UPDATE
            // ------------------------------------------

            for (
                const particle of particles
            ) {
                particle.update();
            }

            // ------------------------------------------
            // CONNECTIONS
            // ------------------------------------------

            connectParticles();

            // ------------------------------------------
            // PARTICLES
            // ------------------------------------------

            for (
                const particle of particles
            ) {
                particle.draw();
            }

            animationFrame =
                requestAnimationFrame(
                    animate
                );
        }

        // ==================================================
        // INITIALIZE
        // ==================================================

        resizeCanvas();

        window.addEventListener(
            "resize",
            resizeCanvas
        );

        window.addEventListener(
            "mousemove",
            handleMouseMove,
            {
                passive: true,
            }
        );

        window.addEventListener(
            "mouseleave",
            handleMouseLeave
        );

        // ==================================================
        // WATCH DOCUMENT HEIGHT
        // ==================================================

        resizeObserver =
            new ResizeObserver(() => {
                resizeCanvas();
            });

        resizeObserver.observe(
            document.body
        );

        // ==================================================
        // START ANIMATION
        // ==================================================

        animate();

        // ==================================================
        // CLEANUP
        // ==================================================

        return () => {
            cancelAnimationFrame(
                animationFrame
            );

            window.removeEventListener(
                "resize",
                resizeCanvas
            );

            window.removeEventListener(
                "mousemove",
                handleMouseMove
            );

            window.removeEventListener(
                "mouseleave",
                handleMouseLeave
            );

            resizeObserver?.disconnect();
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="pointer-events-none absolute left-0 top-0 z-0"
            aria-hidden="true"
        />
    );
}