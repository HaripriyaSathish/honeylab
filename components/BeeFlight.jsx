"use client";
/*
  THE MAIN ANIMATION (3D version)
  One 3D bee lives in a full-screen transparent canvas fixed on top of the page.
  It follows the landing spots using the shared path in beePath.js and acts out
  each spot's mode:
    hover     - hovers, legs dangling, wings beating
    pollinate - lands on the flower, walks around it, dips its head to feed,
                pollen puffs out and the pollen baskets on its hind legs grow
    dive      - lands on the jar rim and feeds; scrolling further makes it
                lift off, tip nose-down and dive into the jar with a honey splash
*/
import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import Bee, { FOOT_Y } from "./Bee";
import { getBeeTarget } from "./beePath";

const BEE_LENGTH = 1.35; // world units of the Bee model at scale 1
const { damp, clamp, smoothstep } = THREE.MathUtils;

// damp an angle the short way round
function dampAngle(cur, target, k, dt) {
  let diff = ((target - cur + Math.PI) % (Math.PI * 2)) - Math.PI;
  if (diff < -Math.PI) diff += Math.PI * 2;
  return cur + diff * (1 - Math.exp(-k * dt));
}

/* golden droplets that jump out of the jar when the bee dives in */
const DROPS = 14;
function HoneySplash({ splash }) {
  const ref = useRef();
  const tmp = useMemo(() => new THREE.Object3D(), []);
  const dirs = useMemo(
    () => Array.from({ length: DROPS }, () => ({ vx: (Math.random() - 0.5) * 2.2, vy: 1.6 + Math.random() * 1.8, r: 0.5 + Math.random() * 0.7 })),
    []
  );
  useFrame(({ clock }) => {
    const sp = splash.current;
    const age = clock.getElapsedTime() - sp.t;
    dirs.forEach((d, i) => {
      const alive = sp.t > 0 && age < 1.1;
      tmp.position.set(sp.x + d.vx * age * sp.size, sp.y + (d.vy * age - 4.5 * age * age) * sp.size, sp.z);
      tmp.scale.setScalar(alive ? d.r * sp.size * 0.06 * (1 - age / 1.1) : 0);
      tmp.updateMatrix();
      ref.current.setMatrixAt(i, tmp.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, DROPS]} frustumCulled={false}>
      <sphereGeometry args={[1, 16, 12]} />
      <meshPhysicalMaterial color="#f0a516" roughness={0.1} clearcoat={1} transmission={0.2} thickness={0.5} />
    </instancedMesh>
  );
}

function FlyingBee() {
  const outer = useRef();
  const bob = useRef();
  const { viewport, size, gl } = useThree();
  const st = useRef({ x: 0, y: 0, z: 0, s: 0, rotY: -0.5, rotZ: 0, ready: false, px: 0, py: 0, walkAngle: 0, splashed: false });
  const motion = useRef({ rest: 0, walkAmt: 0, walkPhase: 0, groom: 0, pollen: 0, emit: 0 });
  const splash = useRef({ t: -10, x: 0, y: 0, z: 0, size: 1 });
  // horizontal clipping plane at the jar mouth: everything below it is hidden while diving
  const clip = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 1e5), []);
  useMemo(() => {
    gl.clippingPlanes = [clip];
  }, [gl, clip]);

  useFrame(({ clock }, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const target = getBeeTarget(size.width, size.height);
    if (!target) return;
    const time = clock.getElapsedTime();
    const s = st.current;
    const m = motion.current;

    const unitsPerPx = viewport.width / size.width;
    const wx = (target.x / size.width - 0.5) * viewport.width;
    const wy = -(target.y / size.height - 0.5) * viewport.height;
    const scale = (target.size * unitsPerPx) / BEE_LENGTH;
    const len = scale * BEE_LENGTH;

    if (!s.ready) {
      // first frame: start off-screen top-right so the bee "flies in" on page load
      s.x = viewport.width * 0.7;
      s.y = viewport.height * 0.7;
      s.s = scale * 0.5;
      s.ready = true;
    }

    const lands = target.mode === "pollinate" || target.mode === "dive" || target.mode === "perch";
    const settled = target.settled; // 1 = parked on the spot
    const dive = target.dive;
    const lift = smoothstep(dive, 0, 0.3); // take off from the rim
    const sink = smoothstep(dive, 0.3, 1); // go down into the jar

    // ---- how the body is posed (0 flying .. 1 standing) ----
    const restTarget = lands ? settled * (1 - lift) : 0;
    m.rest = damp(m.rest, restTarget, 6, dt);

    // ---- behaviour while parked ----
    let ox = 0, oy = 0, oz = 0, pitch = 0, heading = null;
    let walkAmt = 0, emit = 0, groom = 0;
    if (target.mode === "pollinate" && settled > 0.6) {
      // feeding moments: the bee stops, dips its head into the flower and pollen puffs out
      const feed = Math.pow(Math.max(0, Math.sin(time * 0.9)), 6);
      walkAmt = (1 - feed) * settled;
      emit = feed * settled;
      s.walkAngle += dt * 0.55 * walkAmt;
      m.walkPhase += dt * 10 * walkAmt;
      m.pollen = Math.min(1, m.pollen + feed * dt * 0.12);
      pitch = -0.35 * feed;
      // walk in a small circle around the flower centre
      const R = 0.06 * len;
      ox = Math.cos(s.walkAngle) * R;
      oz = Math.sin(s.walkAngle) * R;
      oy = -oz * 0.35; // looking slightly down onto the flower
      heading = Math.atan2(-Math.cos(s.walkAngle), -Math.sin(s.walkAngle));
    } else if (target.mode === "dive" || target.mode === "perch") {
      // on the rim: dip into the honey, clean antennae
      const sip = Math.pow(Math.max(0, Math.sin(time * 0.8)), 4) * settled * (1 - lift);
      groom = Math.pow(Math.max(0, Math.sin(time * 0.8 + 2.4)), 6) * settled * (1 - lift);
      pitch = -0.3 * sip;
      // dive: rise above the mouth, tip nose-down, drop in
      oy += lift * 0.45 * len - sink * 1.4 * len;
      pitch += -1.25 * lift;
    }
    m.walkAmt = damp(m.walkAmt, walkAmt, 8, dt);
    m.emit = damp(m.emit, emit, 8, dt);
    m.groom = damp(m.groom, groom, 6, dt);

    // stand the bee on its feet when landed
    oy += FOOT_Y * scale * m.rest;

    // ---- follow the target ----
    const k = 5;
    s.x = damp(s.x, wx + ox, k, dt);
    s.y = damp(s.y, wy + oy, k, dt);
    s.z = damp(s.z, target.arc * 1.5 + oz, k, dt);
    s.s = damp(s.s, scale * (1 - sink * 0.15), k, dt);

    // face the flying direction, otherwise the spot's preferred side
    const vx = (s.x - s.px) / Math.max(dt, 1e-3);
    const vy = (s.y - s.py) / Math.max(dt, 1e-3);
    s.px = s.x;
    s.py = s.y;
    const face = Math.abs(vx) > 0.6 && m.rest < 0.5 ? Math.sign(vx) : target.face;
    const rotTarget = heading !== null ? heading : face > 0 ? -0.55 : Math.PI + 0.55; // 3/4 view toward camera
    s.rotY = dampAngle(s.rotY, rotTarget, 4, dt);
    s.rotZ = damp(s.rotZ, clamp(vy * 0.08, -0.5, 0.5) * (1 - m.rest), 4, dt);

    outer.current.position.set(s.x, s.y, s.z);
    outer.current.scale.setScalar(s.s);
    outer.current.rotation.set(0, s.rotY, s.rotZ);

    // hover bob while flying, still while standing; pitch = nose down to feed / dive
    const fly = 1 - m.rest;
    bob.current.position.y = Math.sin(time * 4) * (0.04 + target.arc * 0.08) * fly;
    bob.current.rotation.x = Math.sin(time * 2) * 0.08 * fly;
    bob.current.rotation.z = damp(bob.current.rotation.z, pitch, 6, dt);

    // ---- jar dive: clip at the mouth + splash when the bee goes in ----
    if (target.mode === "dive" && dive > 0.25) {
      clip.constant = -wy; // keep only what is above the jar mouth
      const inside = s.y < wy + 0.1 * len;
      if (inside && !s.splashed) {
        splash.current = { t: time, x: wx, y: wy, z: 0.2, size: len };
      }
      s.splashed = inside;
    } else {
      clip.constant = 1e5;
      s.splashed = false;
    }
  });

  return (
    <>
      <group ref={outer}>
        <group ref={bob}>
          <Bee motion={motion} />
        </group>
      </group>
      <HoneySplash splash={splash} />
    </>
  );
}

export default function BeeFlight() {
  return (
    <div className="pointer-events-none fixed inset-0 z-40">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 35 }}
        dpr={[1, 2]}
        gl={{ alpha: true, localClippingEnabled: true }}
        style={{ pointerEvents: "none" }} // the bee is decoration only — never block clicks on the page below
      >
        {/* photo-style lighting: warm key light, soft fill, strong back/rim light to make the fur glow */}
        <ambientLight intensity={0.35} />
        <directionalLight position={[3, 5, 6]} intensity={2.4} color="#fff1d6" />
        <directionalLight position={[-5, 1, 2]} intensity={0.5} color="#ffcf80" />
        <directionalLight position={[-2, 4, -6]} intensity={3} color="#ffe2a8" />
        <Environment resolution={256}>
          <Lightformer intensity={2.5} position={[0, 5, -5]} scale={[10, 5, 1]} color="#fff6d8" />
          <Lightformer intensity={1.2} position={[-5, 0, 2]} rotation-y={Math.PI / 2} scale={[6, 3, 1]} color="#ffcc66" />
          <Lightformer intensity={0.8} position={[5, -2, 3]} rotation-y={-Math.PI / 2} scale={[6, 3, 1]} color="#ffffff" />
        </Environment>
        <FlyingBee />
      </Canvas>
    </div>
  );
}
