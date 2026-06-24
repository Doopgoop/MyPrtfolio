import * as THREE from "three";

/* ---------- Render dynamic content ---------- */
const games = [
  { title:"Arabianventure", desc:"A Professional Website in a corporate style.", tags:["WebGL","C#"], img:"assets/Arabianventure.png" },
  { title:"Virapaper", desc:"Professional portfolio website for company promotion", tags:["Steam","Unity"], img:"assets/Virapaper.png" },
];
const logs = [
  { date:"Oct 12, 2024", title:"Rethinking Raycasting for 2D Lighting" },
  { date:"Sep 28, 2024", title:"Designing Feedback for Pixel-Perfect Collisions" },
  { date:"Aug 15, 2024", title:"The Art of Screen Shake: Finding the Balance" },
];

const webBuilds = [
  {
    title: "Drive",
    desc: "simple 2d car driving game with unity partical and triggre based mechanics.",
    tags: ["Next.js", "Stripe"],
    video: "assets/Drive.mp4",
  },
  {
    title: "clean movement and Dash",
    desc: "Abstract momentum-based platformer set in a fracturing digital world.",
    tags: ["React", "D3"],
    video: "assets/MOvement.mp4",
  },
  {
    title: "SnowBoarding",
    desc: "3D portfolio builder running WebGL scenes inside a no-code editor.",
    tags: ["Three.js", "Vite"],
    video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
  },
];

document.getElementById("project-grid").innerHTML = games.map(g => `
  <article class="card">
    <div class="card-img"><img src="${g.img}" alt="${g.title} screenshot" loading="lazy" /></div>
    <div>
      <div class="card-tags">${g.tags.map(t=>`<span class="card-tag">${t}</span>`).join("")}</div>
      <h3>${g.title}</h3>
      <p>${g.desc}</p>
    </div>
  </article>
`).join("");

document.getElementById("webdev-grid").innerHTML = webBuilds.map(w => `
  <article class="video-card">
    <div class="video-wrap">
      <video src="${w.video}" autoplay muted loop playsinline preload="auto"></video>
      <div class="video-badge"><span class="live-dot"></span>Live Preview</div>
    </div>
    <div class="video-body">
      <div class="card-tags">${w.tags.map(t=>`<span class="card-tag">${t}</span>`).join("")}</div>
      <h3>${w.title}</h3>
      <p>${w.desc}</p>
    </div>
  </article>
`).join("");

// Ensure autoplay kicks in across browsers
document.querySelectorAll("#webdev-grid video").forEach(v => {
  v.muted = true;
  const p = v.play();
  if (p && p.catch) p.catch(()=>{});
});

document.getElementById("log-list").innerHTML = logs.map(l => `
  <article>
    <div>
      <time>${l.date}</time>
      <h4>${l.title}</h4>
    </div>
    <span class="arrow">→</span>
  </article>
`).join("");

/* ---------- Three.js interactive starfield ---------- */
const container = document.getElementById("starfield");
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x0a0a0a, 0.0008);

const camera = new THREE.PerspectiveCamera(75, innerWidth/innerHeight, 1, 3000);
camera.position.z = 600;

const renderer = new THREE.WebGLRenderer({ alpha:true, antialias:true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.setClearColor(0x000000, 0);
container.appendChild(renderer.domElement);

const STAR_COUNT = 2500;
const positions = new Float32Array(STAR_COUNT*3);
const colors = new Float32Array(STAR_COUNT*3);

const lime = new THREE.Color(0xbef264);
const cyan = new THREE.Color(0x22d3ee);
const white = new THREE.Color(0xffffff);

for (let i=0;i<STAR_COUNT;i++){
  positions[i*3]   = (Math.random()-0.5)*2400;
  positions[i*3+1] = (Math.random()-0.5)*2400;
  positions[i*3+2] = (Math.random()-0.5)*2000;
  const r = Math.random();
  const c = r<0.15 ? lime : r<0.3 ? cyan : white;
  colors[i*3]=c.r; colors[i*3+1]=c.g; colors[i*3+2]=c.b;
}

const geometry = new THREE.BufferGeometry();
geometry.setAttribute("position", new THREE.BufferAttribute(positions,3));
geometry.setAttribute("color", new THREE.BufferAttribute(colors,3));

// Circular soft star sprite
const cvs = document.createElement("canvas"); cvs.width = cvs.height = 64;
const ctx = cvs.getContext("2d");
const grd = ctx.createRadialGradient(32,32,0,32,32,32);
grd.addColorStop(0,"rgba(255,255,255,1)");
grd.addColorStop(.4,"rgba(255,255,255,.6)");
grd.addColorStop(1,"rgba(255,255,255,0)");
ctx.fillStyle = grd; ctx.fillRect(0,0,64,64);
const starTex = new THREE.CanvasTexture(cvs);

const material = new THREE.PointsMaterial({
  size:3, map:starTex, vertexColors:true,
  transparent:true, depthWrite:false,
  blending:THREE.AdditiveBlending, sizeAttenuation:true,
});

const stars = new THREE.Points(geometry, material);
scene.add(stars);

const mouse = { x:0, y:0 }, target = { x:0, y:0 };
addEventListener("pointermove", e => {
  target.x = (e.clientX/innerWidth - .5)*2;
  target.y = (e.clientY/innerHeight - .5)*2;
});
addEventListener("resize", () => {
  camera.aspect = innerWidth/innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

const clock = new THREE.Clock();
(function animate(){
  const t = clock.getElapsedTime();
  mouse.x += (target.x - mouse.x)*.05;
  mouse.y += (target.y - mouse.y)*.05;
  camera.position.x += (mouse.x*120 - camera.position.x)*.04;
  camera.position.y += (-mouse.y*120 - camera.position.y)*.04;
  camera.lookAt(scene.position);
  stars.rotation.y = t*.03 + mouse.x*.15;
  stars.rotation.x = t*.01 + mouse.y*.15;
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
})();
