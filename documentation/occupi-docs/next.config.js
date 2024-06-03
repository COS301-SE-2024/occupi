const withNextra = require('nextra')({
    theme: 'nextra-theme-docs',
    themeConfig: './theme.config.jsx'
  })

const isDev = process.env.NODE_ENV === 'development';
const isBackend = process.env.APP_ENV === 'backend';

const prodConfig = {
  basePath: '/occupi',
  assetPrefix: '/occupi/',
  output: 'export',
  images: {
    unoptimized: true
  }
};

const backendConfig = {
  basePath: '/documentation',
  assetPrefix: '/documentation/',
  output: 'export',
  images: {
    unoptimized: true
  }
}

module.exports = withNextra(isDev ?  {} : isBackend ? backendConfig : prodConfig);

// If you have other Next.js configurations, you can pass them as the parameter:
// module.exports = withNextra({ /* other next.js config */ })