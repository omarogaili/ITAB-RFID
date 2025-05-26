import React, { useState, useEffect } from 'react';
import style from '../Styles/HeatMap.module.css';
import { UsePercentageContext } from '../Context/PrecentageContext';
import { useCoordinatesContext } from '../Context/CoordinatesContext';

interface HeatmapData {
    x: number;
    y: number;
    percentage: number | null;
}

interface HeatMapProps {
    data: HeatmapData[];
}

const HeatMap: React.FC<HeatMapProps> = ({ data }) => {
    const { coordinates } = useCoordinatesContext();
    const { percentage } = UsePercentageContext();
    const [heatmapData, setHeatmapData] = useState<HeatmapData[]>(data);

    // Återställ heatmapData
    const resetHeatmap = () => {
        setHeatmapData([]);
    };

    useEffect(() => {
        if (coordinates.x !== null && coordinates.y !== null && percentage !== null) {
            setHeatmapData(prevData => [...prevData, { x: coordinates.x, y: coordinates.y, percentage }]);
        }
    }, [coordinates, percentage]);

    const getColor = (percentage: number | null) => {
        if (percentage !== null && percentage <= 10) {
            return "rgb(139, 0, 0)";
        } else if (percentage !== null && percentage <= 20) {
            return "rgb(255, 0, 0)"; 
        } else if (percentage !== null && percentage <= 30) {
            return "rgb(255, 69, 0)"; 
        } else if (percentage !== null && percentage <= 40) {
            return "rgb(255, 165, 0)";
        } else if (percentage !== null && percentage <= 50) {
            return "rgb(255, 215, 0)";
        } else if (percentage !== null && percentage <= 60) {
            return "rgb(255, 255, 0)"; 
        } else if (percentage !== null && percentage <= 70) {
            return "rgb(173, 255, 47)"; 
        } else if (percentage !== null && percentage <= 80) {
            return "rgb(50, 205, 50)";  
        } else if (percentage !== null && percentage <= 90) {
            return "rgb(0, 128, 0)";    
        }
        return "rgb(0, 128, 0)";    
    };

    const isTestGreen = () => {
        return heatmapData.some(data => data.percentage !== null && data.percentage > 70);
    };

    return (
        <div>
            {/* SVG för heatmap */}
            <svg className={style.heatmap}>
                {heatmapData.map((data, index) => (
                    <circle key={index} cx={data.x} cy={data.y} r="7" fill={getColor(data.percentage)} />
                ))} 
            </svg>

            {/* Teststatus */}
            <p>Test Status: {isTestGreen() ? "Green" : "Red"}</p>

            {/* Knapp för att återställa heatmap */}
            <button onClick={resetHeatmap} className={style.resetButton}>
                Reset Heatmap
            </button>
        </div>
    );
};

export default HeatMap;