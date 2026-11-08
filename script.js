const overworld=document.getElementById("overworld"),exploration=document.getElementById("exploration"),tileMap=document.getElementById("tile-map"),mapStatus=document.getElementById("map-status"),areaMessage=document.getElementById("area-message"),areaName=document.getElementById("area-name");
const intro=document.getElementById("trainer-intro"),locationInfo=document.getElementById("location-info");
let currentNode="start",player={x:1,y:1},activeArea=null,pendingTrainer=null,grid=[];
const nodes={
 start:{label:"Start",type:"start",next:["logan","emma"]},
 logan:{label:"Youngster Logan",type:"trainer",next:["loganWild","center"],trainer:{name:"Youngster Logan",line:"I bet you can't defeat my Rayquaza!",sprite:"youngster_front_pic.png"}},
 emma:{label:"Lass Emma",type:"trainer",next:["emmaWild","tristan"],trainer:{name:"Lass Emma",line:"Check out my cute Pokemon!",sprite:"lass_front_pic.png"}},
 loganWild:{label:"Wild Zone",type:"wild",next:["mart"],area:{name:"Whispering Forest",theme:"forest"}},
 center:{label:"Pokémon Center",type:"center",next:["mart"]},
 emmaWild:{label:"Wild Zone",type:"wild",next:["tristanWild"],area:{name:"Open Meadow",theme:"meadow"}},
 tristan:{label:"Youngster Tristan",type:"trainer",next:["tristanWild"],trainer:{name:"Youngster Tristan",line:"I'm on vacation here from the Sinnoh region!",sprite:"youngster_front_pic.png"}},
 tristanWild:{label:"Wild Zone",type:"wild",next:["mart"],area:{name:"Quiet Lakeside",theme:"lake"}},
 mart:{label:"PokéMart",type:"mart",next:["boss"]},
 boss:{label:"Boss",type:"boss",next:[]}
};
const visited=new Set(["start"]),width=12,height=8;
const spriteBase="https://raw.githubusercontent.com/pret/pokefirered/master/graphics/trainers/front_pics/";
function updateNodes(){document.querySelectorAll(".node").forEach(button=>{const id=button.dataset.node,available=nodes[currentNode].next.includes(id);button.disabled=!available;button.classList.toggle("completed",visited.has(id));button.style.opacity=available?"1":".35";button.style.cursor=available?"pointer":"not-allowed";button.setAttribute("aria-label",nodes[id].label+(available?", available":", unavailable"));});}
function makeArea(theme){const map=Array.from({length:height},(_,y)=>Array.from({length:width},(_,x)=>{if(!x||!y||x===width-1||y===height-1)return"tree";if(theme==="lake"&&x>8&&y>2)return"water";if(theme==="meadow")return Math.random()<.13?"tree":Math.random()<.34?"grass":"ground";return Math.random()<.14?"tree":Math.random()<.27?"grass":"ground";}));for(let x=1;x<width-1;x++)map[4][x]="path";for(let y=1;y<height-1;y++)map[y][1]="path";return map;}
function renderGrid(){tileMap.innerHTML="";grid.forEach((row,y)=>row.forEach((type,x)=>{const tile=document.createElement("div");tile.className="tile "+type+(player.x===x&&player.y===y?" player":"");tile.setAttribute("role","gridcell");tileMap.appendChild(tile);}));}
function enterArea(id){activeArea=id;player={x:1,y:1};grid=makeArea(nodes[id].area.theme);areaName.textContent=nodes[id].area.name;areaMessage.textContent="You entered "+nodes[id].area.name+". Look around for wild Pokémon!";overworld.classList.add("hidden");exploration.classList.remove("hidden");document.getElementById("section-kicker").textContent="WILD AREA";document.getElementById("section-title").textContent=nodes[id].area.name;mapStatus.textContent="WASD or arrow keys to move.";renderGrid();}
function leaveArea(){activeArea=null;exploration.classList.add("hidden");overworld.classList.remove("hidden");document.getElementById("section-kicker").textContent="YOUR JOURNEY";document.getElementById("section-title").textContent="Choose your path";mapStatus.textContent="Choose a connected location to continue.";updateNodes();}
function showTrainer(id){pendingTrainer=id;const t=nodes[id].trainer;document.getElementById("trainer-name").textContent=t.name;document.getElementById("trainer-line").textContent='"'+t.line+'"';const img=document.getElementById("trainer-portrait");img.style.display="block";img.src=spriteBase+t.sprite;img.alt=t.name+" portrait";intro.classList.remove("hidden");document.getElementById("section-kicker").textContent="TRAINER ENCOUNTER";document.getElementById("section-title").textContent=t.name;}
function finishTrainer(){if(!pendingTrainer)return;const id=pendingTrainer;pendingTrainer=null;intro.classList.add("hidden");mapStatus.textContent="You defeated "+nodes[id].label+"! Victory — choose your next path.";updateNodes();}
function showLocation(title,description){document.getElementById("location-title").textContent=title;document.getElementById("location-description").textContent=description;locationInfo.classList.remove("hidden");}
function visitNode(id){const node=nodes[id];if(!node||!nodes[currentNode].next.includes(id))return;currentNode=id;visited.add(id);if(node.type==="wild")enterArea(id);else if(node.type==="trainer")showTrainer(id);else if(node.type==="center"){showLocation("Pokémon Center","Your Pokémon have been healed! Deck analysis will be available when the deck system is implemented.");mapStatus.textContent="Pokémon Center: team healed.";}else if(node.type==="mart"){showLocation("PokéMart","Welcome! Shop inventory and purchases will be added in a later update.");mapStatus.textContent="You reached the PokéMart.";}else if(node.type==="boss"){showLocation("Boss Encounter","You've reached the boss! The boss battle system will be added in a future update.");mapStatus.textContent="Boss location reached!";}updateNodes();}
document.querySelectorAll(".node").forEach(button=>button.addEventListener("click",()=>visitNode(button.dataset.node)));
document.getElementById("leave-area").addEventListener("click",leaveArea);
document.getElementById("trainer-continue").addEventListener("click",finishTrainer);
document.getElementById("location-continue").addEventListener("click",()=>{locationInfo.classList.add("hidden");updateNodes();});
document.getElementById("trainer-portrait").addEventListener("error",e=>{e.currentTarget.style.display="none";});
function move(dx,dy){if(!activeArea)return;const nx=player.x+dx,ny=player.y+dy;if(nx<0||ny<0||nx>=width||ny>=height)return;const type=grid[ny][nx];if(["tree","rock","water"].includes(type)){areaMessage.textContent="An obstacle blocks your way.";return;}player={x:nx,y:ny};areaMessage.textContent=type==="grass"&&Math.random()<.24?"Rustling in the grass... A wild Pokémon might be nearby!":"You explore the area...";renderGrid();}
document.addEventListener("keydown",e=>{if(!activeArea||e.repeat)return;const keys={w:[0,-1],arrowup:[0,-1],s:[0,1],arrowdown:[0,1],a:[-1,0],arrowleft:[-1,0],d:[1,0],arrowright:[1,0]},dir=keys[e.key.toLowerCase()];if(dir){e.preventDefault();move(...dir);}});
updateNodes();
