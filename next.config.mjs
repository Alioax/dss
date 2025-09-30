// next.config.mjs
const isProd = process.env.NODE_ENV === "production";

// If repo is https://alioax.github.io/dss -> set to "dss"
// If repo is https://alioax.github.io       -> set to ""
const repo = "dss"; // <— REPLACE THIS

export default {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  basePath: isProd && repo ? `/${repo}` : "",
  assetPrefix: isProd && repo ? `/${repo}/` : "",
};
