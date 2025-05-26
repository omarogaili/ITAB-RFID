import React from 'react';
import { useButtonContext } from '../Context/SelectedButtonContext';

const DisplaySelectedButton = () => {
    const { selectedButton } = useButtonContext();

    return (
        <div>
            {selectedButton}
        </div>
    );
};

export default DisplaySelectedButton;