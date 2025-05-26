import React, { createContext, useState, useContext, ReactNode } from 'react';
interface EndTestContextProps{
    endTest: boolean;
    setEndTest: (endTest: boolean) => void;
}
const EndTestContext = createContext<EndTestContextProps | undefined>(undefined);
interface EndTestProviderProps{
    children: ReactNode;
}
export const EndTestProvider: React.FC<EndTestProviderProps> = ({ children }) => {
    const [endTest, setEndTest] = useState(true);
    return (
        <EndTestContext.Provider value={{ endTest, setEndTest }}>
            {children}
        </EndTestContext.Provider>
    );
};
export const useEndTestContext = (): EndTestContextProps => {
    const context = useContext(EndTestContext);
    if (!context) {
        throw new Error('useEndTestContext must be used within a EndTestProvider');
    }
    return context;
}