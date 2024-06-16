const withNextra = require('nextra')({
    theme: 'nextra-theme-docs',
    themeConfig: './theme.config.jsx'
  })

const isDev = process.env.NODE_ENV === 'development';

const prodConfig = {
  basePath: '/docs',
  assetPrefix: '/docs/',
};

module.exports = withNextra(isDev ? {} : prodConfig);

// If you have other Next.js configurations, you can pass them as the parameter:
// module.exports = withNextra({ /* other next.js config */ })