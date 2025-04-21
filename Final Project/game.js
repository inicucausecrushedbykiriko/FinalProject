//--------------------------------------------------------------------
//  Imports
//--------------------------------------------------------------------
import Renderer             from '/FinalProject/Final Project/lib/Viz/2DRenderer.js';
import ChibiCharacterObject from '/FinalProject/Final Project/ChibiCharacterObject.js';
import GroundObject         from '/FinalProject/Final Project/GroundObject.js';
import SlopeObject          from '/FinalProject/Final Project/SlopeObject.js';

//--------------------------------------------------------------------
//  Global constants
//--------------------------------------------------------------------
const WALL_THK   = 0.06;            // default platform thickness

const LEFT_IN    = -1 + WALL_THK;   // inner frame (NDC)
const RIGHT_IN   =  1 - WALL_THK;
const CEIL_IN    =  1 - WALL_THK;
const GROUND_Y   = -1 + WALL_THK;

const CHAR_HALF_W = 0.08;
const CHAR_HALF_H = 0.15;

const MOVE_SPEED  = 0.50;
const JUMP_SPEED  = 1.50;
const GRAVITY     = 2.50;

//--------------------------------------------------------------------
//  FLOOR & RAMP DESCRIPTORS  ── edit these two arrays only
//--------------------------------------------------------------------
/*
  Each rectangle:
    { x, y, w, h? }
      x  left edge
      y  TOP edge
      w  width
      h  (optional) thickness; if omitted -> WALL_THK

  Each trapezoid ramp:
    { p: [ TL, BL, TR, BR ] }
      TL etc = [x, y]   (triangle‑strip order)
      bottom vertices usually y - h   where h is thickness of that side
*/

// ---------- FIRST FLOOR (flat‑slope‑flat‑slope‑gap) ----------
const Y0 = GROUND_Y + 0.40;
const DROP1 = 0.13;
const Y1 = Y0 - DROP1;
const DROP2 = 0.06;
const Y2 = Y1 - DROP2;

const X0 = LEFT_IN;
const X1 = -0.20;
const X2 =  0.00;
const X3 =  0.60;
const X4 =  0.70;   // gap starts here

// ---------- SECOND FLOOR (gap on left + 2 recessed troughs) ----------
const Y_TOP = Y0 + 0.35;
const D       = 0.07;  // depth of troughs
const GAP_W   = 0.25;
const RAMP_W  = 0.04;
const TROUGH_W= 0.10;

const U0 = LEFT_IN + GAP_W;
const U1 = U0 + 0.20;
const U2 = U1 + RAMP_W;
const U3 = U2 + TROUGH_W;
const U4 = U3 + RAMP_W;
const U5 = U4 + 0.20;
const U6 = U5 + RAMP_W;
const U7 = U6 + TROUGH_W;
const U8 = U7 + RAMP_W;
const U9 = RIGHT_IN;

/* ------------  FLATS  ------------ */
const platformDefs = [
  // first floor
  { x:X0, y:Y0, w:X1 - X0 },                                   // flat‑1
  { x:X2, y:Y1, w:X3 - X2 },                                   // flat‑2

  // second floor
  { x:U0, y:Y_TOP,     w:U1 - U0 },                            // left of d‑1
  { x:U2, y:Y_TOP - D, w:U3 - U2 },                            // bottom d‑1
  { x:U4, y:Y_TOP,     w:U5 - U4, h:0.08 },                    // between dimples (thicker!)
  { x:U6, y:Y_TOP - D, w:U7 - U6 },                            // bottom d‑2
  { x:U8, y:Y_TOP,     w:U9 - U8 },                            // right segment
];

/* ------------  RAMPS  ------------ */
const slopeDefs = [
  // first floor ramps
  { p:[ [X1, Y0], [X1, Y0 - WALL_THK], [X2, Y1], [X2, Y1 - WALL_THK] ] },
  { p:[ [X3, Y1], [X3, Y1 - WALL_THK], [X4, Y2], [X4, Y2 - WALL_THK] ] },

  // second floor recessed dimple‑1
  { p:[ [U1, Y_TOP],      [U1, Y_TOP - WALL_THK],
        [U2, Y_TOP - D],  [U2, Y_TOP - D - WALL_THK] ] },
  { p:[ [U3, Y_TOP - D],  [U3, Y_TOP - D - WALL_THK],
        [U4, Y_TOP],      [U4, Y_TOP - 0.08] ] },          // uses custom height 0.08

  // second floor recessed dimple‑2
  { p:[ [U5, Y_TOP],      [U5, Y_TOP - 0.08],
        [U6, Y_TOP - D],  [U6, Y_TOP - D - WALL_THK] ] },
  { p:[ [U7, Y_TOP - D],  [U7, Y_TOP - D - WALL_THK],
        [U8, Y_TOP],      [U8, Y_TOP - WALL_THK] ] },
];


//--------------------------------------------------------------------
//  THIRD FLOOR  –– gap on very left, two shallow recessed dimples,
//                 otherwise continuous upper surface.
//--------------------------------------------------------------------
const Z_TOP   = Y_TOP + 0.35;    // height of this floor
const D3      = 0.06;            // recess depth
const R3      = 0.05;            // ramp length
const T3      = 0.28;            // low‑flat width inside each dimple
const GAP_L3  = 0.25;            // left gap to climb up
const GAP_R3  = 0.25;            // (keep a right gap if you like)

/* horizontal markers                (must be strictly increasing) */
const A0 = LEFT_IN;          // end of left gap / flat starts
const A1 = A0 + 0.30;                 // flat before dimple‑1
const A2 = A1 + R3;                   // bottom of ramp‑down‑1
const A3 = A2 + T3;                   // bottom of ramp‑up‑1
const A4 = A3 + R3;                   // end of dimple‑1, start middle flat
const A5 = A4 + 0.30;                 // flat before dimple‑2
const A6 = A5 + R3;                   // bottom of ramp‑down‑2
const A7 = A6 + T3;                   // bottom of ramp‑up‑2
const A8 = A7 + R3;                   // end of dimple‑2
const A9 = RIGHT_IN - GAP_R3;         // end of flat, then right gap until wall

/* ---------- FLAT RECTANGLES ---------- */
platformDefs.push(
  // upper‑surface flats
  { x: A0, y: Z_TOP,     w: A1 - A0 },   // left flat
  { x: A3, y: Z_TOP,     w: A4 - A3 },   // between dimple‑1 and middle flat
  { x: A4, y: Z_TOP,     w: A5 - A4 },   // middle flat
  { x: A7, y: Z_TOP,     w: A8 - A7 },   // between dimple‑2 and right flat
  { x: A8, y: Z_TOP,     w: A9 - A8 },   // right flat

  // recessed bottoms
  { x: A2, y: Z_TOP - D3, w: A3 - A2 },  // low flat dimple‑1
  { x: A6, y: Z_TOP - D3, w: A7 - A6 }   // low flat dimple‑2
);

/* ---------- RAMP PIECES (TL, BL, TR, BR) ---------- */
slopeDefs.push(
  // dimple‑1: down then up
  { p:[ [A1, Z_TOP],         [A1, Z_TOP - WALL_THK],
        [A2, Z_TOP - D3],    [A2, Z_TOP - D3 - WALL_THK] ] },
  { p:[ [A3, Z_TOP - D3],    [A3, Z_TOP - D3 - WALL_THK],
        [A4, Z_TOP],         [A4, Z_TOP - WALL_THK] ] },

  // dimple‑2: down then up
  { p:[ [A5, Z_TOP],         [A5, Z_TOP - WALL_THK],
        [A6, Z_TOP - D3],    [A6, Z_TOP - D3 - WALL_THK] ] },
  { p:[ [A7, Z_TOP - D3],    [A7, Z_TOP - D3 - WALL_THK],
        [A8, Z_TOP],         [A8, Z_TOP - WALL_THK] ] }
);

/* ---------- (Optional) floating ledges just above each trough ---------- */
const LEDGE_H3 = 0.15;
const LEDGE_W3 = 0.14;
platformDefs.push(
  { x: (A2 + A3 - LEDGE_W3) * 0.5, y: Z_TOP + LEDGE_H3, w: LEDGE_W3 },
  { x: (A6 + A7 - LEDGE_W3) * 0.5, y: Z_TOP + LEDGE_H3, w: LEDGE_W3 }
);

//--------------------------------------------------------------------
//  LEFT‑EDGE “STAIR” ON THIRD FLOOR
//    step‑1  (wide, lower)   → lets you reach step‑2
//    step‑2  (narrow, higher)→ lets you jump to the 4th floor
//--------------------------------------------------------------------
const Z4        = Z_TOP + 0.35;   // *target* height of the future 4th floor
const STEP1_Y   = Z_TOP + 0.15;   // top‑Y of first landing
const STEP2_Y   = Z_TOP + 0.28;   // top‑Y of second landing (just below Z4)

const STEP1_W   = 0.15;           // width of first landing shelf
const STEP2_W   = 0.08;           // width of second landing shelf

/* vertical face that makes the corner look crisp (optional) */
platformDefs.push(
  { x: LEFT_IN, y: Z_TOP, w: 0.001, h: STEP1_Y - Z_TOP }
);

/* ----- two‑step staircase on far left of third floor ----- */
const STEP1_H = STEP1_Y - Z_TOP;        // thickness so bottom = Z_TOP
const STEP2_H = STEP2_Y - STEP1_Y;      // thickness so bottom = STEP1_Y

platformDefs.push(
  // step‑1 : wide lower shelf
  { x: LEFT_IN, y: STEP1_Y, w: STEP1_W, h: STEP1_H },

  // step‑2 : narrow upper shelf
  { x: LEFT_IN, y: STEP2_Y, w: STEP2_W, h: STEP2_H }
);



//--------------------------------------------------------------------
//  FOURTH FLOOR   gap – platform – gap – platform
//--------------------------------------------------------------------
const Z5 = STEP2_Y + 0.20;        // top‑Y of 4th floor (a bit above step‑2)

/* choose horizontal widths */
const GAP1_W   = 0.18;
const PLAT1_W  = 0.30;
const GAP2_W   = 0.38;
const PLAT2_W  = 0.28;

/* horizontal markers */
const B0 = LEFT_IN + GAP1_W;          // start of platform‑1
const B1 = B0 + PLAT1_W;              // end  of platform‑1
const B2 = B1 + GAP2_W;               // start of platform‑2
const B3 = RIGHT_IN;              // end  of platform‑2  (≤ RIGHT_IN)

/* two flat rectangles */
platformDefs.push(
  { x: B0, y: Z5, w: B1 - B0 },       // platform‑1
  { x: B2, y: Z5, w: B3 - B2 }        // platform‑2
);


function buildPlatforms(r){
  return platformDefs.map(p =>
    new GroundObject(
      r._device,
      r._canvasFormat,
      p.w,
      p.h ?? WALL_THK,
      [p.x, p.y]
    )
  );
}
function buildSlopes(r){
  return slopeDefs.map(s =>
    new SlopeObject(
      r._device,
      r._canvasFormat,
      s.p
    )
  );
}

//--------------------------------------------------------------------
//  Collision helpers   (unchanged except they now use p.h??WALL_THK where needed)
//--------------------------------------------------------------------
function clampRoom(pos, vel){
  if (pos[0] - CHAR_HALF_W < LEFT_IN){ pos[0] = LEFT_IN + CHAR_HALF_W; vel[0]=0; }
  else if (pos[0] + CHAR_HALF_W > RIGHT_IN){ pos[0] = RIGHT_IN - CHAR_HALF_W; vel[0]=0; }
  if (pos[1] + CHAR_HALF_H > CEIL_IN){ pos[1] = CEIL_IN - CHAR_HALF_H; vel[1]=0; }
}
function landGround(pos, vel){
  if (pos[1] - CHAR_HALF_H <= GROUND_Y){ pos[1]=GROUND_Y+CHAR_HALF_H; vel[1]=0; return true;}
  return false;
}
function landOnPlatforms(pos, vel){
  for (const p of platformDefs){
    const left=p.x, right=p.x+p.w, topY=p.y;
    if (pos[0]+CHAR_HALF_W>left && pos[0]-CHAR_HALF_W<right){
      const pen=(pos[1]-CHAR_HALF_H)-topY;
      if (pen<=0.01 && vel[1]<=0){ pos[1]=topY+CHAR_HALF_H; vel[1]=0; return true; }
    }
  }
  return false;
}
function landOnSlopes(pos, vel){
  for (const s of slopeDefs){
    const [TL,BL,TR] = s.p;
    const xL=TL[0], xR=TR[0];
    if (pos[0]+CHAR_HALF_W < xL || pos[0]-CHAR_HALF_W > xR) continue;
    const t  =(pos[0]-xL)/(xR-xL);
    const top=TL[1]*(1-t)+TR[1]*t;
    const pen=(pos[1]-CHAR_HALF_H)-top;
    if (pen<=0.01 && vel[1]<=0){ pos[1]=top+CHAR_HALF_H; vel[1]=0; return true; }
  }
  return false;
}

//--------------------------------------------------------------------
//  Renderer helpers
//--------------------------------------------------------------------
async function initRenderer(c){ const r=new Renderer(c); await r.init(); return r; }
async function createChar(d,f,c,s){ const ch=new ChibiCharacterObject(d,f,c,{position:s});
  await ch.createGeometry(); await ch.createShaders(); await ch.createRenderPipeline(); await ch.createComputePipeline(); return ch; }

//--------------------------------------------------------------------
//  Main entry
//--------------------------------------------------------------------
export async function initGame(){
  const canvas=document.getElementById('gameCanvas'); if(!canvas){console.error('no #gameCanvas');return;}
  const r=await initRenderer(canvas);

  /* frame */
  const border=[
    new GroundObject(r._device,r._canvasFormat,2,WALL_THK,[-1,GROUND_Y]),
    new GroundObject(r._device,r._canvasFormat,2,WALL_THK,[-1,1]),
    new GroundObject(r._device,r._canvasFormat,WALL_THK,CEIL_IN-GROUND_Y,[-1,CEIL_IN]),
    new GroundObject(r._device,r._canvasFormat,WALL_THK,CEIL_IN-GROUND_Y,[RIGHT_IN,CEIL_IN])
  ];
  for(const b of border) await r.appendSceneObject(b);

  for(const p of buildPlatforms(r)) await r.appendSceneObject(p);
  for(const s of buildSlopes(r))    await r.appendSceneObject(s);

  /* characters */
  let redPos=[LEFT_IN+0.15,GROUND_Y+CHAR_HALF_H],
      bluePos=[LEFT_IN+0.30,GROUND_Y+CHAR_HALF_H],
      redVel=[0,0],blueVel=[0,0],
      redOnG=true,blueOnG=true;

  const redChar = await createChar(r._device,r._canvasFormat,new Float32Array([1,0,0,1]),redPos);
  const bluChar = await createChar(r._device,r._canvasFormat,new Float32Array([0,0,1,1]),bluePos);
  r.appendSceneObject(redChar); r.appendSceneObject(bluChar);

  const keys=Object.create(null);
  addEventListener('keydown',e=>keys[e.key]=true);
  addEventListener('keyup',e=>keys[e.key]=false);

  const ratio=canvas.width/canvas.height; redChar.setAspect(ratio); bluChar.setAspect(ratio);

  let last=performance.now();
  function loop(now=performance.now()){
    const dt=(now-last)/1000; last=now;

    redVel[0]=keys['a']?-MOVE_SPEED:keys['d']?MOVE_SPEED:0;
    bluChar; blueVel[0]=keys['ArrowLeft']?-MOVE_SPEED:keys['ArrowRight']?MOVE_SPEED:0;

    if(keys['w']&&redOnG){redVel[1]=JUMP_SPEED;redOnG=false;}
    if(keys['ArrowUp']&&blueOnG){blueVel[1]=JUMP_SPEED;blueOnG=false;}

    redVel[1]-=GRAVITY*dt; blueVel[1]-=GRAVITY*dt;
    redPos[0]+=redVel[0]*dt; redPos[1]+=redVel[1]*dt;
    bluePos[0]+=blueVel[0]*dt; bluePos[1]+=blueVel[1]*dt;

    clampRoom(redPos,redVel); clampRoom(bluePos,blueVel);
    redOnG = landGround(redPos,redVel)||landOnPlatforms(redPos,redVel)||landOnSlopes(redPos,redVel);
    blueOnG= landGround(bluePos,blueVel)||landOnPlatforms(bluePos,blueVel)||landOnSlopes(bluePos,blueVel);

    redChar.setPosition(redPos[0],redPos[1]);
    bluChar.setPosition(bluePos[0],bluePos[1]);

    r.render(); requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}
initGame().catch(console.error);
