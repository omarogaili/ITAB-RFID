import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import style from "../Styles/Header.module.css";
import { useButtonContext } from '../Context/SelectedButtonContext';
import { useButtonContextTansport } from "../Context/SelectedTransport";
import { useEndTestContext } from "../Context/EndTestContex";
const Header = () => {
    // This is used to set the selected button (Antenna) for the test description 
    const { selectedButton } = useButtonContext();
    // This is used to set the selected button (Transport) for the test description
    const { SelectedButtonTansport } = useButtonContextTansport();
    // This is used to toggle between true and false to end or start the test
    const { endTest, setEndTest } = useEndTestContext();
    // location is used to get the current path
    const location = useLocation();
    //toggle between those two values based on endTest value true or false 
    const startTest = "Recording is not started";
    const endtest = "Recording";
    const navigate = useNavigate();

    const handleNavigationClick = () => {
        navigate('/');
    }
    const handleTestPageClick = () => {
        navigate('/testPage');
    }

    // This function is used to restart the python script. To create a new test-log.  
    const restartPythonScript = async () => {
        try {
            handleNavigationClick();
            const apiUrl= import.meta.env.VITE_API_URL;
            const response = await fetch(`${apiUrl}/api/restart_script`, {
                method: "POST",
            });
            if (response.ok) {
            } else {
                alert("Failed to restart Python script.");
            }
        } catch (error) {
            console.error("Error restarting Python script:", error);
            alert("An error occurred while restarting the Python script.");
        }
    };

    return (
        <header className={style.header}>
            <div className={style.btnContainer}>
                <button className={style.btn} onClick={restartPythonScript}> + New Test</button>
            </div>
            <div >
                {selectedButton && (
                    <div className={style.selectedButton}>
                        {selectedButton}
                    </div>
                )}
            </div>
            <div className={style.btnContainer}>
                    <button type="button" className={style.btn} onClick={handleTestPageClick}>
                        Test Page
                    </button>
            </div>
            <div className={style.selectedButton}>
                {SelectedButtonTansport}
            </div>
            <div className={style.btnContainer}>
                {location.pathname === '/testPage' &&
                    <button type="button" className={style.btn} onClick={() => setEndTest(!endTest)}>
                        {!endTest && endtest || startTest}
                    </button>
                }
            </div>
        </header>
    );
}
export default Header;