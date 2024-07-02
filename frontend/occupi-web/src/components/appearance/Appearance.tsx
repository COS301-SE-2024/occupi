import { motion } from "framer-motion";
import { Macbook1, Macbook2, Macbook3 } from "@assets/index";
import { useEffect, useState } from "react";

const Appearance = () => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme') || 'system';
    return savedTheme;
  });

  useEffect(() => {
    const applyTheme = (theme: string) => {
      if (theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        document.documentElement.classList.toggle('dark', systemTheme === 'dark');
      } else {
        document.documentElement.classList.toggle('dark', theme === 'dark');
      }
    };

    applyTheme(theme);
    localStorage.setItem('theme', theme);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const setThemeHandler = (theme: string) => {
    setTheme(theme);
  };

  return (
    <motion.div
      className="w-full p-4 rounded-lg overflow-y-auto overflow-x-hidden"
      initial={{ x: "100vw" }}
      animate={{ x: 0 }}
      transition={{ duration: 0.2, ease: "linear" }}
    >
      <div className="w-full flex justify-between">
        <div>
          <div className="w-full h-9 text-text_col text-base font-semibold font-['Inter'] leading-none">
            Accent colour
          </div>
          <div className="w-full h-9 opacity-65  text-text_col_secondary_alt text-base font-normal font-['Inter'] leading-none">
            Select or customize your accent colours
          </div>
        </div>

        <div>
          <div className="w-full h-12  items-center relative ">
            <div className="flex items-center">
              <div className="w-12 h-12 relative flex-shrink-0">
                <div className="w-10 h-10 absolute inset-1 bg-neutral-950 rounded-full" />
                <div className="w-12 h-12 absolute inset-0 rounded-3xl border-2 border-primary_alt" />
              </div>
              
              <motion.div whileTap={{scale: 0.97}} className="w-10 h-10 mx-1 bg-red-500 rounded-full" />
              <motion.div whileTap={{scale: 0.97}} className="w-10 h-10 mx-1 bg-amber-300 rounded-full" />
              <motion.div whileTap={{scale: 0.97}} className="w-10 h-10 mx-1 bg-lime-400 rounded-full" />
              <motion.div whileTap={{scale: 0.97}} className="w-10 h-10 mx-1 bg-green-400 rounded-full" />
              <motion.div whileTap={{scale: 0.97}} className="w-10 h-10 mx-1 bg-cyan-300 rounded-full" />
              <motion.div whileTap={{scale: 0.97}} className="w-10 h-10 mx-1 bg-blue-500 rounded-full" />
              <motion.div whileTap={{scale: 0.97}} className="w-10 h-10 mx-1 bg-purple-500 rounded-full" />
              <motion.div whileTap={{scale: 0.97}} className="w-10 h-10 mx-1 bg-fuchsia-500 rounded-full" />
            </div>
          </div>

          <div className="w-full h-10 mt-4 flex items-center">
            <div className="w-28 opacity-65  text-text_col_secondary_alt text-base font-normal font-['Inter'] leading-none">
              Custom colour:
            </div>
            <div className="w-40 h-10 pl-5 py-2.5 rounded-2xl flex items-center justify-center">
              <input
                type="text"
                placeholder="Enter colour"
                onChange={() => {}}
                className="w-[158px] h-[40px] rounded-[15px] bg-secondary p-[8px]"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="h-0.5 bg-tertiary rounded-2xl my-4" />

      <div className="w-full flex justify-between mb-10">
        <div>
          <div className="w-full h-9 text-text_col text-base font-semibold font-['Inter'] leading-none">
            Themes
          </div>
          
          <div className="w-full h-9 opacity-65  text-text_col_secondary_alt text-base font-normal font-['Inter'] leading-none">
            Switch between multiple themes
          </div>
        </div>

        <div className=" text-text_col text-base  font-semibold ">
          <div className="w-full items-center relative flex gap-10">
            <div className="flex flex-col items-center">
              <motion.div 
                data-testid="system-theme"
                className={"w-40 h-24 rounded-[15px] overflow-hidden " + (theme === "system" ? "border-[3px] border-primary_alt" : "")}
                whileTap={{scale: 0.97}} onClick={() => setThemeHandler("system")}>
                <img src={Macbook3} alt="system" className="min-w-[100%] h-[100%] inline m-auto object-cover"  />
              </motion.div>
              <span className="mt-1">System</span>
            </div>
            <div className="flex flex-col items-center ">
              <motion.div 
                data-testid="light-theme"
                className={"w-40 h-24 rounded-[15px] overflow-hidden " + (theme === "light" ? "border-[3px] border-primary_alt" : "")}
                whileTap={{scale: 0.97}} onClick={() => setThemeHandler("light")}>
                <img src={Macbook1} alt="light" className="min-w-[100%] h-[100%] inline m-auto object-cover" />
              </motion.div>
              <span className="mt-1">Snowflake</span>
            </div>
            <div className="flex flex-col items-center ">
              <motion.div 
                data-testid="dark-theme"
                className={"w-40 h-24 rounded-[15px] overflow-hidden " + (theme === "dark" ? "border-[3px] border-primary_alt" : "")} 
                whileTap={{scale: 0.97}} onClick={() => setThemeHandler("dark")}>
                <img src={Macbook2} alt="dark" className="min-w-[100%] h-[100%] inline m-auto object-cover" />
              </motion.div>
              <span className="mt-1">Midnight</span>
            </div>
          </div>
        </div>
      </div>

      <div className="h-0.5 bg-tertiary rounded-2xl my-4" />
    </motion.div>
  );
};

export default Appearance;
