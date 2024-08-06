import { motion } from "framer-motion";

const variants = {
    open: {
        width: "95%",
    },
    closed: {
        width: "40px",
    }
}

type SideNavBarButtonProps = {
    icon: () => JSX.Element;
    text: string;
    isMinimized: boolean;
    selected_panel: string;
    setSelectedPanelF: (arg: string) => void;
}

const SideNavBarButton = (props: SideNavBarButtonProps) => {
    return (
        <motion.div className={"hover_buttons hover:bg-primary_alt hover_buttons_text h-[40px] cursor-pointer flex items-center rounded-[10px] mb-[15px] " + 
        (props.isMinimized ? " justify-center " : "") +
        (props.selected_panel === props.text ? " selected_buttons bg-primary_alt selected_buttons_text " : "")} 
            whileTap={{scale: 0.98}}
            onClick={() => {props.setSelectedPanelF(props.text);}}
            animate={props.isMinimized ? "closed" : "open"}
            variants={variants}>
                <div className={"w-[24px] h-[24px]" + (props.isMinimized ? "" : " ml-[30px]")}>
                    <props.icon />
                </div>
                {!props.isMinimized && <h2 className="ml-[10px] text-text_col mt-[-8px] h-[14px] font-medium text-sm">{props.text}</h2>}
        </motion.div>
    )
}

export default SideNavBarButton