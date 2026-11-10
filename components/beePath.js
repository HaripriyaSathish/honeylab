/*
  Shared flight-path logic for the bee (used by the 3D bee AND the 2D backup bee).

  Every section has an invisible "landing spot":
    <div data-bee data-bee-scale="1" data-bee-face="1" data-bee-mode="hover" />
  data-bee-mode:
    hover     - bee hovers in the air at the spot (wings beating, legs hanging)
    pollinate - bee lands on the spot (a flower), walks around, dips its head and collects pollen
    perch     - bee sits on the spot (a jar rim), sips and cleans its antennae
    dive      - bee lands on the spot (a jar rim); scrolling further makes it dive into the jar

  Based on the middle of the screen, we find the two spots we are between and
  blend from one to the next:
    - rests on a spot for the first/last 25% of the way
    - in between it flies in an arc toward the camera (gets bigger) and toward screen centre
*/
const smooth = (t) => t * t * (3 - 2 * t);
const clamp01 = (t) => Math.min(1, Math.max(0, t));
const lerp = (a, b, t) => a + (b - a) * t;

export function getBeeTarget(width, height) {
  const spots = [...document.querySelectorAll("[data-bee]")].map((el) => {
    const r = el.getBoundingClientRect();
    return {
      x: r.left + r.width / 2,
      y: r.top + r.height / 2,
      s: parseFloat(el.dataset.beeScale || "1"),
      face: parseFloat(el.dataset.beeFace || "1"),
      mode: el.dataset.beeMode || "hover",
    };
  });
  if (!spots.length) return null;

  const mid = height * 0.5;
  const last = spots[spots.length - 1];
  let a = spots[0], b = spots[0], t = 0;
  if (mid >= last.y) {
    a = b = last;
  } else if (mid > spots[0].y) {
    for (let i = 0; i < spots.length - 1; i++) {
      if (mid >= spots[i].y && mid <= spots[i + 1].y) {
        a = spots[i];
        b = spots[i + 1];
        t = (mid - a.y) / (b.y - a.y);
        break;
      }
    }
  }

  const e = smooth(clamp01((t - 0.25) / 0.5));
  const arc = Math.sin(Math.PI * e); // 0 when resting, 1 halfway

  const baseX = lerp(a.x, b.x, e);
  const x = baseX + arc * (width * 0.5 - baseX) * 0.3;
  const y = lerp(a.y, b.y, e);
  const basePx = Math.min(200, width * 0.36); // bee length in px at scale 1
  const size = lerp(a.s, b.s, e) * (1 + arc * 0.5) * basePx; // grows a little mid-flight (closer to camera)

  const spot = e < 0.5 ? a : b;
  // how settled the bee is on its spot: 1 = sitting still, 0 = in flight
  const settled = 1 - clamp01(arc * 3);
  // dive progress: only after the last spot, as the user keeps scrolling past it
  const dive = a === last && last.mode === "dive" ? clamp01((mid - last.y) / (height * 0.35)) : 0;

  return { x, y, size, arc, face: spot.face, mode: spot.mode, settled, dive };
}
