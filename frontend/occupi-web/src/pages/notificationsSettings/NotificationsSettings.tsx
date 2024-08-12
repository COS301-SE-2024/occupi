import { RadioBox } from "@components/index"
import { motion } from "framer-motion"
export const NotificationsSettings = () => {
  return (
    <motion.div
    className="w-full p-4 rounded-lg overflow-y-auto overflow-x-hidden"
    initial={{ x: "100vw" }}
    animate={{ x: 0 }}
    transition={{ duration: 0.2, ease: "linear" }}
  >

<RadioBox />

    </motion.div>
  )
}
