import Head from "next/head"
import Footer from "./ui/Footer"
import Navbar from "./ui/Navbar"

const Layout = ({ children }) => {
    return (
        <>
            <Head>
                <title>occupi</title>
                <meta name='description' content="Gain control of your business's growth with Occupi's comprehensive office analystics, capacity prediction, and ocuppancy prediction platform." />
                <meta name='viewport' content='width=device-width, initial-scale=1' />
                <link rel="icon" type="image/svg+xml" href="/occupi.svg" />
            </Head>
            <Navbar />
            <main>{children}</main>
            <Footer />
        </>
    )
}

export default Layout