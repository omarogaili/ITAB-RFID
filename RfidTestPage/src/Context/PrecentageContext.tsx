import React, {createContext, useState, useContext, ReactNode} from 'react';
interface PercentageProps{
    percentage: number | null;
    setPercentage: (percentage: number | null) => void;
}
const PercentageContext = createContext<PercentageProps | undefined>(undefined);
interface PercentageProviderProps{
    children: ReactNode;
}
export const PercentageProvider: React.FC<PercentageProviderProps> = ({children}) => {
    const [percentage, setPercentage] = useState<number | null>(null);
    return (
        <PercentageContext.Provider value={{percentage, setPercentage}}>
            {children}
        </PercentageContext.Provider>
    );
};
export const UsePercentageContext = () : PercentageProps => {
    const context = useContext(PercentageContext);
    if (!context) {
        throw new Error('UsePercentageContext must be used within a PercentageProvider');
    }
    return context;
}