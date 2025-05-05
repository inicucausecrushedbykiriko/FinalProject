Fire & Water — A Two‑Character Co‑op Puzzle‑Platformer
A WebGPU capstone for CSCI 379 (Spring 2025)

PLAY THE GAME
https://inicucausecrushedbykiriko.github.io/FinalProject/

WHY THIS PROJECT MATTERS
Our game project is an attempt to reproduce the traditional game fireboy and watergirl on the webgpu. This attempt demonstrates that a modern, visually rich, real‑time game can run in the browser on top of raw WebGPU with no external 3‑D engine. Two elemental siblings must cooperate to leave a four‑storey laboratory, timing jumps, operating lifts and retractable bridges, and avoiding pools of the element that kills them. The game shows how far open‑web graphics and vanilla JavaScript have come.

TECHNOLOGY OVERVIEW
Rendering is built directly on the WebGPU API with shaders written in WGSL.
The game engine is hand‑rolled in ES Modules and provides physics, AABB plus slope collision, state machines for movable objects, and a HUD.
Development workflow relies on Vite for hot‑reload and ESLint for static checking.

RUNNING THE GAME LOCALLY

git clone https://github.com/inicucausecrushedbykiriko/FinalProject
run the simple_server.py, and server starts on http://localhost:8087

Chrome or Edge (or later) are required, with the WebGPU flag enabled.

CONTROLS
Red hero: move with the A and D keys and jump with W.
Blue hero: move with the left and right arrow keys and jump with the up arrow key.

SYSTEM ARCHITECTURE
The Renderer owns a list of SceneObjects. SceneObject is an abstract base that supplies geometry, a render pipeline, and a draw method. Concrete SceneObjects include ground segments, slopes, moving platforms, vertical lifts, a hidden bridge, switches, two chibi characters, collectible diamonds, a GPU‑driven particle system, and a HUD text overlay. Game logic and the fixed‑time physics loop live in game.js.

NOTABLE ALGORITHMS
Slope collision snaps a character’s feet or head by linearly interpolating the upper and lower edges of every ramp segment.
Particle trails are updated by a WGSL compute shader that walks a 1024‑element storage buffer every frame.
The hidden bridge fades in and out by monitoring two floor‑four switches and toggling the bridge’s opacity and collision flag whenever either switch is pressed.

FUTURE WORK
Potential extensions include online cooperative play via WebRTC DataChannels, a JSON‑driven level editor with live preview, fixed‑timestep sub‑stepping for smoother physics on high‑refresh monitors, and full game‑pad and touch‑screen support.

VIDEO DEMO
<video src="assets/Demo.mp4" controls width="640"></video>

INDIVIDUAL REFLECTIONS

Titus Weng (tw013@bucknell.edu):
Writing this game forced me to understand bind groups versus pipelines and to learn how to debug GPU conditions with buffer downloads. My proudest moment was adding the flame-like effect and make it really look like a flame following the chibi characters. Given another week I would refactor physics and fix some minor bugs and add more rendering to the texture of the floors, chibi characters themselves and adding other  The project aligns with job listings that ask for shader experience and low‑level WebGPU expertise (for WebXR development positions).

Aiden Ren (zr002@bucknell.edu):
