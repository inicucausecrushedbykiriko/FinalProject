
import Renderer             from '/Final Project/lib/Viz/2DRenderer.js';
import ChibiCharacterObject from '/Final Project/ChibiCharacterObject.js';
import GroundObject         from '/Final Project/GroundObject.js';


const WALL_THK   = 0.05;

const LEFT_IN    = -1 + WALL_THK;
const RIGHT_IN   =  1 - WALL_THK;
const CEIL_IN    =  1 - WALL_THK;
const GROUND_Y   = -1 + WALL_THK;

const CHAR_HALF_W = 0.08;
const CHAR_HALF_H = 0.15;

const MOVE_SPEED  = 0.5;
const JUMP_SPEED  = 1.5;
const GRAVITY     = 2.5;


function clampRoom(pos, vel){
  /* left & right walls */
  if (pos[0] - CHAR_HALF_W < LEFT_IN){
    pos[0] = LEFT_IN + CHAR_HALF_W; vel[0] = 0;
  } else if (pos[0] + CHAR_HALF_W > RIGHT_IN){
    pos[0] = RIGHT_IN - CHAR_HALF_W; vel[0] = 0;
  }
  /* ceiling */
  if (pos[1] + CHAR_HALF_H > CEIL_IN){
    pos[1] = CEIL_IN - CHAR_HALF_H;  vel[1] = 0;
  }
}
function landGround(pos, vel){
  if (pos[1] - CHAR_HALF_H <= GROUND_Y){
    pos[1] = GROUND_Y + CHAR_HALF_H;
    vel[1] = 0;
    return true;
  }
  return false;
}


async function initRenderer(canvas){
  const r = new Renderer(canvas);
  await r.init();
  return r;
}
async function createCharacter(device, fmt, color, start){
  const c = new ChibiCharacterObject(device, fmt, color, {position:start});
  await c.createGeometry();
  await c.createShaders();
  await c.createRenderPipeline();
  await c.createComputePipeline();
  return c;
}


export async function initGame(){
  const canvas = document.getElementById('gameCanvas');
  if (!canvas){ console.error("No #gameCanvas found"); return; }

  const renderer = await initRenderer(canvas);

  /* ----- build room edges ----- */
  const roomRects = [
    /* floor    */ new GroundObject(renderer._device, renderer._canvasFormat,
                                    2, WALL_THK, [-1,  GROUND_Y]),
    /* ceiling  */ new GroundObject(renderer._device, renderer._canvasFormat,
                                    2, WALL_THK, [-1,  1]),
    /* left wall*/ new GroundObject(renderer._device, renderer._canvasFormat,
                                    WALL_THK, CEIL_IN - GROUND_Y, [-1, CEIL_IN]),
    /* right wall*/new GroundObject(renderer._device, renderer._canvasFormat,
                                    WALL_THK, CEIL_IN - GROUND_Y, [RIGHT_IN, CEIL_IN])
  ];
  for (const r of roomRects) await renderer.appendSceneObject(r);

  let redPos  = [LEFT_IN + 0.5, GROUND_Y + CHAR_HALF_H];
  let bluePos = [LEFT_IN + 0.8, GROUND_Y + CHAR_HALF_H];
  let redVel  = [0,0], blueVel = [0,0];
  let redOnG  = true,  blueOnG = true;

  const redChar  = await createCharacter(renderer._device, renderer._canvasFormat,
                     new Float32Array([1,0,0,1]),  redPos);
  const blueChar = await createCharacter(renderer._device, renderer._canvasFormat,
                     new Float32Array([0,0,1,1]), bluePos);

  renderer.appendSceneObject(redChar);
  renderer.appendSceneObject(blueChar);

  /* ----- keyboard ----- */
  const keys = Object.create(null);
  addEventListener('keydown', e=>keys[e.key]=true);
  addEventListener('keyup',   e=>keys[e.key]=false);

  /* adapt aspect on resize */
  const ratio = canvas.width/canvas.height;
  redChar.setAspect(ratio);  blueChar.setAspect(ratio);

  /* ----- main loop ----- */
  let last = performance.now();
  function loop(now = performance.now()){
    const dt = (now-last)/1000; last = now;

    /* horizontal */
    redVel[0]  = keys['a']? -MOVE_SPEED : keys['d']? MOVE_SPEED : 0;
    blueVel[0] = keys['ArrowLeft']? -MOVE_SPEED :
                 keys['ArrowRight']?  MOVE_SPEED : 0;

    /* jump */
    if (keys['w'] && redOnG){ redVel[1] = JUMP_SPEED; redOnG=false; }
    if (keys['ArrowUp'] && blueOnG){ blueVel[1] = JUMP_SPEED; blueOnG=false; }

    /* physics integrate */
    redVel[1]  -= GRAVITY*dt;  blueVel[1] -= GRAVITY*dt;

    redPos[0]  += redVel[0]*dt; redPos[1]  += redVel[1]*dt;
    bluePos[0] += blueVel[0]*dt; bluePos[1] += blueVel[1]*dt;

    /* collisions */
    clampRoom(redPos, redVel);
    clampRoom(bluePos, blueVel);

    redOnG  = landGround(redPos,  redVel);
    blueOnG = landGround(bluePos, blueVel);

    redChar.setPosition(redPos[0],  redPos[1]);
    blueChar.setPosition(bluePos[0], bluePos[1]);

    renderer.render();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}

initGame().catch(console.error);
