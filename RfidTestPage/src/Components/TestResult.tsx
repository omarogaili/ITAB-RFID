import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useCoordinatesContext } from "../Context/CoordinatesContext";
import { UsePercentageContext } from "../Context/PrecentageContext";
import HeatMap from "./HeatMap";
import Style from "../Styles/TestResult.module.css";
import imageSS from '../../../TestLog/test1.jpg';
interface DetectedData {
    // Assuming detected_data is an array of objects with axelX and axelY properties
    axelX: number;
    axelY: number;
}
interface Product {
    // Assuming products is an array of objects with id, EPC, and Product properties
    id: number;
    EPC: string;
    Product: string;
}
interface TestLogData {
    // Assuming json_data is an array of objects with detected_data, percentage, and products properties
    detected_data: DetectedData[];
    percentage: number;
    products: Product[];
}
const TestResult = () => {
    const { setCoordinates } = useCoordinatesContext();
    const { setPercentage } = UsePercentageContext();
    // Get the image name from the URL parameters
    const { imageName } = useParams<{ imageName: string }>();
    // UseState to manage the state of Date based on the TestLogData interface 
    const [data, setData] = useState<TestLogData[]>([]);
    // ever product should have a unique id, EPC and Product name. this state used to store the products based on Product interface
    const [products, setProducts] = useState<Product[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    // used to create the heatmap based on the detected data
    const [heatmapData, setHeatmapData] = useState<{ x: number; y: number; percentage: number; products: Product[] }[]>([]);
    // those two states are used to store the test case and transport method (if it's Shopping Bag or Shopping Cart) 
    //! needed to be displayed in the test result page
    const [testCase, setTestCase] = useState<string | null>(null);
    const [transport, setTransport] = useState<string | null>(null); 

    useEffect(() => {
        const fetchTestData = async () => {
            try {
                const apiUrl= import.meta.env.VITE_API_URL;
                const response = await fetch(`${apiUrl}/api/test_result/${imageName}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const jsonData = await response.json();
                console.log("Fetched data:", jsonData);
                setTestCase(jsonData.test_case);
                setTransport(jsonData.transport);
                setData(jsonData.json_data || []);
            } catch (error) {
                console.error("Error fetching test data:", error);
            }
        };
        fetchTestData();
    }, [imageName]);
// this effect is used to update the coordinates, percentage and products based on the current index
    useEffect(() => {
        if (data.length > 0) {
            const { detected_data, percentage, products } = data[currentIndex];
            if (detected_data.length > 0) {
                setCoordinates({ x: detected_data[0].axelX, y: detected_data[0].axelY });
            }
            setPercentage(percentage);
            setProducts(products);
            console.log(`Products we get: ${products}`);
            setHeatmapData(data.slice(0, currentIndex + 1).flatMap((d) =>
                d.detected_data.map((point) => ({
                    x: point.axelX,
                    y: point.axelY,
                    percentage: d.percentage,
                    products: d.products,
                }))
            ));
        }
    }, [currentIndex, data, setCoordinates, setPercentage]);
// this effect is used to play the test result, it will update the current index every 100ms until it reaches the end of the data array
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isPlaying) {
            interval = setInterval(() => {
                setCurrentIndex((prevIndex) => {
                    if (prevIndex + 1 < data.length) {
                        return prevIndex + 1;
                    } else {
                        setIsPlaying(false); 
                        return prevIndex;
                    }
                });
            }, 100);
        }
        return () => clearInterval(interval);
    }, [isPlaying, data]);

    // this function is used to group the products based on their name and count them
    const groupProducts = (products: Product[]) => {
        const productCount: { [key: string]: number } = {};
        products.forEach((product) => {
            if (product.Product in productCount) {
                productCount[product.Product]++;
            } else {
                productCount[product.Product] = 1;
            }
        });
        return Object.entries(productCount).map(([productName, count]) => ({
            name: productName,
            count,
        }));
    };

    if (data.length === 0) {
        return <p>Loading...</p>;
    }
    const groupedProducts = groupProducts(products);

    return (
        <div className={Style.Container}>
            <div className={Style.ImageContainer}>
                <img src={imageSS} alt="test" className={Style.Image} />
                <HeatMap data={heatmapData} />
            </div>
            <p>Detection Percentage: {data[currentIndex].percentage}%</p>
            <p>Test Case: {testCase}</p>
            <p>Transport: {transport}</p> 
            {groupedProducts.map((product) => (
                <div key={product.name}>
                    <p>{product.name} {product.count}</p>
                </div>
            ))}
            <div style={{ marginTop: "10px" }}>
                {/*range input to scroll forward and back the test */}
                <input
                    type="range"
                    min="0"
                    max={data.length - 1}
                    value={currentIndex}
                    title="Select detection frame"
                    onChange={(e) => {
                        const newIndex = Number(e.target.value);
                        setCurrentIndex(newIndex);
                        setHeatmapData(data.slice(0, newIndex + 1).flatMap((d) =>
                            d.detected_data.map((point) => ({
                                x: point.axelX,
                                y: point.axelY,
                                percentage: d.percentage,
                                products: d.products,
                            }))
                        ));
                    }}
                />
                <button onClick={() => setIsPlaying(!isPlaying)}>
                    {isPlaying ? "Pause" : "Play"}
                </button>
            </div>
        </div>
    );
};

export default TestResult;