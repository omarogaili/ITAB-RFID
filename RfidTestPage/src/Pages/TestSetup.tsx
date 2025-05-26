import { useState } from 'react';
import { faSatelliteDish, faBasketShopping, faCartShopping, faBagShopping } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import style from '../Styles/testsetUp.module.css';
import { useButtonContext } from '../Context/SelectedButtonContext';
import { useNavigate } from 'react-router-dom';
import { useButtonContextTansport } from '../Context/SelectedTransport';

const TestSetup = () => {
    {/* This is used to set the selected button for the test description */ }
    const { setSelectedButton } = useButtonContext(); 
    {/* This is used to set the selected button for the transport method */ }
    const { setSelectedButtonTansport } = useButtonContextTansport();
    {/* This is used to navigate between pages */ }
    const navigate = useNavigate();
    {/* This is used to set the selected button for the test description */ }
    const [quantity, setQuantity] = useState<string>("");
    const [testDescription, setTestDescription] = useState<string | null>(null);
    const [transport, setTransport] = useState<string | null>(null);

    {/* handleQuantityChange used to empty the Quantity input */ }
    const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuantity(e.target.value);
    };

    const handleDescriptionClick = (description: string) => {
        setTestDescription(description);
    };

    const handleTransportClick = (transportValue: string) => {
        setTransport(transportValue); 
    };

    const handleSubmit = async () => {
        if (!quantity || isNaN(Number(quantity))) {
            alert("Please enter a valid number for the quantity.");
            return;
        }
        if (!testDescription) {
            alert("Please select a test description.");
            return;
        }
        if (!transport) {
            alert("Please select a transport method.");
            return;
        }

        // send the data to the backend. 
        try {
            const apiUrl = import.meta.env.VITE_API_URL 
            const response = await fetch(`${apiUrl}/api/add_test_description`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    quantity: Number(quantity),
                    test_description: testDescription,
                    transport: transport,
                }),
            });

            const result = await response.json();
            if (response.ok) {
                console.log("Test description and transport saved successfully:", result);
                alert("Test description and transport saved successfully!");
                navigate('/testPage');
            } else {
                console.error("Failed to save test description and transport:", result);
                alert("Failed to save test description and transport.");
            }
        } catch (error) {
            console.error("Error saving test description and transport:", error);
            alert("An error occurred while saving the test description and transport.");
        }
    };

    return (
        <div className={style.container}>
            <div>
                <h1>Choose Test setup</h1>
            </div>
            <div className={style.btnContainer}>
                <button
                    className={style.btn}
                    onClick={() => handleDescriptionClick('down')}
                >
                    <FontAwesomeIcon icon={faSatelliteDish} className={`${style.headerDisplay} ${style.bottom}`} />
                </button>
                <button
                    className={style.btn}
                    onClick={() => handleDescriptionClick('right')}
                >
                    <FontAwesomeIcon icon={faSatelliteDish} className={style.right} />
                </button>
                <button
                    className={style.btn}
                    onClick={() => handleDescriptionClick('up')}
                >
                    <FontAwesomeIcon icon={faSatelliteDish} className={style.top} />
                </button>
                <button
                    className={style.btn}
                    onClick={() => handleDescriptionClick('left')}
                >
                    <FontAwesomeIcon icon={faSatelliteDish} className={style.left} />
                </button>
            </div>
            <div className={style.ProductContainer}>
                <input
                    type="text"
                    placeholder="Enter the number of products"
                    value={quantity}
                    onChange={handleQuantityChange}
                />
            </div>
            <div className={style.btnContainer}>
                <button
                    className={style.btn}
                    onClick={() => handleTransportClick('basket')}
                    >
                    <FontAwesomeIcon icon={faBasketShopping} />
                </button>
                <button
                    className={style.btn}
                    onClick={() => handleTransportClick('cart')}
                >
                    <FontAwesomeIcon icon={faCartShopping} />
                </button>
                <button
                    className={style.btn}
                    onClick={() => handleTransportClick('bag')}
                    >
                    <FontAwesomeIcon icon={faBagShopping} />
                </button>
            </div>
            {/* can be used sooner to show the date. */}
            <p>Date: {new Date().toLocaleDateString()}</p> 
            <div>
                <button className={style.btnSubmit} onClick={handleSubmit}>Submit</button>
            </div>
        </div>
    );
};

export default TestSetup;