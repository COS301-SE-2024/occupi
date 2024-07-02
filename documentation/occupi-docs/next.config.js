const withNextra = require('nextra')({
    theme: 'nextra-theme-docs',
    themeConfig: './theme.config.jsx'
})

const isDev = process.env.NODE_ENV === 'development';

module.exports = withNextra(
        isDev ? {} : 
        {
            publicRuntimeConfig: {
                basePath: '/docs',
                assetPrefix: '/docs/',
            }
        }
    );

// If you have other Next.js configurations, you can pass them as the parameter:
// module.exports = withNextra({ /* other next.js config */ })
