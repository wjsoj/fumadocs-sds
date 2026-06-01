import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  images: {
    // 图片托管在外部图床(img-api.pku3d.com)，直接由浏览器加载，
    // 绕过 Next 服务端图片优化器（其在本地代理 fake-ip 环境下会因私有 IP 而拒绝抓取）。
    unoptimized: true,
    remotePatterns: [new URL('https://img-api.pku3d.com/**')],
  },
};

export default withMDX(config);
