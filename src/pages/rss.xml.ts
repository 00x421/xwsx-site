import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context: any) {
  const articles = await getCollection('articles');
  const sorted = articles.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

  return rss({
    title: '烦恼全無先生',
    description: '技术分享、开发心得、效率思考',
    site: context.site,
    items: sorted.map(article => ({
      title: article.data.title,
      pubDate: article.data.date,
      description: article.data.summary,
      link: `/articles/${article.slug}/`,
    })),
  });
}
