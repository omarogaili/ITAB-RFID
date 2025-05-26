import React, { createContext, useState, useContext, ReactNode } from 'react';

interface ButtonContextProps {
    selectedButton: ReactNode | null;
    setSelectedButton: (button: ReactNode) => void;
}

const ButtonContext = createContext<ButtonContextProps | undefined>(undefined);

interface ButtonProviderProps {
    children: ReactNode;
}

export const ButtonProvider: React.FC<ButtonProviderProps> = ({ children }) => {
    const [selectedButton, setSelectedButton] = useState<ReactNode | null>(null);

    return (
        <ButtonContext.Provider value={{ selectedButton, setSelectedButton }}>
            {children}
        </ButtonContext.Provider>
    );
};

export const useButtonContext = (): ButtonContextProps => {
    const context = useContext(ButtonContext);
    if (!context) {
        throw new Error('useButtonContext must be used within a ButtonProvider');
    }
    return context;
};