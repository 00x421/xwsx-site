---
title: "用 Astro 构建个人网站是一种怎样的体验"
date: 2026-05-08
tags: ["Astro", "前端", "教程"]
summary: "分享我用 Astro 搭建个人站的心得，从内容管理、组件化到部署，聊聊这个框架为什么值得一试。"
featured: true
---

## 为什么选择 Astro

在搭建个人站之前，我对比了几个主流方案：

- **WordPress**：功能强大但太重，不想维护 PHP + MySQL
- **Hugo**：很快，但 Go 模板语法写起来不够顺手
- **Next.js**：杀鸡用牛刀，个人站不需要那么多服务端能力
- **Astro**：刚刚好 ✅

Astro 最吸引我的几点：

### 1. Content Collections

这是 Astro 5 引入的杀手级功能。你可以在 `src/content/` 下定义不同类型的内容，配上 Zod Schema 做校验：

```typescript
const articles = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.date(),
    tags: z.array(z.string()),
    summary: z.string(),
  }),
});
```

这样每篇 Markdown 文章的 frontmatter 都会校验，写错了会有类型提示。

### 2. Islands 架构

默认零 JS 输出，只有需要交互的组件才加载 JS。这对内容型网站来说是巨大的性能优势。

### 3. 组件化

支持直接在 Markdown/MDX 里嵌入 Astro 组件，写应用介绍页时可以放截图画廊、下载按钮，体验很好。

## 部署体验

用 Vercel 部署，`git push` 就自动构建上线，整个过程不到 5 分钟。

## 小结

如果你是个人开发者，想搭一个**好看、灵活、维护成本低**的个人站，Astro 是目前最平衡的选择。