import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import NavHeader from '../NavHeader'

const Navbar = () => {
    const [state, setState] = useState(false)
    const menuBtnEl = useRef()

    const navigation = [
        { name: "Features", href: "/#features" },
        { name: "About", href: "/#about" },
        { name: "Developers", href: "/#developers" },
        { name: "FAQs", href: "/#faqs" },
    ]

    useEffect(() => {
        document.onclick = (e) => {
            const target = e.target;
            if (!menuBtnEl.current.contains(target)) setState(false);
        };
    }, [])

    const buttonVariants = {
        hover: { scale: 1.05 },
        tap: { scale: 0.95 }
    }

    return (
        <header className='relative'>
            <div className="custom-screen md:hidden">
                <NavHeader menuBtnEl={menuBtnEl} state={state} onClick={() => setState(!state)} />
            </div>
            <nav className={`pb-5 md:text-sm md:static md:block ${state ? "bg-gray-900 absolute z-20 top-0 inset-x-0 rounded-b-2xl shadow-xl md:bg-gray-900" : "hidden"}`}>
                <div className="custom-screen items-center md:flex md:justify-between">
                    <NavHeader state={state} onClick={() => setState(!state)} />
                    <div className={`flex-1 items-center mt-8 text-gray-300 md:font-medium md:mt-0 md:flex md:justify-center ${state ? 'block' : 'hidden'} `}>
                        <ul className="flex flex-col items-center space-y-6 md:flex-row md:space-x-6 md:space-y-0">
                            {
                                navigation.map((item, idx) => {
                                    return (
                                        <li key={idx} className="hover:text-gray-50">
                                            <Link href={item.href} className="block">
                                                {item.name}
                                            </Link>
                                        </li>
                                    )
                                })
                            }
                        </ul>
                    </div>
                    <div className="flex flex-col gap-4 items-center justify-center mt-6 md:flex-row md:gap-x-6 md:mt-0">
                        <motion.button
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap="tap"
                            className="w-full md:w-auto px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                        >
                            Open Dashboard
                        </motion.button>
                        <motion.button
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap="tap"
                            className="w-full md:w-auto px-4 py-2 text-sm font-medium text-gray-900 bg-[#00FF00] rounded-lg hover:bg-[#28A428] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#32CD32]"
                        >
                            Download Occupi
                        </motion.button>
                    </div>
                </div>
            </nav>
        </header>
    )
}

export default Navbar