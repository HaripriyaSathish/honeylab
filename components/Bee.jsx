"use client";
/*
  Realistic honey bee built in code (no model file needed).
  - fuzzy hair: ~1,600 tiny instanced hairs + "sheen" material for velvet look
  - abdomen: painted stripe texture (amber + dark brown bands)
  - glossy compound eyes, elbowed antennae, jointed legs with pollen baskets
  - transparent veined wings with rainbow (iridescent) shine
  Body points along +X (head at +X). Overall length ≈ 1.35 units.
*/
import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* ---------- textures painted on a canvas ---------- */
function useAbdomenTexture() {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 512;
    const g = c.getContext("2d");
    // top of canvas = front of abdomen (near thorax), bottom = tail
    const grad = g.createLinearGradient(0, 0, 0, 512);
    const amber = "#c98a1c";
    const dark = "#2a1607";
    const stops = [
      [0, "#d9a02b"], [0.16, amber], [0.22, dark], [0.33, dark], [0.38, amber],
      [0.47, amber], [0.52, dark], [0.63, dark], [0.67, "#a8701a"], [0.74, "#a8701a"],
      [0.78, dark], [1, "#1a0d04"],
    ];
    stops.forEach(([o, col]) => grad.addColorStop(o, col));
    g.fillStyle = grad;
    g.fillRect(0, 0, 256, 512);
    // fine hair noise
    for (let i = 0; i < 5000; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 512;
      g.strokeStyle = Math.random() > 0.5 ? "rgba(255,220,150,0.12)" : "rgba(0,0,0,0.15)";
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(x, y);
      g.lineTo(x + (Math.random() - 0.5) * 3, y + 4 + Math.random() * 4);
      g.stroke();
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);
}

const WING_PTS = {
  // outline of a fore-wing, root at (0,0), tip at x≈0.62
  outline: (s) => {
    s.moveTo(0, 0);
    s.bezierCurveTo(0.15, 0.09, 0.45, 0.11, 0.6, 0.045);
    s.bezierCurveTo(0.64, 0.0, 0.6, -0.05, 0.52, -0.06);
    s.bezierCurveTo(0.35, -0.075, 0.12, -0.05, 0, 0);
  },
  box: { minX: 0, maxX: 0.64, minY: -0.08, maxY: 0.11 },
};

function useWing() {
  return useMemo(() => {
    const shape = new THREE.Shape();
    WING_PTS.outline(shape);
    const geo = new THREE.ShapeGeometry(shape, 24);
    // remap UVs to 0..1 so the vein texture fits the wing
    const { minX, maxX, minY, maxY } = WING_PTS.box;
    const pos = geo.attributes.position;
    const uv = geo.attributes.uv;
    for (let i = 0; i < pos.count; i++) {
      uv.setXY(i, (pos.getX(i) - minX) / (maxX - minX), (pos.getY(i) - minY) / (maxY - minY));
    }
    uv.needsUpdate = true;

    // vein texture
    const W = 512, H = 160;
    const c = document.createElement("canvas");
    c.width = W;
    c.height = H;
    const g = c.getContext("2d");
    const P = (x, y) => [((x - minX) / (maxX - minX)) * W, (1 - (y - minY) / (maxY - minY)) * H];
    const path = (pts) => {
      g.beginPath();
      g.moveTo(...P(...pts[0]));
      pts.slice(1).forEach((p) => g.lineTo(...P(...p)));
      g.stroke();
    };
    // membrane
    g.fillStyle = "rgba(235,240,245,0.38)";
    g.beginPath();
    g.moveTo(...P(0, 0));
    g.bezierCurveTo(...P(0.15, 0.09), ...P(0.45, 0.11), ...P(0.6, 0.045));
    g.bezierCurveTo(...P(0.64, 0), ...P(0.6, -0.05), ...P(0.52, -0.06));
    g.bezierCurveTo(...P(0.35, -0.075), ...P(0.12, -0.05), ...P(0, 0));
    g.fill();
    // thick leading edge
    g.strokeStyle = "rgba(70,45,20,0.95)";
    g.lineWidth = 5;
    g.beginPath();
    g.moveTo(...P(0, 0));
    g.bezierCurveTo(...P(0.15, 0.09), ...P(0.45, 0.11), ...P(0.6, 0.045));
    g.stroke();
    // inner veins and cells
    g.lineWidth = 2.2;
    g.strokeStyle = "rgba(60,40,20,0.75)";
    path([[0, 0], [0.22, 0.03], [0.38, 0.05], [0.5, 0.06]]);
    path([[0, 0], [0.2, -0.015], [0.36, -0.01], [0.48, 0.0]]);
    path([[0.22, 0.03], [0.2, -0.015]]);
    path([[0.38, 0.05], [0.36, -0.01]]);
    path([[0.3, 0.075], [0.38, 0.05]]);
    path([[0.5, 0.06], [0.48, 0.0], [0.52, -0.06]]);
    path([[0.36, -0.01], [0.33, -0.07]]);
    path([[0.2, -0.015], [0.16, -0.05]]);
    // thin outline
    g.lineWidth = 1.5;
    g.strokeStyle = "rgba(60,40,20,0.5)";
    g.beginPath();
    g.moveTo(...P(0.6, 0.045));
    g.bezierCurveTo(...P(0.64, 0), ...P(0.6, -0.05), ...P(0.52, -0.06));
    g.bezierCurveTo(...P(0.35, -0.075), ...P(0.12, -0.05), ...P(0, 0));
    g.stroke();

    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return { geo, tex };
  }, []);
}

/* ---------- fuzzy hair (instanced) ---------- */
function Fur({ count, center, radius, scale = [1, 1, 1], len = [0.03, 0.07], colors, thickness = 0.006 }) {
  const ref = useRef();
  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const up = new THREE.Vector3(0, 1, 0);
    const c = new THREE.Color();
    const ctr = new THREE.Vector3(...center);
    for (let i = 0; i < count; i++) {
      const dir = new THREE.Vector3().randomDirection();
      const l = len[0] + Math.random() * (len[1] - len[0]);
      const p = new THREE.Vector3(dir.x * radius * scale[0], dir.y * radius * scale[1], dir.z * radius * scale[2]).add(ctr);
      const tilt = dir
        .clone()
        .add(new THREE.Vector3((Math.random() - 0.5) * 0.8, (Math.random() - 0.5) * 0.8, (Math.random() - 0.5) * 0.8))
        .normalize();
      q.setFromUnitVectors(up, tilt);
      p.addScaledVector(tilt, l * 0.45);
      m.compose(p, q, new THREE.Vector3(1, l, 1));
      ref.current.setMatrixAt(i, m);
      c.set(colors[(Math.random() * colors.length) | 0]).offsetHSL(0, 0, (Math.random() - 0.5) * 0.12);
      ref.current.setColorAt(i, c);
    }
    ref.current.instanceMatrix.needsUpdate = true;
    if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true;
  }, [count, center, radius, scale, len, colors]);

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      <cylinderGeometry args={[thickness * 0.25, thickness, 1, 4]} />
      <meshStandardMaterial roughness={0.85} />
    </instancedMesh>
  );
}

/* ---------- a body segment between two points (legs, antennae) ---------- */
const UP = new THREE.Vector3(0, 1, 0);
function Seg({ a, b, r = 0.014, color = "#24150a" }) {
  const { pos, quat, length } = useMemo(() => {
    const A = new THREE.Vector3(...a);
    const B = new THREE.Vector3(...b);
    const d = B.clone().sub(A);
    return {
      pos: A.clone().add(B).multiplyScalar(0.5),
      quat: new THREE.Quaternion().setFromUnitVectors(UP, d.clone().normalize()),
      length: d.length(),
    };
  }, [a, b]);
  return (
    <mesh position={pos} quaternion={quat}>
      <cylinderGeometry args={[r * 0.8, r, length, 8]} />
      <meshStandardMaterial color={color} roughness={0.5} />
    </mesh>
  );
}

/* ---------- animated legs ----------
   Each leg = 3 segments (femur, tibia, tarsus) between 4 joints: root -> knee -> ankle -> foot.
   Two poses are blended every frame:
     FLY   - legs hang down and back under the body (like a real bee in flight)
     STAND - legs spread out with the feet on the surface (y = -FOOT_Y)
   plus a tripod walking gait, a gentle dangle while flying and front-leg grooming. */
const LEG_FLY = [
  { root: [0.24, -0.12, 0.05], knee: [0.29, -0.21, 0.1], ankle: [0.25, -0.33, 0.11], foot: [0.21, -0.41, 0.1] },
  { root: [0.16, -0.14, 0.06], knee: [0.11, -0.23, 0.11], ankle: [0.02, -0.35, 0.12], foot: [-0.04, -0.43, 0.11] },
  { root: [0.08, -0.13, 0.06], knee: [-0.03, -0.23, 0.11], ankle: [-0.19, -0.37, 0.12], foot: [-0.3, -0.46, 0.11] },
];
const LEG_STAND = [
  { root: [0.24, -0.12, 0.05], knee: [0.34, -0.13, 0.17], ankle: [0.43, -0.27, 0.22], foot: [0.5, -0.36, 0.24] },
  { root: [0.16, -0.14, 0.06], knee: [0.16, -0.14, 0.23], ankle: [0.12, -0.28, 0.3], foot: [0.08, -0.36, 0.33] },
  { root: [0.08, -0.13, 0.06], knee: [-0.05, -0.14, 0.23], ankle: [-0.22, -0.28, 0.28], foot: [-0.33, -0.36, 0.29] },
];
const THORAX_COLORS = ["#c8922f", "#b07a22", "#8a5a18", "#d9a84a", "#6e4512"];
const HEAD_COLORS = ["#8a5a18", "#5c3a10", "#c8922f"];
const ABD_COLORS = ["#d9a84a", "#c8922f"];

const JOINTS = ["root", "knee", "ankle", "foot"];
const SEG_R = [0.016, 0.013, 0.007]; // femur, tibia, tarsus thickness
export const FOOT_Y = 0.36; // how far the feet reach below the body centre when standing

const _a = new THREE.Vector3();
const _d = new THREE.Vector3();

function placeSeg(mesh, a, b) {
  _d.subVectors(b, a);
  const len = _d.length();
  mesh.position.addVectors(a, b).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(UP, _d.divideScalar(len || 1));
  mesh.scale.set(1, len, 1);
}

function Legs({ motion }) {
  const segs = useRef([]); // [legIndex][segIndex] meshes, legIndex 0..5
  const baskets = useRef([]);
  const pts = useMemo(() => [0, 1, 2, 3].map(() => new THREE.Vector3()), []);
  const legMat = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: "#2e1c0c", roughness: 0.55, sheen: 0.6, sheenColor: new THREE.Color("#8a5a18") }),
    []
  );
  const pollenMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#f2b632", roughness: 0.95, emissive: "#5a3300", emissiveIntensity: 0.2 }),
    []
  );

  useFrame(({ clock }) => {
    const m = motion.current;
    const t = clock.getElapsedTime();
    const fly = 1 - m.rest;
    let n = 0;
    for (const side of [1, -1]) {
      for (let i = 0; i < 3; i++, n++) {
        const A = LEG_FLY[i];
        const B = LEG_STAND[i];
        JOINTS.forEach((j, k) => {
          pts[k].set(
            A[j][0] + (B[j][0] - A[j][0]) * m.rest,
            A[j][1] + (B[j][1] - A[j][1]) * m.rest,
            (A[j][2] + (B[j][2] - A[j][2]) * m.rest) * side
          );
        });
        // dangling in the air
        const sway = Math.sin(t * 3.1 + i * 1.7 + side) * 0.025 * fly;
        pts[2].x += sway * 0.6;
        pts[3].x += sway;
        pts[3].y += Math.cos(t * 2.3 + i) * 0.012 * fly;
        // tripod gait: front + hind of one side step together with the middle leg of the other side
        if (m.walkAmt > 0.01) {
          const phase = m.walkPhase + ((i + (side > 0 ? 0 : 1)) % 2) * Math.PI;
          const stride = Math.sin(phase) * 0.06 * m.walkAmt;
          const lift = Math.max(0, Math.cos(phase)) * 0.045 * m.walkAmt;
          pts[1].x += stride * 0.3;
          pts[2].x += stride * 0.7;
          pts[2].y += lift * 0.6;
          pts[3].x += stride;
          pts[3].y += lift;
        }
        // front legs clean the antennae now and then while sitting
        if (i === 0 && m.groom > 0.01) {
          const g = m.groom * (0.5 + 0.5 * Math.sin(t * 9 + side));
          pts[2].set(pts[2].x + 0.05 * g, pts[2].y + 0.16 * g, pts[2].z * (1 - 0.5 * g));
          pts[3].set(pts[3].x + 0.12 * g, pts[3].y + 0.3 * g, pts[3].z * (1 - 0.6 * g));
        }
        for (let k = 0; k < 3; k++) {
          const mesh = segs.current[n] && segs.current[n][k];
          if (mesh) placeSeg(mesh, pts[k], pts[k + 1]);
        }
        // pollen basket on the hind leg, grows as the bee collects pollen
        const bk = baskets.current[n];
        if (bk) {
          bk.visible = i === 2 && m.pollen > 0.02;
          _a.copy(pts[1]).lerp(pts[2], 0.6);
          bk.position.set(_a.x, _a.y, _a.z + 0.012 * side);
          bk.scale.setScalar(0.35 + m.pollen * 0.9);
        }
      }
    }
  });

  return (
    <group>
      {Array.from({ length: 6 }).map((_, n) => (
        <group key={n}>
          {SEG_R.map((r, k) => (
            <mesh
              key={k}
              material={legMat}
              ref={(el) => {
                segs.current[n] = segs.current[n] || [];
                segs.current[n][k] = el;
              }}
            >
              <cylinderGeometry args={[r * 0.75, r, 1, 8]} />
            </mesh>
          ))}
          <mesh ref={(el) => (baskets.current[n] = el)} material={pollenMat} visible={false}>
            <sphereGeometry args={[0.04, 16, 12]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ---------- pollen dust that puffs out while feeding on a flower ---------- */
const PUFFS = 28;
function PollenDust({ motion }) {
  const ref = useRef();
  const parts = useMemo(
    () => Array.from({ length: PUFFS }, () => ({ p: new THREE.Vector3(), v: new THREE.Vector3(), life: 0, max: 1 })),
    []
  );
  const tmp = useMemo(() => new THREE.Object3D(), []);
  useFrame((_, dt) => {
    const m = motion.current;
    parts.forEach((pt, i) => {
      pt.life -= dt;
      if (pt.life <= 0 && m.emit > 0.2 && Math.random() < m.emit * 0.25) {
        pt.max = pt.life = 0.8 + Math.random() * 0.8;
        pt.p.set(0.3 + Math.random() * 0.3, -0.3 + Math.random() * 0.1, (Math.random() - 0.5) * 0.4);
        pt.v.set((Math.random() - 0.5) * 0.3, 0.15 + Math.random() * 0.35, (Math.random() - 0.5) * 0.3);
      }
      const alive = pt.life > 0;
      if (alive) pt.p.addScaledVector(pt.v, dt);
      tmp.position.copy(pt.p);
      tmp.scale.setScalar(alive ? Math.sin((pt.life / pt.max) * Math.PI) : 0);
      tmp.updateMatrix();
      ref.current.setMatrixAt(i, tmp.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, PUFFS]} frustumCulled={false}>
      <sphereGeometry args={[0.014, 6, 6]} />
      <meshStandardMaterial color="#ffd54a" emissive="#c98a00" emissiveIntensity={0.6} roughness={1} />
    </instancedMesh>
  );
}

/* ---------- the bee ----------
   `motion` is a ref shared with BeeFlight:
     rest     0 = flying, 1 = standing (legs spread + wings folded)
     walkAmt  0..1 walking strength, walkPhase = gait clock
     groom    0..1 front legs cleaning antennae
     pollen   0..1 size of the pollen baskets
     emit     0..1 pollen dust while feeding */
export default function Bee({ motion }) {
  const pivots = [useRef(), useRef()];
  const ghosts = [useRef(), useRef()];
  const antennae = [useRef(), useRef()];
  const abdomen = useRef();
  const abdomenTex = useAbdomenTexture();
  const wing = useWing();

  const wingMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        map: wing.tex,
        transparent: true,
        roughness: 0.15,
        iridescence: 1,
        iridescenceIOR: 1.4,
        clearcoat: 1,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    [wing.tex]
  );
  const ghostMat = useMemo(() => {
    const m = wingMat.clone();
    m.opacity = 0.3;
    return m;
  }, [wingMat]);

  useFrame(({ clock }) => {
    const m = motion.current;
    const t = clock.getElapsedTime();
    const fly = 1 - m.rest;
    // flying: very fast beat + faint "ghost" wings at both ends of the stroke = motion-blur look
    // sitting: wings fold back flat over the abdomen with a small twitch now and then
    const beat = -0.3 + Math.sin(t * 60) * 0.7;
    const twitch = Math.pow(Math.max(0, Math.sin(t * 0.9)), 30) * 0.25;
    const flap = beat * fly + (0.35 + twitch) * m.rest;
    pivots.forEach((p, i) => {
      if (!p.current) return;
      p.current.rotation.x = flap;
      p.current.rotation.y = -0.7 * m.rest;
      if (ghosts[i].current) ghosts[i].current.visible = fly > 0.3;
    });
    wingMat.opacity = 0.9 + 0.1 * m.rest;
    ghostMat.opacity = 0.22 * fly;
    // breathing abdomen + antennae feeling around
    if (abdomen.current) {
      const breathe = 1 + Math.sin(t * 5) * 0.025;
      abdomen.current.scale.set(1, breathe, breathe);
      abdomen.current.rotation.z = -0.12 + Math.sin(t * 1.7) * 0.04 * m.rest - 0.12 * fly;
    }
    antennae.forEach((a, i) => {
      if (a.current) {
        a.current.rotation.z = Math.sin(t * 2.2 + i * 2) * 0.18;
        a.current.rotation.y = Math.sin(t * 1.6 + i) * 0.15;
      }
    });
  });

  const ghostWing = (rotX, key) => (
    <group key={key} rotation={[rotX, 0, 0]}>
      <group rotation={[0, -1.95, 0]}>
        <mesh geometry={wing.geo} material={ghostMat} rotation={[-Math.PI / 2, 0, 0]} />
      </group>
      <group position={[-0.08, -0.01, 0.01]} rotation={[0, -2.3, 0]} scale={0.62}>
        <mesh geometry={wing.geo} material={ghostMat} rotation={[-Math.PI / 2, 0, 0]} />
      </group>
    </group>
  );

  return (
    <group>
      {/* ---- abdomen ---- */}
      <group ref={abdomen} position={[-0.29, -0.04, 0]} rotation={[0, 0, -0.12]}>
        <mesh scale={[1, 1.45, 1]} rotation={[0, 0, -Math.PI / 2]}>
          <sphereGeometry args={[0.225, 64, 48]} />
          <meshPhysicalMaterial map={abdomenTex} roughness={0.6} sheen={0.35} sheenColor="#e8b04a" sheenRoughness={0.7} />
        </mesh>
        <Fur count={650} center={[0.2, 0, 0]} radius={0.215} scale={[0.5, 1, 1]} len={[0.012, 0.03]} colors={ABD_COLORS} thickness={0.0035} />
        {/* stinger */}
        <mesh position={[-0.34, -0.02, 0]} rotation={[0, 0, Math.PI / 2]}>
          <coneGeometry args={[0.02, 0.09, 12]} />
          <meshStandardMaterial color="#1a0d04" />
        </mesh>
      </group>

      {/* ---- petiole (waist) ---- */}
      <mesh position={[0.02, -0.01, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.05, 0.06, 0.08, 12]} />
        <meshStandardMaterial color="#3a2210" />
      </mesh>

      {/* ---- thorax: fuzzy golden ---- */}
      <mesh position={[0.18, 0.02, 0]}>
        <sphereGeometry args={[0.19, 48, 48]} />
        <meshPhysicalMaterial color="#7a4c15" roughness={0.8} sheen={1} sheenColor="#f0c060" sheenRoughness={0.5} />
      </mesh>
      <Fur count={2600} center={[0.18, 0.02, 0]} radius={0.185} len={[0.02, 0.05]} colors={THORAX_COLORS} thickness={0.0045} />

      {/* ---- head ---- */}
      <group position={[0.46, 0.0, 0]}>
        <mesh scale={[0.85, 1, 1.05]}>
          <sphereGeometry args={[0.15, 40, 40]} />
          <meshPhysicalMaterial color="#2a1708" roughness={0.6} sheen={0.6} sheenColor="#a8701a" />
        </mesh>
        <Fur count={600} center={[0.02, 0.02, 0]} radius={0.135} scale={[0.85, 1, 1]} len={[0.012, 0.03]} colors={HEAD_COLORS} thickness={0.0035} />
        {/* compound eyes */}
        {[1, -1].map((s) => (
          <mesh key={s} position={[0.03, 0.03, 0.105 * s]} rotation={[0.15 * s, 0, 0.25]} scale={[0.55, 1, 0.45]}>
            <sphereGeometry args={[0.1, 32, 32]} />
            <meshPhysicalMaterial color="#120a04" roughness={0.25} clearcoat={1} clearcoatRoughness={0.1} metalness={0.2} />
          </mesh>
        ))}
        {/* mouth parts */}
        <Seg a={[0.08, -0.1, 0]} b={[0.06, -0.2, 0]} r={0.012} color="#3a2210" />
      </group>

      {/* ---- antennae (elbowed, moving) ---- */}
      {[1, -1].map((s, i) => (
        <group key={s} ref={antennae[i]} position={[0.58, 0.06, 0.035 * s]}>
          <Seg a={[0, 0, 0]} b={[0.06, 0.08, 0.02 * s]} r={0.008} color="#1a0d04" />
          <Seg a={[0.06, 0.08, 0.02 * s]} b={[0.17, 0.09, 0.065 * s]} r={0.006} color="#1a0d04" />
        </group>
      ))}

      {/* ---- legs + pollen ---- */}
      <Legs motion={motion} />
      <PollenDust motion={motion} />

      {/* ---- wings (fore + hind on each side) ---- */}
      {[1, -1].map((side, i) => (
        <group key={side} scale={[1, 1, side]}>
          <group ref={pivots[i]} position={[0.2, 0.17, 0.07]} scale={1.3}>
            <group rotation={[0, -1.95, 0]}>
              <mesh geometry={wing.geo} material={wingMat} rotation={[-Math.PI / 2, 0, 0]} />
            </group>
            <group position={[-0.08, -0.01, 0.01]} rotation={[0, -2.3, 0]} scale={0.62}>
              <mesh geometry={wing.geo} material={wingMat} rotation={[-Math.PI / 2, 0, 0]} />
            </group>
          </group>
          {/* motion-blur copies at the top and bottom of the wing stroke */}
          <group ref={ghosts[i]} position={[0.2, 0.17, 0.07]} scale={1.3}>
            {ghostWing(-1.15, "a")}
            {ghostWing(0.45, "b")}
          </group>
        </group>
      ))}
    </group>
  );
}
