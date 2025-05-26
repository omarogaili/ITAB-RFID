import React, { useContext,createContext, useState, ReactNode} from 'react';
interface Coordinates {
    x: number;
    y: number;
    
}
interface CoordinatesContextProps {
    coordinates: Coordinates;
    setCoordinates: (coordinates: Coordinates) => void;
}
const CoordinatesContext = createContext<CoordinatesContextProps | undefined>(undefined);
interface CoordinatesProviderProps {
    children: ReactNode;
}
export const CoordinatesProvider: React.FC<CoordinatesProviderProps> = ({ children }) => {
    const [coordinates, setCoordinates] = useState<Coordinates>({ x: 0, y: 0 });
    return (
        <CoordinatesContext.Provider value={{ coordinates, setCoordinates }}>
            {children}
        </CoordinatesContext.Provider>
    );
};
export const useCoordinatesContext= () : CoordinatesContextProps => {
    const context = useContext(CoordinatesContext);
    if (!context) {
        throw new Error('useCoordinatesContext must be used within a CoordinatesProvider');
    }
    return context;
}