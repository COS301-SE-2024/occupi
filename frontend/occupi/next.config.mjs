/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV === 'development';

const prodConfig = {
    basePath: '/occupi',
    assetPrefix: '/occupi/',
    output: 'export',
};

export default isDev ?  {}: prodConfig;
