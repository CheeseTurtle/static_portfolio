import remarkFrontmatter from 'remark-frontmatter';
import remarkMdxFrontmatter from 'remark-mdx-frontmatter';

export default {
  jsx: true,
  plugins: [remarkFrontmatter, remarkMdxFrontmatter]
};