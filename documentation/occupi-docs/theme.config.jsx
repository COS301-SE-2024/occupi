export default {
    head: (
        <>
            <meta name="description" content="This is occupi-s documentation site" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <meta property="og:title" content="occupi" />
            <meta property="og:description" content="This is occupi-s documentation site" />
            <link rel="icon" type="image/svg+xml" href="https://raw.githubusercontent.com/COS301-SE-2024/occupi/5614db6d7821bb21b94125c83bc5a46126c5acac/frontend/occupi-web/public/occupi.svg" />
            <title>Occupi</title>
        </>
    ),
    logo: (
        <>
            <img 
                style={{height: "30px"}}
                src="https://raw.githubusercontent.com/COS301-SE-2024/occupi/5614db6d7821bb21b94125c83bc5a46126c5acac/frontend/occupi-web/public/occupi.svg" 
                />
            <span style={{ marginLeft: '.4em', fontWeight: 800 }}>
                occupi-docs
            </span>
        </>
    ),
    project: {
        link: 'https://github.com/COS301-SE-2024/occupi',
    },
    chat: {
        link: 'https://discord.com',
    },
    docsRepositoryBase: 'https://github.com/COS301-SE-2024/occupi/documentation/occupi-docs',
    footer: {
        text: (
            <span>
                MIT {new Date().getFullYear()} ©{' '}
                <a href="https://occupi.tech" target="_blank">
                occupi
                </a>
                .
            </span>
        )
    }
}