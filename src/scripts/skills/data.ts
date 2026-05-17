export interface SkillData {
  name: string;
  cat: string;
  level: number;
  color: string;
  desc: string;
  tags: string[];
}

export const skillsData: SkillData[] = [
  { name:'TypeScript', cat:'前端', level:5, color:'#6ba3b7',
    desc:'日常主力语言，写过中型后台系统 + 内部 CLI 工具库。类型系统熟练。',
    tags:['泛型','类型推导','工程化'] },
  { name:'React', cat:'前端', level:5, color:'#6ba3b7',
    desc:'Hooks 深度使用，做过后台 / 前台 / 桌面三端应用。',
    tags:['Hooks','状态管理','组件设计'] },
  { name:'Astro', cat:'前端', level:4, color:'#6ba3b7',
    desc:'本站基于 Astro 5，熟悉 Islands 架构与自定义集成。',
    tags:['Islands','SSG','集成'] },
  { name:'CSS / Tailwind', cat:'前端', level:4, color:'#6ba3b7',
    desc:'能写出可维护的样式系统，也爱折腾交互细节和动效。',
    tags:['Grid','动画','设计Token'] },
  { name:'Three.js / WebGL', cat:'前端', level:3, color:'#6ba3b7',
    desc:'基础场景搭建、粒子系统，本站技能页就是练习作品。',
    tags:['Three.js','Shader','粒子'] },
  { name:'Node.js', cat:'后端', level:4, color:'#d4a574',
    desc:'服务端开发、CLI 工具、BFF 层，写过完整后台系统。',
    tags:['Express','WebSocket','API'] },
  { name:'Python', cat:'后端', level:4, color:'#d4a574',
    desc:'数据处理脚本、自动化工具，偶尔写后端接口。',
    tags:['FastAPI','Pandas','自动化'] },
  { name:'Rust', cat:'后端', level:3, color:'#d4a574',
    desc:'入门中，写过 CLI 小工具，正在被 borrow checker 教育。',
    tags:['CLI','所有权','学习'] },
  { name:'SQL / SQLite', cat:'后端', level:3, color:'#d4a574',
    desc:'基础查询、表设计、简单优化，够用级别。',
    tags:['查询','表设计','优化'] },
  { name:'Tauri', cat:'桌面开发', level:4, color:'#a0887a',
    desc:'用 Tauri 做过桌面端工具，Rust + Web 混合架构。',
    tags:['Tauri','Rust','跨平台'] },
  { name:'Electron', cat:'桌面开发', level:3, color:'#a0887a',
    desc:'之前的桌面方案，复杂但可靠，做过完整项目。',
    tags:['Electron','IPC','打包'] },
  { name:'Git / GitHub', cat:'DevOps', level:5, color:'#7bc7a0',
    desc:'日常操作流畅，rebase / worktree / 子模块都 ok。',
    tags:['Rebase','Workflow','Git'] },
  { name:'Docker', cat:'DevOps', level:3, color:'#7bc7a0',
    desc:'能写 Dockerfile 和 docker-compose，满足日常需要。',
    tags:['Docker','Compose','部署'] },
  { name:'CI / CD', cat:'DevOps', level:3, color:'#7bc7a0',
    desc:'GitHub Actions 配置，自动构建部署流程。',
    tags:['Actions','自动化','流水线'] },
  { name:'Vercel / Cloudflare', cat:'DevOps', level:4, color:'#7bc7a0',
    desc:'前端主力部署平台，配置过边缘函数。',
    tags:['Vercel','Cloudflare','边缘'] },
  { name:'Figma', cat:'设计', level:3, color:'#c77dba',
    desc:'能画界面和原型，不专业但够和设计师交流。',
    tags:['设计','原型','协作'] },
  { name:'UI / UX 基础', cat:'设计', level:3, color:'#c77dba',
    desc:'了解基本设计原则，知道什么是好设计。',
    tags:['UI','UX','设计原则'] },
];

export const orbitConfigs = [
  { r: 2.3, tiltX: 0.12, tiltZ: 0.04, speed: 0.10 },
  { r: 3.6, tiltX: -0.20, tiltZ: 0.15, speed: 0.07 },
  { r: 4.9, tiltX: 0.08, tiltZ: -0.12, speed: 0.05 },
];

export interface ThemeColors {
  bg: number;
  fog: number;
  core: number;
  coreEmissive: number;
  wire: number;
  glow: number;
  ring: number;
  starOpacity: number;
}

export const THEMES: Record<string, ThemeColors> = {
  dark: {
    bg: 0x08080f,
    fog: 0x08080f,
    core: 0x141e2e,
    coreEmissive: 0x0a1420,
    wire: 0x3a5a7a,
    glow: 0x3366aa,
    ring: 0x1a2535,
    starOpacity: 0.65,
  },
  light: {
    bg: 0xe8e4de,
    fog: 0xe8e4de,
    core: 0xc8ccd4,
    coreEmissive: 0xb8bcc8,
    wire: 0x8899aa,
    glow: 0x8899bb,
    ring: 0xccd0d8,
    starOpacity: 0.15,
  },
};
