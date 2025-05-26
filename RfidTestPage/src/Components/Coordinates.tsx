import { useCoordinatesContext } from "../Context/CoordinatesContext";
const Coordinates = () => {
    // Import the coordinates context
    // This context provides the coordinates (x, y) of the Xovis sensor
    const { coordinates } = useCoordinatesContext();

    return (
        <div>
            X: {coordinates.x}, Y: {coordinates.y} 
        </div>
    );
}
export default Coordinates;