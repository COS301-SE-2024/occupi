const withNextra = require('nextra')({
    theme: 'nextra-theme-docs',
    themeConfig: './theme.config.jsx'
})

const isProd = process.env.APP_ENV === 'production';

const prodConfig = {
  basePath: '/docs',
  assetPrefix: '/docs/',
};

module.exports = withNextra(isProd ? prodConfig : {});

// If you have other Next.js configurations, you can pass them as the parameter:
// module.exports = withNextra({ /* other next.js config */ })
