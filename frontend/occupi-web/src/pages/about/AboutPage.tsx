import { AboutComponent } from "@components/index"
import { motion } from "framer-motion"

const AboutPage = () => {
  return (
    <motion.div
    data-testid='AboutPage'
    className="w-full p-4 rounded-lg overflow-y-auto overflow-x-hidden"
    initial={{ x: "100vw" }}
    animate={{ x: 0 }}
    transition={{ duration: 0.2, ease: "linear" }}
  >

      <AboutComponent></AboutComponent>
    </motion.div>
  )
}

export default AboutPage