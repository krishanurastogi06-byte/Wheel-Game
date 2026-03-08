import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { gsap } from 'gsap';
import { COMPANY_COLORS, CONDITION_COLORS } from './constants';

const Wheel = forwardRef(({
    items,
    onSpinEnd,
    id,
    type,
}, ref) => {
    const wheelRef = useRef(null);
    const containerRef = useRef(null);
    const audioContextRef = useRef(null);


    const currentRotation = useRef(0);

    const COLORS = id === 'company' ? COMPANY_COLORS : CONDITION_COLORS;
    const POINTER_COLOR = id === 'company' ? '#005fb1ff' : '#d1a400ff';

    useImperativeHandle(ref, () => ({
        spin: (stopIndex) => {
            return playSpinAnimation(stopIndex);
        },
        reset: () => {
            currentRotation.current = 0;
            gsap.set(wheelRef.current, { rotation: 0, svgOrigin: "250 250" });
        }
    }));

    const initAudio = () => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }
    };

    const playTickSound = () => {
        initAudio();
        const ctx = audioContextRef.current;
        if (ctx.state === 'suspended') ctx.resume();

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // Soft triangle wave for a "tock" sound instead of "beep"
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.04);

        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.04);
    };

    const playDingSound = () => {
        initAudio();
        const ctx = audioContextRef.current;
        if (ctx.state === 'suspended') ctx.resume();

        // Multi-oscillator chime for a richer sound
        const osc1 = ctx.createOscillator(); // Fundamental
        const osc2 = ctx.createOscillator(); // Harmonic
        const gain = ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc1.frequency.exponentialRampToValueAtTime(261.63, ctx.currentTime + 1.2); // Drop to C4

        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1046.50, ctx.currentTime); // C6
        osc2.frequency.exponentialRampToValueAtTime(523.25, ctx.currentTime + 1.2); // Drop to C5

        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start();
        osc2.start();
        osc1.stop(ctx.currentTime + 1.2);
        osc2.stop(ctx.currentTime + 1.2);
    };

    const playSpinAnimation = (stopIndex) => {
        initAudio();

        const SEGMENT_COUNT = items.length || 1;
        const ANGLE_PER_SEGMENT = 360 / SEGMENT_COUNT;
        const stopAngle = stopIndex * ANGLE_PER_SEGMENT;
        const additionalSpins = Math.floor(5 + Math.random() * 5);
        const targetRotation = currentRotation.current + (additionalSpins * 360) + (360 - (currentRotation.current % 360)) + (360 - stopAngle);

        let lastTickAngle = currentRotation.current;

        return new Promise((resolve) => {
            gsap.to(wheelRef.current, {
                rotation: targetRotation,
                duration: 12,
                ease: "back.out(0.4)",
                svgOrigin: "250 250",
                onUpdate: function () {
                    const rotation = gsap.getProperty(wheelRef.current, "rotation");
                    if (Math.abs(rotation - lastTickAngle) >= ANGLE_PER_SEGMENT) {
                        playTickSound();
                        lastTickAngle = rotation;
                    }
                },
                onComplete: () => {
                    currentRotation.current = targetRotation;
                    playDingSound();
                    onSpinEnd(stopIndex);
                    resolve();
                }
            });
        });
    };

    const renderSegments = () => {
        const segments = [];
        const radius = 250;
        const centerX = 250;
        const centerY = 250;

        // FIX: Calculate count based on actual items provided
        const itemCount = items.length || 0;
        const angleStep = 360 / (itemCount || 1);

        for (let i = 0; i < itemCount; i++) {
            const item = items[i];
            if (!item) continue; // SAFETY: Skip if item is missing

            const startAngle = (i * angleStep - angleStep / 2) - 90;
            const endAngle = ((i + 1) * angleStep - angleStep / 2) - 90;

            const x1 = centerX + radius * Math.cos((startAngle * Math.PI) / 180);
            const y1 = centerY + radius * Math.sin((startAngle * Math.PI) / 180);
            const x2 = centerX + radius * Math.cos((endAngle * Math.PI) / 180);
            const y2 = centerY + radius * Math.sin((endAngle * Math.PI) / 180);

            const largeArcFlag = angleStep > 180 ? 1 : 0;
            const pathData = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

            const color = item.used ? "#111" : COLORS[i % COLORS.length];
            const textColor = "#fff";

            segments.push(
                <g key={i}>
                    <path
                        d={pathData}
                        fill={color}
                        stroke="#222"
                        strokeWidth="2"
                        style={{ transition: 'fill 0.5s ease' }}
                    />
                    <g transform={`rotate(${i * angleStep}, ${centerX}, ${centerY})`}>
                        <text
                            x={centerX}
                            y={centerY - radius + 20}
                            fill={textColor}
                            fontSize="10"
                            fontWeight="700"
                            textAnchor="start"
                            transform={`rotate(90, ${centerX}, ${centerY - radius + 20})`}
                            style={{
                                letterSpacing: '1px',
                                opacity: item.used || item.revealed ? 1 : 0.8,
                                userSelect: 'none',
                                textTransform: 'uppercase'
                            }}
                        >
                            {item.revealed ? item.label : "?"}
                        </text>
                    </g>
                </g>
            );
        }
        return segments;
    };

    return (
        <div className="wheel-container" ref={containerRef} style={{ position: 'relative' }}>
            <div className="wheel-label">{type} WHEEL</div>
            <div style={{ position: 'relative', width: '500px', height: '500px' }}>
                {/* Pointer */}
                <div style={{
                    position: 'absolute',
                    top: '-15px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '0',
                    height: '0',
                    borderLeft: '20px solid transparent',
                    borderRight: '20px solid transparent',
                    borderTop: `20px solid ${POINTER_COLOR}`,
                    zIndex: 20,
                    filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.5))'
                }} />

                {/* Wheel SVG */}
                <svg
                    viewBox="0 0 500 500"
                    width="500"
                    height="500"
                    style={{
                        filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.6))',
                        overflow: 'visible'
                    }}
                >
                    <defs>
                        <radialGradient id={`gloss-${id}`} cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                            <stop offset="0%" style={{ stopColor: 'rgba(255,255,255,0.15)', stopOpacity: 1 }} />
                            <stop offset="100%" style={{ stopColor: 'rgba(255,255,255,0)', stopOpacity: 1 }} />
                        </radialGradient>
                    </defs>

                    {/* Outer Ring - Static */}
                    <circle cx="250" cy="250" r="255" fill="#151515" />
                    <circle cx="250" cy="250" r="250" fill="#222" />

                    <g ref={wheelRef}>
                        {renderSegments()}
                    </g>

                    {/* Gloss Overlay - Static */}
                    <circle cx="250" cy="250" r="250" fill={`url(#gloss-${id})`} pointerEvents="none" />

                    {/* Inner Hub */}
                    <circle cx="250" cy="250" r="40" fill="#111" stroke="#333" strokeWidth="4" />
                    <circle cx="250" cy="250" r="35" fill="#222" />
                    <circle cx="250" cy="250" r="5" fill="#555" />
                </svg>
            </div>
        </div>
    );
});

export default Wheel;
