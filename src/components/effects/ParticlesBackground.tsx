// src/components/effects/ParticlesBackground.tsx
"use client";

import React, { useEffect, useState } from 'react';

const ParticlesBackground: React.FC = () => {
  const [particleElements, setParticleElements] = useState<React.JSX.Element[]>([]);

  useEffect(() => {
    const numParticles = 50; // Number of particles
    const newElements: React.JSX.Element[] = [];

    for (let i = 0; i < numParticles; i++) {
      // Determine particle type: only circular dot particles
      const particleTypeClass = `p${Math.floor(Math.random() * 3) + 1}`; // p1, p2, or p3 for dots

      const style: React.CSSProperties = {
        left: `${Math.random() * 100}%`, // Random horizontal start position
        animationDelay: `${Math.random() * 12}s`, // Random delay for staggered animation
      };
      
      newElements.push(
        <div key={`particle-${i}`} className={`particle ${particleTypeClass}`} style={style} />
      );
    }
    setParticleElements(newElements);
  }, []); // Empty dependency array ensures this runs once on client-mount

  // Render particles only on the client side after they've been generated
  if (particleElements.length === 0) {
    return null; // Or a non-visible placeholder to avoid layout shifts if necessary
  }

  return <div className="particle-container">{particleElements}</div>;
};

export default ParticlesBackground;
