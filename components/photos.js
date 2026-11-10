// Free photos from Unsplash (Unsplash License — free for commercial use, no attribution required).
// To use your own photos: put them in /public/images and change the paths here, e.g. "/images/jar.jpg".
const u = (id, w = 1200) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

export const PHOTOS = {
  heroJar: u("photo-1587049352851-8d4e89133924", 1000), // jar + dipper on golden cloth (2:3)
  honeycomb: u("photo-1642067958024-1a2d9f836920", 1600), // close-up honeycomb
  dipperJar: u("photo-1558642452-9d2a7deb7f62", 900), // dipper dripping into jar
  pouring: u("photo-1613548058193-1cd24c1bebcf", 900), // honey pouring from dipper
  darkJar: u("photo-1471943311424-646960669fbc", 900), // jar with flowers on dark table
  flower: u("photo-1706441691156-61278ea4e203", 2000), // pink cosmos in a sunny meadow (4:3, flower centre at 64% / 50%)
  tableJar: u("photo-1605880980331-20a711b27338", 900), // jar on wooden table (3:2)
  whiteJar: u("photo-1587049352824-f7e128d4ebe5", 900), // jar + dipper on white (2:3)
  flowersJar: u("photo-1679941279735-b3b35e8bc476", 900), // jar with flowers
  // product cards — real jar product shots
  productForest: u("photo-1645871317023-00ca188755de", 900), // hexagonal jar on wooden table
  productRaw: u("photo-1629240830845-e4a550a6bbde", 900), // open jar, honey pouring in (bee dives here)
  productFlower: u("photo-1684693342351-7e2a8ebebd97", 900), // jar, dipper and blossoms on yellow
  jarsShowcase: u("photo-1662577587843-6d04530f1092", 2000), // bright stacked jars with gold lids (Products showcase)
  honeycombDrip: u("photo-1718146921295-700b969e7c78", 1000), // honeycomb pieces dripping honey on beige (2:3) — Services feature
};
