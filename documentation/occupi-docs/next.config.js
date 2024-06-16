const withNextra = require('nextra')({
    theme: 'nextra-theme-docs',
    themeConfig: './theme.config.jsx'
})

const prodConfig = {
  basePath: '/docs',
  assetPrefix: '/docs/',
};

module.exports = withNextra(prodConfig);

// If you have other Next.js configurations, you can pass them as the parameter:
// module.exports = withNextra({ /* other next.js config */ })
