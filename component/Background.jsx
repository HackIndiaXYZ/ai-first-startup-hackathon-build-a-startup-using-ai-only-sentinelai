"use client";

import { useEffect, useRef } from "react";

export default function Background() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        let animationFrame;

        // --------------------------------
        // MOUSE
        // --------------------------------

        const mouse = {
            x: null,
            y: null,
            radius: 160,
        };

        // --------------------------------
        // PARTICLES
        // --------------------------------

        const particles = [];

        // --------------------------------
        // CANVAS SIZE
        // --------------------------------

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        resizeCanvas();

        window.addEventListener("resize", resizeCanvas);

        // --------------------------------
        // MOUSE MOVEMENT
        // --------------------------------

        function handleMouseMove(event) {
            mouse.x = event.clientX;
            mouse.y = event.clientY;
        }

        function handleMouseLeave() {
            mouse.x = null;
            mouse.y = null;
        }

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseleave", handleMouseLeave);

        // --------------------------------
        // PARTICLE CLASS
        // --------------------------------

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;

                this.size = Math.random() * 1.8 + 0.5;

                this.speedX =
                    (Math.random() - 0.5) * 0.4;

                this.speedY =
                    (Math.random() - 0.5) * 0.4;
            }

            update() {

                // Move particle
                this.x += this.speedX;
                this.y += this.speedY;

                // Screen wrapping

                if (this.x < 0) {
                    this.x = canvas.width;
                }

                if (this.x > canvas.width) {
                    this.x = 0;
                }

                if (this.y < 0) {
                    this.y = canvas.height;
                }

                if (this.y > canvas.height) {
                    this.y = 0;
                }

                // -------------------------
                // MOUSE INTERACTION
                // -------------------------

                if (
                    mouse.x !== null &&
                    mouse.y !== null
                ) {
                    const dx =
                        this.x - mouse.x;

                    const dy =
                        this.y - mouse.y;

                    const distance =
                        Math.sqrt(
                            dx * dx +
                            dy * dy
                        );

                    if (
                        distance <
                        mouse.radius &&
                        distance > 0
                    ) {
                        const force =
                            (mouse.radius -
                                distance) /
                            mouse.radius;

                        this.x +=
                            (dx / distance) *
                            force *
                            1.5;

                        this.y +=
                            (dy / distance) *
                            force *
                            1.5;
                    }
                }
            }

            // -------------------------
            // DRAW PARTICLE
            // -------------------------

            draw() {
                ctx.beginPath();

                ctx.arc(
                    this.x,
                    this.y,
                    this.size,
                    0,
                    Math.PI * 2
                );

                ctx.fillStyle =
                    "rgba(255, 90, 0, 0.85)";

                ctx.fill();
            }
        }

        // --------------------------------
        // CREATE PARTICLES
        // --------------------------------

        const particleCount = Math.min(
            Math.floor(
                (canvas.width *
                    canvas.height) /
                    12000
            ),
            140
        );

        for (
            let i = 0;
            i < particleCount;
            i++
        ) {
            particles.push(
                new Particle()
            );
        }

        // --------------------------------
        // CONNECT PARTICLES
        // --------------------------------

        function connectParticles() {

            for (
                let a = 0;
                a < particles.length;
                a++
            ) {

                for (
                    let b = a + 1;
                    b < particles.length;
                    b++
                ) {

                    const dx =
                        particles[a].x -
                        particles[b].x;

                    const dy =
                        particles[a].y -
                        particles[b].y;

                    const distance =
                        Math.sqrt(
                            dx * dx +
                            dy * dy
                        );

                    const maxDistance = 120;

                    if (
                        distance <
                        maxDistance
                    ) {

                        const opacity =
                            1 -
                            distance /
                                maxDistance;

                        ctx.beginPath();

                        ctx.strokeStyle =
                            `rgba(255, 90, 0, ${
                                opacity * 0.25
                            })`;

                        ctx.lineWidth = 1;

                        ctx.moveTo(
                            particles[a].x,
                            particles[a].y
                        );

                        ctx.lineTo(
                            particles[b].x,
                            particles[b].y
                        );

                        ctx.stroke();
                    }
                }
            }
        }

        // --------------------------------
        // ANIMATION LOOP
        // --------------------------------

        function animate() {

            // PURE BLACK BACKGROUND

            ctx.fillStyle =
                "#000000";

            ctx.fillRect(
                0,
                0,
                canvas.width,
                canvas.height
            );

            // Update particles

            for (
                const particle
                of particles
            ) {

                particle.update();
                particle.draw();
            }

            // Connect nearby particles

            connectParticles();

            // Next frame

            animationFrame =
                requestAnimationFrame(
                    animate
                );
        }

        // Start animation

        animate();

        // --------------------------------
        // CLEANUP
        // --------------------------------

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
        };

    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 h-full w-full pointer-events-none"
        />
    );
}