/** @type {import('next').NextConfig} */

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
    basePath: '/landing',
    assetPrefix: '/landing/',
    output: 'export',
    images: {
        unoptimized: true
    }
}

export default isDev ?  {} : isBackend ? backendConfig : prodConfig;
