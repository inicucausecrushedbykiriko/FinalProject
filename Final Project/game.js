import Renderer from '/lib/Viz/2DRenderer.js';
import ChibiCharacterObject from './ChibiCharacterObject.js';

async function initRenderer(canvas) {
  const renderer = new Renderer(canvas);
  await renderer.init();
  return renderer;
}

async function createCharacter(device, canvasFormat, colorArray, initialPos) {
  const character = new ChibiCharacterObject(device, canvasFormat, colorArray, {
    position: initialPos,
  });
  await character.createGeometry();
  await character.createShaders();
  await character.createRenderPipeline();
  await character.createComputePipeline();
  return character;
}

export async function initGame() {
  const canvas = document.getElementById("gameCanvas");
  if (!canvas) {
    console.error("No canvas found with id='gameCanvas'");
    return;
  }

  const renderer = await initRenderer(canvas);

  let redPos  = [0.0, 0.0];
  let bluePos = [0.4, 0.0];

  let redVel  = [0.0, 0.0];
  let blueVel = [0.0, 0.0];

  const MOVE_SPEED = 0.5;   
  const JUMP_SPEED = 1.5;   
  const GRAVITY    = 2.5;  
  let redOnGround  = true;
  let blueOnGround = true;

  const redColor  = new Float32Array([1, 0, 0, 1]);
  const blueColor = new Float32Array([0, 0, 1, 1]);

  const redChar  = await createCharacter(renderer._device, renderer._canvasFormat, redColor,  redPos);
  const blueChar = await createCharacter(renderer._device, renderer._canvasFormat, blueColor, bluePos);

  renderer.appendSceneObject(redChar);
  renderer.appendSceneObject(blueChar);

  const keys = {};
  window.addEventListener('keydown', e => { keys[e.key] = true; });
  window.addEventListener('keyup',   e => { keys[e.key] = false; });

  const ratio = canvas.width / canvas.height;
  redChar.setAspect(ratio);
  blueChar.setAspect(ratio);

  let lastTime = performance.now();
  function gameLoop(now = performance.now()) {
    const dt = (now - lastTime) / 1000; 
    lastTime = now;

    if (keys['a'])      redVel[0] = -MOVE_SPEED;
    else if (keys['d']) redVel[0] =  MOVE_SPEED;
    else                redVel[0] =  0;

    if (keys['w'] && redOnGround) {
      redVel[1] = JUMP_SPEED;
      redOnGround = false;
    }

    redVel[1] -= GRAVITY * dt;

    redPos[0] += redVel[0] * dt;
    redPos[1] += redVel[1] * dt;

    if (redPos[1] <= 0) {
      redPos[1] = 0;
      redVel[1] = 0;
      redOnGround = true;
    }

    redChar.setPosition(redPos[0], redPos[1]);

    if (keys['ArrowLeft'])      blueVel[0] = -MOVE_SPEED;
    else if (keys['ArrowRight']) blueVel[0] =  MOVE_SPEED;
    else                         blueVel[0] =  0;

    if (keys['ArrowUp'] && blueOnGround) {
      blueVel[1] = JUMP_SPEED;
      blueOnGround = false;
    }

    blueVel[1] -= GRAVITY * dt;

    bluePos[0] += blueVel[0] * dt;
    bluePos[1] += blueVel[1] * dt;

    if (bluePos[1] <= 0) {
      bluePos[1] = 0;
      blueVel[1] = 0;
      blueOnGround = true;
    }

    blueChar.setPosition(bluePos[0], bluePos[1]);

    renderer.render();
    requestAnimationFrame(gameLoop);
  }

  requestAnimationFrame(gameLoop);
}

initGame().catch(err => console.error(err));
