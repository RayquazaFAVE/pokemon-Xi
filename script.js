const overworld = document.getElementById("overworld");
const exploration = document.getElementById("exploration");
const tileMap = document.getElementById("tile-map");
const mapStatus = document.getElementById("map-status");
const areaMessage = document.getElementById("area-message");
const areaName = document.getElementById("area-name");
let currentNode = "start";
let player = { x: 1, y: 1 };
let activeArea = null;

const nodes = {
  start: { label: "Start", type: "start", next: ["b1", "w1", "s1"] },
  b1: { label: "Trainer", type: "battle", next: ["w2", "b2"] },
  w1: { label: "Forest", type: "wild", next: ["b2", "b3", "w3"] },
  s1: { label: "Rest stop", type: "special", next: ["w3", "s2"] },
  w2: { label: "Meadow", type: "wild", next: ["b4"] },
  b2: { label: "Trainer", type: "battle", next: ["b4", "w4"] },
  b3: { label: "Rival", type: "battle", next: ["w4", "b5"] },
  w3: { label: "Lake", type: "wild", next: ["b5"] },
  s2: { label: "Cache", type: "special", next: ["b5"] },
  b4: { label: "Trainer", type: "battle", next: ["boss"] },
  w4: { label: "Cave", type: "wild", next: ["boss"] },
  b5: { label: "Elite trainer", type: "battle", next: ["boss"] },
  boss: { label: "Boss", type: "boss", next: [] }
};
const areas = {
  w1: { name: "Whispering Forest", theme: "forest" },
  w2: { name: "Open Meadow", theme: "meadow" },
  w3: { name: "Quiet Lakeside", theme: "lake" },
  w4: { name: "Echo Cave", theme: "cave" }
};
const width = 12, height = 8;
let grid = [];

function makeArea(theme) {
  const map = Array.from({ length: height }, (_, y) =>
    Array.from({ length: width }, (_, x) => {
      if (x === 0 || y === 0 || x === width - 1 || y === height - 1) return "tree";
      if (theme === "lake" && x > 7 && y > 2) return "water";
      if (theme === "cave" && (x === 4 && y > 1 && y < 6)) return "rock";
      if (theme === "meadow") return Math.random() < .22 ? "grass" : "path";
      if (Math.random() < .13) return "tree";
      if (Math.random() < .20) return "grass";
      return "path";
    })
  );
  // Keep a walkable route through the middle of each area.
  for (let x = 1; x < width - 1; x++) map[4][x] = "path";
  for (let y = 1; y < height - 1; y++) map[y][1] = "path";
  map[1][1] = "path";
  return map;
}
function renderGrid() {
  tileMap.innerHTML = "";
  grid.forEach((row, y) => row.forEach((type, x) => {
    const tile = document.createElement("div");
    tile.className = "tile " + type + (player.x === x && player.y === y ? " player" : "");
    tile.setAttribute("role", "gridcell");
    tileMap.appendChild(tile);
  }));
}
function enterArea(id) {
  activeArea = id;
  player = { x: 1, y: 1 };
  grid = makeArea(areas[id].theme);
  areaName.textContent = areas[id].name;
  areaMessage.textContent = "You entered " + areas[id].name + ". Look around for wild Pokémon!";
  overworld.classList.add("hidden");
  exploration.classList.remove("hidden");
  document.getElementById("section-kicker").textContent = "WILD AREA";
  document.getElementById("section-title").textContent = "Explore the area";
  mapStatus.textContent = "WASD or arrow keys to move.";
  renderGrid();
}
function leaveArea() {
  activeArea = null;
  exploration.classList.add("hidden");
  overworld.classList.remove("hidden");
  document.getElementById("section-kicker").textContent = "YOUR JOURNEY";
  document.getElementById("section-title").textContent = "Choose your path";
  mapStatus.textContent = "Choose a connected location to continue.";
}
function visitNode(id) {
  const node = nodes[id];
  if (!node || !nodes[currentNode].next.includes(id)) return;
  currentNode = id;
  if (node.type === "wild") return enterArea(id);
  if (node.type === "battle") {
    mapStatus.textContent = "Battle location reached: " + node.label + ". Card battles are coming soon!";
  } else if (node.type === "special") {
    mapStatus.textContent = node.label + " discovered! Special events are coming soon.";
  } else if (node.type === "boss") {
    mapStatus.textContent = "Boss location reached! The final battle system is coming soon.";
  }
  updateNodes();
}
function updateNodes() {
  document.querySelectorAll(".node").forEach(button => {
    const id = button.dataset.node;
    const reachable = nodes[currentNode].next.includes(id);
    button.disabled = !reachable;
    button.style.opacity = reachable ? "1" : ".48";
    button.style.cursor = reachable ? "pointer" : "not-allowed";
    button.style.filter = reachable ? "" : "saturate(.45)";
    button.setAttribute("aria-label", nodes[id].label + (reachable ? ", available" : ", unavailable"));
  });
}
document.querySelectorAll(".node").forEach(button => {
  button.addEventListener("click", () => visitNode(button.dataset.node));
});
document.getElementById("leave-area").addEventListener("click", leaveArea);

function move(dx, dy) {
  if (!activeArea) return;
  const nx = player.x + dx, ny = player.y + dy;
  if (nx < 0 || ny < 0 || nx >= width || ny >= height) return;
  const tile = grid[ny][nx];
  if (["tree", "rock", "water"].includes(tile)) {
    areaMessage.textContent = "An obstacle blocks your way.";
    return;
  }
  player = { x: nx, y: ny };
  if (tile === "grass" && Math.random() < .24) {
    areaMessage.textContent = "Rustling in the grass... A wild Pokémon might be nearby! Encounter mechanics are coming soon.";
  } else {
    areaMessage.textContent = "You explore the area...";
  }
  renderGrid();
}
document.addEventListener("keydown", event => {
  if (!activeArea || event.repeat) return;
  const key = event.key.toLowerCase();
  const directions = { w: [0, -1], arrowup: [0, -1], s: [0, 1], arrowdown: [0, 1], a: [-1, 0], arrowleft: [-1, 0], d: [1, 0], arrowright: [1, 0] };
  if (directions[key]) {
    event.preventDefault();
    move(...directions[key]);
  }
});
updateNodes();