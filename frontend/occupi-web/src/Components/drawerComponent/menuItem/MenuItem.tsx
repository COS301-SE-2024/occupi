import { motion } from "framer-motion";

interface MenuItemProps {
    icon: JSX.Element;
    text: string;
    path: string;
    selectedItem: string,
    additionalClasses?: string;
    handleClick: (path: string) => void
  }
  
const MenuItem = ({ icon, text, path, selectedItem, additionalClasses, handleClick }: MenuItemProps) => {
  return (
    <motion.div className={`flex items-center w-[210px] h-[40px] mb-[15px] cursor-pointer rounded-[10px] hover:bg-secondary ${additionalClasses} ` 
      + (selectedItem === path ? "bg-secondary" : "")}
      onClick={() => handleClick(path)}
      whileTap={{ scale: 0.99 }}
      >
        <div className="ml-[30px]">
          {icon}
        </div>
        <p className="ml-[10px] text-base font-medium text-text_col">{text}</p>
      </motion.div>
  );
}

export default MenuItem;