import React, { useMemo, useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { CameraControls, Text, useTexture } from "@react-three/drei";
import { Box, Stack, Typography } from "@mui/material";

type FrameItem = {
  id: string;
  name: string;
  author: string;
  bg: string;
  position: [number, number, number];
  rotation: [number, number, number];
};

const FRAMES: FrameItem[] = [
  {
    id: "01",
    name: "Your\nHealth",
    author: "MedBook",
    bg: "#e8f0ff",
    position: [-1.2, 0, 0],
    rotation: [0, 0.45, 0],
  },
  {
    id: "02",
    name: "       is",
    author: "MedBook",
    bg: "#e7f9f1",
    position: [0, 0, 0],
    rotation: [0, 0, 0],
  },
  {
    id: "03",
    name: "Our\nPriority",
    author: "MedBook",
    bg: "#f3edff",
    position: [1.2, 0, 0],
    rotation: [0, -0.45, 0],
  },
];

function PortalScene({ isDark }: { isDark: boolean }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const controlsRef = useRef<any>(null);
  const { scene } = useThree();
  const defaultPosition = useMemo(() => new THREE.Vector3(0, 0, 3.2), []);
  const defaultTarget = useMemo(() => new THREE.Vector3(0, 0, 0), []);

  useEffect(() => {
    if (!controlsRef.current) return;
    if (!activeId) {
      controlsRef.current.setLookAt(
        defaultPosition.x,
        defaultPosition.y,
        defaultPosition.z,
        defaultTarget.x,
        defaultTarget.y,
        defaultTarget.z,
        true,
      );
      return;
    }

    const active = scene.getObjectByName(activeId) as THREE.Mesh | undefined;
    if (!active) return;

    const cameraPos = new THREE.Vector3(0, 0.35, 0.85);
    const focusPos = new THREE.Vector3(0, 0, -1.6);
    active.parent?.localToWorld(cameraPos);
    active.parent?.localToWorld(focusPos);

    controlsRef.current.setLookAt(
      cameraPos.x,
      cameraPos.y,
      cameraPos.z,
      focusPos.x,
      focusPos.y,
      focusPos.z,
      true,
    );
  }, [activeId, defaultPosition, defaultTarget, scene]);

  return (
    <>
      <ambientLight intensity={0.9} />
      <directionalLight position={[3, 4, 2]} intensity={1.1} />
      {FRAMES.map((frame) => (
        <PortalFrame
          key={frame.id}
          frame={frame}
          activeId={activeId}
          setActiveId={setActiveId}
          isDark={isDark}
        />
      ))}
      <CameraControls
        ref={controlsRef}
        makeDefault
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 2}
      />
    </>
  );
}

function PortalFrame({
  frame,
  activeId,
  setActiveId,
  isDark,
}: {
  frame: FrameItem;
  activeId: string | null;
  setActiveId: (id: string | null) => void;
  isDark: boolean;
}) {
  const isActive = activeId === frame.id;
  const cardTexture = useTexture("/img/animephoto.jpg");

  return (
    <group
      position={frame.position}
      rotation={frame.rotation}
      onDoubleClick={(e) => {
        e.stopPropagation();
        setActiveId(isActive ? null : frame.id);
      }}
    >
      <Text
        fontSize={0.18}
        anchorX="left"
        anchorY="top"
        lineHeight={1}
        position={[-0.42, 0.62, 0.03]}
        color="#000000"
      >
        {frame.name}
      </Text>
      <Text
        fontSize={0.06}
        anchorX="right"
        position={[0.42, -0.59, 0.03]}
        color={isDark ? "#93c5fd" : "#475569"}
      >
        /{frame.id}
      </Text>
      <Text
        fontSize={0.05}
        anchorX="right"
        position={[0.08, -0.69, 0.03]}
        color={isDark ? "#94a3b8" : "#64748b"}
      >
        {frame.author}
      </Text>

      <mesh name={frame.id}>
        <planeGeometry args={[1, 1.58]} />
        <meshStandardMaterial
          map={cardTexture}
          color={isDark ? "#cbd5e1" : "#ffffff"}
          side={THREE.DoubleSide}
        />
      </mesh>
      <group position={[0, 0, 0.05]}>
        <PortalContent variant={frame.id} />
      </group>
    </group>
  );
}

function PortalContent({ variant }: { variant: string }) {
  const spinRef = useRef<THREE.Mesh | null>(null);

  useFrame((_, dt) => {
    if (!spinRef.current) return;
    spinRef.current.rotation.y += dt * 0.6;
  });

  if (variant === "01") {
    return (
      <group position={[0, -0.12, -1.6]}>
        <mesh ref={spinRef}>
          <torusKnotGeometry args={[0.34, 0.1, 120, 20]} />
          <meshStandardMaterial color="#3b82f6" metalness={0.35} roughness={0.25} />
        </mesh>
      </group>
    );
  }

  if (variant === "02") {
    return (
      <group position={[0, -0.1, -1.8]}>
        <mesh ref={spinRef}>
          <octahedronGeometry args={[0.44, 0]} />
          <meshStandardMaterial color="#10b981" metalness={0.25} roughness={0.3} />
        </mesh>
      </group>
    );
  }

  return (
    <group position={[0, -0.05, -1.7]}>
      <mesh ref={spinRef}>
        <icosahedronGeometry args={[0.4, 0]} />
        <meshStandardMaterial color="#8b5cf6" metalness={0.28} roughness={0.28} />
      </mesh>
    </group>
  );
}

const PortalShowcase = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const wrap = document.getElementById("pc-wrap");
    if (!wrap) return;
    const updateTheme = () => setIsDark(wrap.classList.contains("theme-dark"));
    updateTheme();
    const observer = new MutationObserver(updateTheme);
    observer.observe(wrap, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return (
    <Stack className="portal-showcase">
      <Box className="portal-showcase-container">
        <Stack className="portal-showcase-header">
          <Typography className="portal-showcase-title">
            Interactive Health Portals
          </Typography>
          <Typography className="portal-showcase-subtitle">
            Double click any frame to zoom in
          </Typography>
        </Stack>
        <Box className="portal-canvas-box">
          <Canvas
            flat
            camera={{ fov: 75, position: [0, 0, 3.2] }}
            onPointerMissed={() => {
              // no-op: keeps canvas interactions smooth
            }}
          >
            <color attach="background" args={[isDark ? "#0f172a" : "#f0f4ff"]} />
            <PortalScene isDark={isDark} />
          </Canvas>
        </Box>
      </Box>
    </Stack>
  );
};

export default PortalShowcase;
