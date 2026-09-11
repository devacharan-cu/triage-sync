'use client';

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Mesh, Color } from 'three';
import { OrbitControls } from '@react-three/drei';

function HeartLattice({ severity }: { severity?: string }) {
  const meshRef = useRef<Mesh>(null);
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * (severity === 'CRITICAL' ? 1.5 : 0.5);
      meshRef.current.rotation.x += delta * 0.2;
      
      // Pulse effect
      const pulse = Math.sin(state.clock.elapsedTime * (severity === 'CRITICAL' ? 5 : 2)) * 0.05;
      meshRef.current.scale.setScalar(1 + pulse);
    }
  });

  const color = new Color(
    severity === 'CRITICAL' ? '#ef4444' : 
    severity === 'WARNING' ? '#f59e0b' : '#3b82f6'
  );

  return (
    <mesh ref={meshRef}>
      <octahedronGeometry args={[1.5, 2]} />
      <meshBasicMaterial color={color} wireframe />
    </mesh>
  );
}

export function Vitals3DModel({ severity }: { severity?: string }) {
  return (
    <div className="w-full h-48 sm:h-64 relative bg-[#0a0a0a] rounded-xl border border-neutral-800 overflow-hidden flex items-center justify-center">
      <div className="absolute top-2 left-2 text-xs font-mono text-neutral-500 z-10 select-none">
        HEART_LATTICE_SIM // {severity || 'NORMAL'}
      </div>
      <Canvas camera={{ position: [0, 0, 4] }}>
        <ambientLight intensity={0.5} />
        <HeartLattice severity={severity} />
        <OrbitControls enableZoom={false} autoRotate={false} />
      </Canvas>
      <div className="sr-only">
        3D visualization of patient vitals. Current severity: {severity || 'Normal'}.
      </div>
    </div>
  );
}
