import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  images: {
    remotePatterns: [new URL('https://img-api.pku3d.com/**')],
  },
};

export default withMDX(config);
