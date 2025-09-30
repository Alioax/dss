// /** @type {import('next').NextConfig} */
// const nextConfig = {};

// export default nextConfig;

// next.config.mjs
const isProd = process.env.NODE_ENV === "production";

// If deploying to https://USERNAME.github.io/REPO, set repo below.
// If deploying to https://USERNAME.github.io (user/org page), leave as "".
const repo = "YOUR_REPO_NAME"; // e.g. "dss-app"

export default {
  output: "export",            // enables static export to ./out
  trailingSlash: true,         // makes /route/ -> /route/index.html (needed for Pages)
  images: { unoptimized: true },
  basePath: isProd && repo ? `/${repo}` : "",
  assetPrefix: isProd && repo ? `/${repo}/` : "",
};
