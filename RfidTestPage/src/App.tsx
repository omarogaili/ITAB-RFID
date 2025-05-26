import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './Components/Header';
import { ButtonProvider } from './Context/SelectedButtonContext';
import { ButtonProviderTow } from './Context/SelectedTransport';
import { CoordinatesProvider } from './Context/CoordinatesContext';
import { PercentageProvider } from './Context/PrecentageContext';
import { EndTestProvider } from './Context/EndTestContex';
import TestSetup from './Pages/TestSetup';
import { ConnectToBackEnd } from './Components/TestScreen';
import TestResultPage from './Pages/TestResultPage';
import DisplayTestResult from './Components/DisplayITestResultat';
import './App.css';
import Style from './Styles/App.module.css';

function App() {
  return (
    <ButtonProvider>
      <ButtonProviderTow>
        <CoordinatesProvider>
          <PercentageProvider>
            <EndTestProvider>
              <Router>
                <div className={Style.AppContainer}>
                  <Header />
                  <Routes>
                    <Route path="/" element={<TestSetup />} />
                    <Route path="/testPage" element={<ConnectToBackEnd />} />
                    <Route path="/test-result/:imageName" element={<TestResultPage />} />
                  </Routes>
                </div>
              </Router>
            </EndTestProvider>
          </PercentageProvider>
        </CoordinatesProvider>
      </ButtonProviderTow>
    </ButtonProvider>
  );
}

export default App;