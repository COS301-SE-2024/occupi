/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV === 'development';
const isBackend = process.env.APP_ENV === 'backend';

const prodConfig = {
    basePath: '/occupi',
    assetPrefix: '/occupi/',
    output: 'export',
};

const backendConfig = {
    basePath: '/documentation',
    assetPrefix: '/documentation/',
    output: 'export',
}

export default isDev ?  {} : isBackend ? backendConfig : prodConfig;
