import * as THREE from 'three';

// Colors
export const ACCENT_HEX = 0x7b8ea8;
export const BG_HEX = 0xfafbfc;

// Camera
export const DEFAULT_CAM_POS = new THREE.Vector3(0, 0, 8);
export const CAM_CLAMP_X: [number, number] = [-6, 6];
export const CAM_CLAMP_Y: [number, number] = [-4, 4];
export const CAM_CLAMP_Z: [number, number] = [3, 14];
export const CAM_LERP = 0.08;
export const CAM_RESET_RATE = 0.01;
export const CAM_LOOK_STRENGTH_X = 0.3;
export const CAM_LOOK_STRENGTH_Y = 0.2;

// Fog
export const FOG_DENSITY = 0.032;

// Drag & Scroll
export const DRAG_SENSITIVITY = 0.015;
export const DRAG_THRESHOLD = 3;
export const SCROLL_SENSITIVITY = 0.008;

// Touch
export const TOUCH_DRAG_SENSITIVITY = 0.015;
export const TOUCH_PINCH_SENSITIVITY = 0.02;

// Entry animation
export const ENTRY_DURATION = 3; // seconds
export const ENTRY_SPAWN_RANGE_X = 20;
export const ENTRY_SPAWN_RANGE_Y = 12;
export const ENTRY_SPAWN_RANGE_Z = 20;

// Particles
export const PARTICLE_COUNT_DESKTOP = 500;
export const PARTICLE_FIELD_X = 30;
export const PARTICLE_FIELD_Y = 20;
export const PARTICLE_FIELD_Z = 30;
export const PARTICLE_SIZE = 0.04;
export const PARTICLE_OPACITY = 0.5;
export const PARTICLE_FLOW_SPEED = 0.015;
export const PARTICLE_FLOAT_AMPLITUDE = 0.001;
export const PARTICLE_REPEL_RADIUS = 6;
export const PARTICLE_REPEL_FORCE = 0.12;
export const PARTICLE_RESPAWN_OFFSET = 15;
export const PARTICLE_RESPAWN_BEHIND = 15;

// Glow proximity
export const GLOW_RADIUS = 8;
export const GLOW_OPACITY_BOOST = 0.25;
export const GLOW_SOLID_BOOST = 0.12;
export const GLOW_BRIGHT_THRESHOLD = 0.3;

// Geometry idle rotation
export const GEO_IDLE_ROTATION_SPEED = 0.03;

// Lens
export const LENS_LERP = 0.12;

// Reveal delays (ms)
export const REVEAL_DELAYS: Record<string, number> = {
  h3dGreeting: 150,
  'h3d-sub': 250,
  h3dChars: 350,
  h3dDesc: 500,
  'h3d-tags': 600,
  'h3d-btns': 700,
  h3dClock: 800,
};

// Typewriter
export const TYPEWRITER_BASE_DELAY = 60;
export const TYPEWRITER_JITTER = 40;
export const TYPEWRITER_START_DELAY = 1200;
export const CURSOR_FADE_DELAY = 2000;

// Clock
export const CLOCK_INTERVAL = 1000;

// Drag hint
export const DRAG_HINT_SHOW_DELAY = 1500;
export const DRAG_HINT_AUTO_HIDE = 6000;

// Character hover content
export const CHAR_CONTENT = [
  { t1: '喜欢', t2: '折腾的技术人', s: '烦' },
  { t1: '用代码', t2: '解决每一个难题', s: '恼' },
  { t1: '全栈开发', t2: '前后端通吃', s: '全' },
  { t1: '追求极简', t2: '与优雅的设计', s: '無' },
  { t1: '独立开发', t2: '者的先行者', s: '先' },
  { t1: '用产品', t2: '说话的生活家', s: '生' },
];
