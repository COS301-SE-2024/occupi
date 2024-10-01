import React from 'react';
import Recommendations from "../screens/Dashboard/Recommendations";

export default function Home() {
    const handleClose = () => {
        // Add your close logic here
        
        console.log('Recommendations closed');
    };

    return (
        <Recommendations onClose={handleClose} />
    );
}