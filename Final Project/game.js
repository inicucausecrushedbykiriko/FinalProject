//--------------------------------------------------------------------
//  Imports
//--------------------------------------------------------------------
import Renderer             from '/FinalProject/Final Project/lib/Viz/2DRenderer.js';
import ChibiCharacterObject from '/FinalProject/Final Project/ChibiCharacterObject.js';
import GroundObject         from '/FinalProject/Final Project/GroundObject.js';
import SlopeObject          from '/FinalProject/Final Project/SlopeObject.js';
import MovingPlatformObject from '/FinalProject/Final Project/MovingPlatformObject.js';
import SwitchObject         from '/FinalProject/Final Project/SwitchObject.js';

//--------------------------------------------------------------------
//  Global constants
//--------------------------------------------------------------------
const WALL_THK   = 0.06;

const LEFT_IN    = -1 + WALL_THK;
const RIGHT_IN   =  1 - WALL_THK;
const CEIL_IN    =  1 - WALL_THK;
const GROUND_Y   = -1 + WALL_THK;

const CHAR_HALF_W = 0.02;
const CHAR_HALF_H = 0.065;
const RENDER_OFFSET_Y = 0.035;

const MOVE_SPEED  = 0.40;
const JUMP_SPEED  = 1.0;
const GRAVITY     = 2.50;

//--------------------------------------------------------------------
//  FLOOR & RAMP DESCRIPTORS
//--------------------------------------------------------------------
const Y0 = GROUND_Y + 0.40;
const DROP1 = 0.13;
const Y1 = Y0 - DROP1;
const DROP2 = 0.06;
const Y2 = Y1 - DROP2;

const X0 = LEFT_IN;
const X1 = -0.20;
const X2 =  0.00;
const X3 =  0.60;
const X4 =  0.70;

const SWITCH_BASE_W = 0.12;

// ---------- SECOND FLOOR ----------
const Y_TOP = Y0 + 0.35;
const D       = 0.07;
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

//--------------------------------------------------------------------
//  THIRD FLOOR
//--------------------------------------------------------------------
const Z_TOP   = Y_TOP + 0.35;
const D3      = 0.06;
const R3      = 0.05;
const T3      = 0.28;
const GAP_L3  = 0.25;
const GAP_R3  = 0.25;

const A0 = LEFT_IN;
const A1 = A0 + 0.30;
const A2 = A1 + R3;
const A3 = A2 + T3;
const A4 = A3 + R3;
const A5 = A4 + 0.30;
const A6 = A5 + R3;
const A7 = A6 + T3;
const A8 = A7 + R3;
const A9 = RIGHT_IN - GAP_R3;

//--------------------------------------------------------------------
//  PLATFORM / SLOPE ARRAYS
//--------------------------------------------------------------------
const platformDefs = [
  { x:X0, y:Y0, w:X1 - X0 },
  { x:X2, y:Y1, w:X3 - X2 },

  { x:U0, y:Y_TOP,     w:U1 - U0 },
  { x:U2, y:Y_TOP - D, w:U3 - U2 },
  { x:U4, y:Y_TOP,     w:U5 - U4, h:0.08 },
  { x:U6, y:Y_TOP - D, w:U7 - U6 },
  { x:U8, y:Y_TOP,     w:U9 - U8 },
];

const LIFT_W        = GAP_W * 0.8;
const LIFT_X0       = LEFT_IN + (GAP_W - LIFT_W) * 0.5;
const LIFT_Y_START  = Y_TOP;
const LIFT_TARGET_Y = Y0 + 0.12;
const liftRect = { x:LIFT_X0, y:LIFT_Y_START, w:LIFT_W, h:WALL_THK };

const slopeDefs = [
  { p:[ [X1, Y0],[X1, Y0-WALL_THK],[X2, Y1],[X2, Y1-WALL_THK] ] },
  { p:[ [X3, Y1],[X3, Y1-WALL_THK],[X4, Y2],[X4, Y2-WALL_THK] ] },

  { p:[ [U1, Y_TOP],[U1, Y_TOP-WALL_THK],[U2, Y_TOP-D],[U2, Y_TOP-D-WALL_THK] ] },
  { p:[ [U3, Y_TOP-D],[U3, Y_TOP-D-WALL_THK],[U4, Y_TOP],[U4, Y_TOP-0.08] ] },

  { p:[ [U5, Y_TOP],[U5, Y_TOP-0.08],[U6, Y_TOP-D],[U6, Y_TOP-D-WALL_THK] ] },
  { p:[ [U7, Y_TOP-D],[U7, Y_TOP-D-WALL_THK],[U8, Y_TOP],[U8, Y_TOP-WALL_THK] ] },
];

//--------------------------------------------------------------------
//  THIRD FLOOR CONTINUED
//--------------------------------------------------------------------
platformDefs.push(
  { x:A0, y:Z_TOP, w:A1-A0 },
  { x:A3, y:Z_TOP, w:A4-A3 },
  { x:A4, y:Z_TOP, w:A5-A4 },
  { x:A7, y:Z_TOP, w:A8-A7 },
  { x:A8, y:Z_TOP, w:A9-A8 },

  { x:A2, y:Z_TOP-D3, w:A3-A2 },
  { x:A6, y:Z_TOP-D3, w:A7-A6 }
);

slopeDefs.push(
  { p:[ [A1,Z_TOP],[A1,Z_TOP-WALL_THK],[A2,Z_TOP-D3],[A2,Z_TOP-D3-WALL_THK] ] },
  { p:[ [A3,Z_TOP-D3],[A3,Z_TOP-D3-WALL_THK],[A4,Z_TOP],[A4,Z_TOP-WALL_THK] ] },
  { p:[ [A5,Z_TOP],[A5,Z_TOP-WALL_THK],[A6,Z_TOP-D3],[A6,Z_TOP-D3-WALL_THK] ] },
  { p:[ [A7,Z_TOP-D3],[A7,Z_TOP-D3-WALL_THK],[A8,Z_TOP],[A8,Z_TOP-WALL_THK] ] }
);

const LEDGE_H3 = 0.15, LEDGE_W3 = 0.14;
platformDefs.push(
  { x:(A2+A3-LEDGE_W3)*0.5,y:Z_TOP+LEDGE_H3,w:LEDGE_W3 },
  { x:(A6+A7-LEDGE_W3)*0.5,y:Z_TOP+LEDGE_H3,w:LEDGE_W3 }
);

//--------------------------------------------------------------------
//  STAIRS & FOURTH FLOOR
//--------------------------------------------------------------------
const STEP1_Y = Z_TOP + 0.15, STEP2_Y = Z_TOP + 0.28;
const STEP1_W = 0.15, STEP2_W = 0.08;

platformDefs.push(
  { x:LEFT_IN, y:Z_TOP, w:0.001, h:STEP1_Y-Z_TOP },
  { x:LEFT_IN, y:STEP1_Y, w:STEP1_W, h:STEP1_Y-Z_TOP },
  { x:LEFT_IN, y:STEP2_Y, w:STEP2_W, h:STEP2_Y-STEP1_Y }
);

const Z5 = STEP2_Y + 0.20;
const GAP1_W = 0.18, PLAT1_W = 0.30, GAP2_W = 0.38, PLAT2_W = 0.28;
const B0 = LEFT_IN + GAP1_W, B1 = B0 + PLAT1_W;
const B2 = B1 + GAP2_W, B3 = RIGHT_IN;

platformDefs.push(
  { x:B0, y:Z5, w:B1-B0 },
  { x:B2, y:Z5, w:B3-B2 }
);

//--------------------------------------------------------------------
//  WATER & LAVA POOLS
//--------------------------------------------------------------------
const waterPools = [
  { x:U2, y:Y_TOP-D, w:U3-U2, h:WALL_THK },
  { x:A2, y:Z_TOP-D3, w:A3-A2, h:WALL_THK }
];
const lavaPools = [
  { x:U6, y:Y_TOP-D, w:U7-U6, h:WALL_THK },
  { x:A6, y:Z_TOP-D3, w:A7-A6, h:WALL_THK }
];

//--------------------------------------------------------------------
//  Helpers to build scene objects
//--------------------------------------------------------------------
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
    new SlopeObject(r._device,r._canvasFormat,s.p)
  );
}
function buildLiquids(r){
  const objs = [];
  for(const w of waterPools){
    objs.push(new GroundObject(
      r._device,r._canvasFormat,w.w,w.h,[w.x,w.y],
      new Float32Array([0.1,0.35,0.9,1])
    ));
  }
  for(const l of lavaPools){
    objs.push(new GroundObject(
      r._device,r._canvasFormat,l.w,l.h,[l.x,l.y],
      new Float32Array([0.9,0.2,0.1,1])
    ));
  }
  return objs;
}

//--------------------------------------------------------------------
//  Collision helpers
//--------------------------------------------------------------------
function clampRoom(pos, vel){
  if (pos[0]-CHAR_HALF_W<LEFT_IN){pos[0]=LEFT_IN+CHAR_HALF_W;vel[0]=0;}
  else if(pos[0]+CHAR_HALF_W>RIGHT_IN){pos[0]=RIGHT_IN-CHAR_HALF_W;vel[0]=0;}
  if(pos[1]+CHAR_HALF_H>CEIL_IN){pos[1]=CEIL_IN-CHAR_HALF_H;vel[1]=0;}
}
function landGround(pos, vel){
  if(pos[1]-CHAR_HALF_H<=GROUND_Y){pos[1]=GROUND_Y+CHAR_HALF_H;vel[1]=0;return true;}
  return false;
}

function collideAABB(rect,pos,vel){
  const left=rect.x,right=rect.x+rect.w,top=rect.y,bottom=top-(rect.h??WALL_THK);
  const cxL=pos[0]-CHAR_HALF_W,cxR=pos[0]+CHAR_HALF_W,cyT=pos[1]+CHAR_HALF_H,cyB=pos[1]-CHAR_HALF_H;
  if(cxR<=left||cxL>=right||cyB>=top||cyT<=bottom)return null;
  const penL=right-cxL,penR=cxR-left,penT=cyT-bottom,penB=top-cyB,minPen=Math.min(penL,penR,penT,penB);
  if(minPen===penT){pos[1]-=penT;vel[1]=Math.min(0,vel[1]);return'ceiling';}
  if(minPen===penB){pos[1]+=penB;vel[1]=Math.max(0,vel[1]);return'ground';}
  if(minPen===penL){pos[0]+=penL;vel[0]=Math.max(0,vel[0]);return'wall';}
  if(minPen===penR){pos[0]-=penR;vel[0]=Math.min(0,vel[0]);return'wall';}
  return null;
}

let lift=null;

function resolvePlatformCollisions(pos,vel){
  let onGround=false;
  for(const p of platformDefs){
    if(collideAABB(p,pos,vel)==='ground')onGround=true;
  }
  if(lift&&collideAABB(lift.bbox(),pos,vel)==='ground')onGround=true;
  return onGround;
}

function collideSlope(sl,pos,vel){
  const [TL,BL,TR,BR]=sl.p,xL=TL[0],xR=TR[0];
  if(pos[0]+CHAR_HALF_W<xL||pos[0]-CHAR_HALF_W>xR)return null;
  const t=(pos[0]-xL)/(xR-xL);
  const yTop=TL[1]*(1-t)+TR[1]*t,yBot=BL[1]*(1-t)+BR[1]*t;
  const foot=pos[1]-CHAR_HALF_H,head=pos[1]+CHAR_HALF_H;
  if(foot<=yTop&&vel[1]<=0&&foot>=yTop-0.02){pos[1]=yTop+CHAR_HALF_H;vel[1]=0;return'ground';}
  if(head>=yBot&&vel[1]>=0&&head<=yBot+0.02){pos[1]=yBot-CHAR_HALF_H;vel[1]=0;return'ceiling';}
  return null;
}

function resolveSlopeCollisions(pos,vel){
  let onGround=false;
  for(const s of slopeDefs){
    if(collideSlope(s,pos,vel)==='ground')onGround=true;
  }
  return onGround;
}

//--------------------------------------------------------------------
//  Renderer helpers
//--------------------------------------------------------------------
async function initRenderer(c){const r=new Renderer(c);await r.init();return r;}
async function createChar(d,f,c,s){const ch=new ChibiCharacterObject(d,f,c,{position:s});await ch.createGeometry();await ch.createShaders();await ch.createRenderPipeline();await ch.createComputePipeline();return ch;}

//--------------------------------------------------------------------
//  Main entry
//--------------------------------------------------------------------
export async function initGame(){
  const canvas=document.getElementById('gameCanvas');if(!canvas)return;
  const r=await initRenderer(canvas);

  for(const b of [
    new GroundObject(r._device,r._canvasFormat,2,WALL_THK,[-1,GROUND_Y]),
    new GroundObject(r._device,r._canvasFormat,2,WALL_THK,[-1,1]),
    new GroundObject(r._device,r._canvasFormat,WALL_THK,CEIL_IN-GROUND_Y,[-1,CEIL_IN]),
    new GroundObject(r._device,r._canvasFormat,WALL_THK,CEIL_IN-GROUND_Y,[RIGHT_IN,CEIL_IN])
  ])await r.appendSceneObject(b);

  for(const p of buildPlatforms(r))await r.appendSceneObject(p);
  for(const s of buildSlopes(r))await r.appendSceneObject(s);
  for(const lq of buildLiquids(r))await r.appendSceneObject(lq);

  const switchDef={x:(X0+X1)*0.5-SWITCH_BASE_W*0.5,y:Y0};
  const lever=new SwitchObject(r._device,r._canvasFormat,[switchDef.x,switchDef.y]);
  await lever.init();await r.appendSceneObject(lever);

  lift=new MovingPlatformObject(r._device,r._canvasFormat,liftRect,new Float32Array([0.9,0.8,0.1,1]),LIFT_TARGET_Y);
  await lift.init();await r.appendSceneObject(lift);

  let redPos=[LEFT_IN+0.15,GROUND_Y+CHAR_HALF_H],bluePos=[LEFT_IN+0.30,GROUND_Y+CHAR_HALF_H];
  let redVel=[0,0],blueVel=[0,0],redOnG=true,blueOnG=true;

  const redChar=await createChar(r._device,r._canvasFormat,new Float32Array([1,0,0,1]),redPos);
  const bluChar=await createChar(r._device,r._canvasFormat,new Float32Array([0,0,1,1]),bluePos);
  r.appendSceneObject(redChar);r.appendSceneObject(bluChar);

  const keys=Object.create(null);
  addEventListener('keydown',e=>keys[e.key]=true);
  addEventListener('keyup',e=>keys[e.key]=false);

  const ratio=canvas.width/canvas.height;redChar.setAspect(ratio);bluChar.setAspect(ratio);

  let last=performance.now();

  function inPool(pos,pool){
    return pos[0]>pool.x&&pos[0]<pool.x+pool.w&&pos[1]-CHAR_HALF_H<pool.y&&pos[1]+CHAR_HALF_H>pool.y-pool.h;
  }

  function loop(now=performance.now()){
    const dt=(now-last)/1000;last=now;

    redVel[0]=keys['a']?-MOVE_SPEED:keys['d']?MOVE_SPEED:0;
    blueVel[0]=keys['ArrowLeft']?-MOVE_SPEED:keys['ArrowRight']?MOVE_SPEED:0;

    if(keys['w']&&redOnG){redVel[1]=JUMP_SPEED;redOnG=false;}
    if(keys['ArrowUp']&&blueOnG){blueVel[1]=JUMP_SPEED;blueOnG=false;}

    redVel[1]-=GRAVITY*dt;blueVel[1]-=GRAVITY*dt;
    redPos[0]+=redVel[0]*dt;redPos[1]+=redVel[1]*dt;
    bluePos[0]+=blueVel[0]*dt;bluePos[1]+=blueVel[1]*dt;

    clampRoom(redPos,redVel);clampRoom(bluePos,blueVel);

    redOnG=landGround(redPos,redVel)||resolvePlatformCollisions(redPos,redVel)||resolveSlopeCollisions(redPos,redVel);
    blueOnG=landGround(bluePos,blueVel)||resolvePlatformCollisions(bluePos,blueVel)||resolveSlopeCollisions(bluePos,blueVel);

    function pressTest(pos){
      const sw=lever.bbox();
      const hitX=(pos[0]+CHAR_HALF_W>sw.x)&&(pos[0]-CHAR_HALF_W<sw.x+sw.w);
      const footY=pos[1]-CHAR_HALF_H,onTop=Math.abs(footY-sw.y)<=0.02;
      if(hitX&&onTop){
        if(!lever._pressed){
          lever.press();
          lift.startDrop();
        }
      }
    }
    pressTest(redPos);pressTest(bluePos);

    for(const p of waterPools){if(inPool(redPos,p)||inPool(bluePos,p))location.reload();}
    for(const p of lavaPools){if(inPool(redPos,p)||inPool(bluePos,p))location.reload();}

    redChar.setPosition(redPos[0],redPos[1]+RENDER_OFFSET_Y);
    bluChar.setPosition(bluePos[0],bluePos[1]+RENDER_OFFSET_Y);
    r.render();requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}
initGame().catch(console.error);
