import { TopNav } from "@components/index";
import { useState } from "react";

const Dashboard = () => {
    const [searchQuery, setSearchQuery] = useState("");

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    return (
        <div className="w-full">
            <TopNav searchQuery={searchQuery} onChange={handleInputChange} />
        </div>
    )
}

export default Dashboard