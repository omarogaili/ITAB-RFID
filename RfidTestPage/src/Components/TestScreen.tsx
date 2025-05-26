import { useState, useEffect, useRef } from "react";
import Style from "../Styles/TestScreen.module.css";
import { useCoordinatesContext } from "../Context/CoordinatesContext";
import { UsePercentageContext } from "../Context/PrecentageContext";
import HeatMap from "./HeatMap";
import { useEndTestContext } from "../Context/EndTestContex";
import { useButtonContext } from "../Context/SelectedButtonContext";
import { useButtonContextTansport } from "../Context/SelectedTransport";
import ImageTest from "./DisplayITestResultat";
import html2canvas from "html2canvas";

export function ConnectToBackEnd() {
    // useState to manage the state of the component
    const [data, setData] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [image, setImage] = useState<string | null>(null);
    // toggle the connection status between true and false
    const [isConnected, setIsConnected] = useState(false);
    // those two states are used to save the coordinates which are received from the backend 
    const { coordinates, setCoordinates } = useCoordinatesContext();
    const coordinatesArray = Array.isArray(coordinates) ? coordinates : [coordinates];
    // those two states are used to save the percentage which are received from the backend
    const { percentage, setPercentage } = UsePercentageContext();
    const { endTest, setEndTest } = useEndTestContext();
    const [imageName, setImageName] = useState("");
    const [takeImage, setTakeImage] = useState(false);
    const { selectedButton } = useButtonContext();
    const { SelectedButtonTansport } = useButtonContextTansport();
    const captureRef = useRef<HTMLDivElement>(null);

    const getNextImageName = async () => {
        try {
            const apiUrl= import.meta.env.VITE_API_URL;
            const response = await fetch(`${apiUrl}/api/all_images`);
            const data = await response.json();
            // saving the images. the name of the images is starting with test1.png, test2.png, test3.png, etc.
            const imageNames = data.images.map((img: { name: string }) => img.name);
            let nextImageNumber = 1;
            while (imageNames.includes(`test${nextImageNumber}.png`)) {
                nextImageNumber++;
            }
            return `test${nextImageNumber}.png`;
        } catch (error) {
            console.error("Error fetching image names:", error);
            return null;
        }
    };
// this function is used to take a screenshot of the image and send it to the backend. we save the image path in to the database. 
    const takeScreenshot = async () => {
        if (!captureRef.current) return;
        const canvas = await html2canvas(captureRef.current);
        const imageData = canvas.toDataURL("image/png");
        const nextImageName = await getNextImageName();
        if (!nextImageName) return;

        try {
            const apiUrl = import.meta.env.VITE_API_URL;
            const response = await fetch( `${apiUrl}/api/image_upload`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ image: imageData, image_name: nextImageName })
            });
            const result = await response.json();
            console.log("Server response:", result);
            setEndTest(true);
        } catch (error) {
            console.error("Error uploading image:", error);
        }
    };

    useEffect(() => {
        const apiUrl = import.meta.env.VITE_WEB_SOCKET_URL;
        // connect to the WebSocket server using the URL from .env
        let pythonWs: WebSocket | null = new WebSocket(`${apiUrl}`);
        pythonWs.onopen = () => {
            console.log("Python WebSocket connection opened");
            setIsConnected(true);
            setIsLoading(false);
        };
        // Receiving the data from the backend the name of the data is Mqtt_data 
        pythonWs.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                console.log("Received message from Python:", message);
                if (message.type === "Mqtt_data") {
                    // in Mqtt_data we should receive products. saving all products in data state
                    setData(message.products.map((product: any) => product.Product));
                    console.log("Received data from MQTT:", message.products);
                    // save all Percentage in percentage state
                    setPercentage(message.percentage);
                } else if (message.type === "image") {
                    // the second type of the message the backend should send is an analysis image. the image is in base64 format. and it should have a coordinates.
                    setImage(message.image_base64 ? `data:image/jpeg;base64,${message.image_base64}` : null);
                    message.detected_data.forEach((image: any) => {
                        console.log("Received X and Y coordinates: ", image.axelX, image.axelY);
                        // save the coordinates in coordinates state
                        setCoordinates({ x: image.axelX, y: image.axelY });
                    });
                }
            } catch (error) {
                console.error("Error parsing WebSocket message:", error);
            }
        };
        pythonWs.onerror = (error) => {
            console.error("Python WebSocket error:", error);
        };
        pythonWs.onclose = () => {
            console.log("WebSocket closed.");
            setIsConnected(false);
        };
        return () => {
            if (pythonWs) {
                pythonWs.close();
            }
        };
    }, []);

    console.log("testValue", { endTest });
    console.log("data", data);
    console.log("percentage", percentage);

    interface Coordinate {
        x: number;
        y: number;
    }

    // this interface is used to save the coordinates to be used in heatmap
    interface HeatmapData {
        x: number;
        y: number;
        percentage: number;
    }
    //  by using the object of the interface we can save the coordinates and percentage in one object
    const heatmapData: HeatmapData[] = coordinatesArray.map((coord: Coordinate) => ({
        x: coord.x,
        y: coord.y,
        percentage: percentage ?? 0,
    }));

    if (endTest) {
        return (
            <div>
                <h1>Start The Test</h1>
                {image && <img src={image} alt="From Xovis Sensor" className={Style.Image} />}
                <ImageTest />
            </div>
        );
    }

    if (isLoading || !isConnected) {
        return <p>Loading...</p>;
    }

    return (
        <div className={Style.Container}>
            <div className={Style.ImageContainer} ref={captureRef}>
                <HeatMap data={heatmapData} />
                {image && <img src={image} alt="From Xovis Sensor" className={Style.Image} />}
            </div>
            <div>
                {!takeImage && (
                    <div className={Style.ImageContainer}>
                        <button onClick={takeScreenshot} className={Style.StopRecording}> Stop</button>
                    </div>
                )}
            </div>
            <div className={Style.DataContainer}>
                {data.map((product: string, index: number) => (
                    <p key={index}>{product}</p>
                ))}
                <p>Percentage: {percentage}</p>
            </div>
        </div>
    );
}