import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Environment } from '@react-three/drei'
import type * as THREE from 'three'

function FloatingCube({
  position,
  scale,
  color,
  speed,
  orbitRadius,
  orbitSpeed,
}: {
  position: [number, number, number]
  scale: number
  color: string
  speed: number
  orbitRadius?: number
  orbitSpeed?: number
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  // eslint-disable-next-line react-hooks/purity
  const timeRef = useRef(Math.random() * Math.PI * 2)

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.001 * speed
      meshRef.current.rotation.y += 0.002 * speed

      if (orbitRadius && orbitSpeed) {
        timeRef.current += delta * orbitSpeed
        const baseX = position[0]
        const baseY = position[1]
        meshRef.current.position.x =
          baseX + Math.cos(timeRef.current) * orbitRadius
        meshRef.current.position.y =
          baseY + Math.sin(timeRef.current) * orbitRadius * 0.5
      }
    }
  })

  return (
    <Float
      speed={speed}
      rotationIntensity={0.5}
      floatIntensity={0.5}
      floatingRange={[-0.5, 0.5]}
    >
      <mesh ref={meshRef} position={position} scale={scale}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color={color}
          metalness={0.3}
          roughness={0.2}
          transparent
          opacity={0.8}
        />
      </mesh>
    </Float>
  )
}

function Scene() {
  return (
    <>
      <Environment preset='studio' />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <directionalLight position={[-10, -10, -5]} intensity={0.5} />

      <FloatingCube
        position={[-8, 2, -5]}
        scale={1.5}
        color='#6366f1'
        speed={1}
        orbitRadius={1.5}
        orbitSpeed={0.3}
      />
      <FloatingCube
        position={[8, -2, -7]}
        scale={1.2}
        color='#8b5cf6'
        speed={0.8}
        orbitRadius={1.2}
        orbitSpeed={0.4}
      />
      <FloatingCube
        position={[-9, -3, -10]}
        scale={1.8}
        color='#4f46e5'
        speed={0.6}
        orbitRadius={1.0}
        orbitSpeed={0.25}
      />
      <FloatingCube
        position={[9, 3, -8]}
        scale={1}
        color='#7c3aed'
        speed={1.2}
        orbitRadius={1.3}
        orbitSpeed={0.35}
      />
      <FloatingCube
        position={[-7, 5, -6]}
        scale={1.3}
        color='#6366f1'
        speed={0.9}
        orbitRadius={1.4}
        orbitSpeed={0.3}
      />
      <FloatingCube
        position={[7, -4, -9]}
        scale={1.1}
        color='#5b21b6'
        speed={1.1}
        orbitRadius={1.1}
        orbitSpeed={0.32}
      />
      <FloatingCube
        position={[10, 0, -12]}
        scale={1.6}
        color='#4f46e5'
        speed={0.7}
        orbitRadius={1.5}
        orbitSpeed={0.28}
      />
      <FloatingCube
        position={[-10, 1, -7]}
        scale={0.9}
        color='#8b5cf6'
        speed={1.3}
        orbitRadius={1.0}
        orbitSpeed={0.38}
      />
      <FloatingCube
        position={[-6, -5, -8]}
        scale={1.4}
        color='#6366f1'
        speed={0.85}
        orbitRadius={1.2}
        orbitSpeed={0.33}
      />
      <FloatingCube
        position={[6, 5, -11]}
        scale={1.1}
        color='#7c3aed'
        speed={1.15}
        orbitRadius={1.3}
        orbitSpeed={0.29}
      />
    </>
  )
}

export function AnimatedBackground() {
  return (
    <div className='absolute inset-0 z-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950'>
      <Canvas
        camera={{ position: [0, 0, 10], fov: 50 }}
        style={{ width: '100%', height: '100%' }}
      >
        <Scene />
      </Canvas>
    </div>
  )
}
