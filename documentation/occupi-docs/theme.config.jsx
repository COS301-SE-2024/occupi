export default {
    head: (
        <>
            <meta name="description" content="This is occupi-s documentation site" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <meta property="og:title" content="occupi" />
            <meta property="og:description" content="This is occupi-s documentation site" />
            <link rel="icon" type="image/svg+xml" href="https://raw.githubusercontent.com/COS301-SE-2024/occupi/5f614e7d881c9d4f65ec2cf6ea60bf5542eb77a7/presentation/Occupi/image_2024-05-21_213821107.svg" />
        </>
    ),
    logo: (
        <>
            <img 
                style={{height: "30px"}}
                src="https://raw.githubusercontent.com/COS301-SE-2024/occupi/5f614e7d881c9d4f65ec2cf6ea60bf5542eb77a7/presentation/Occupi/image_2024-05-21_213821107.svg" 
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
    footerText: `MIT ${new Date().getFullYear()} © Occupi.`,
}