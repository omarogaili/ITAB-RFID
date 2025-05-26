import React, { createContext, useState, useContext, ReactNode } from 'react';
interface ButtonContextProps{
    SelectedButtonTansport: ReactNode | null;
    setSelectedButtonTansport: (button: ReactNode) => void;
}
const ButtonContext = createContext<ButtonContextProps | undefined>(undefined);
interface ButtonProviderProps{
    children: ReactNode;
}
export const ButtonProviderTow: React.FC<ButtonProviderProps> = ({ children }) => {
    const [SelectedButtonTansport, setSelectedButtonTansport] = useState<ReactNode | null>(null);
    return (
        <ButtonContext.Provider value={{ SelectedButtonTansport, setSelectedButtonTansport }}>
            {children}
        </ButtonContext.Provider>
    );
};
export const useButtonContextTansport = (): ButtonContextProps => {
    const context = useContext(ButtonContext);
    if (!context) {
        throw new Error('useButtonContext must be used within a ButtonProvider');
    }
    return context;
};