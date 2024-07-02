import Image from "next/image"

const Brand = ({ ...props }) => (
    <Image
        src="/occupi.svg"
        alt="Occupi logo"
        {...props}
        width={40}
        height={40}
        priority
    />
)
export default Brand