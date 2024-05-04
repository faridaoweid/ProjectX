import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import RoomTemperature from './components/RoomTemperature'; 
import PowerConsumption from './components/PowerConsumption'; 
import WindowActivity  from './components/WindowActivity';
import './App.css';

const App: React.FC = () => {
  return (
    <Router>
      <div className="App">
        <div className="sidebar">
          <Link to="/room-temperature">Room Temperature</Link>
          <Link to="/window-activity">Window Activity</Link>
          <Link to="/power-consumption">Power Consumption</Link>
        </div>
        <div className="content">
          <Routes>
            <Route path="/room-temperature" element={<RoomTemperature roomTemperatures={[]} handleFileChange={function (): void {
              throw new Error('Function not implemented.');
            } } handleUpload={function (): void {
              throw new Error('Function not implemented.');
            } } />} />
            <Route path="/window-activity" element={<WindowActivity windowActivities={[]} handleFileChange={function (): void {
              throw new Error('Function not implemented.');
            } } handleUpload={function (): void {
              throw new Error('Function not implemented.');
            } } />} />
            <Route path="/power-consumption" element={<PowerConsumption powerConsumptions={[]} handleFileChange={function (): void {
              throw new Error('Function not implemented.');
            } } handleUpload={function (): void {
              throw new Error('Function not implemented.');
            } } />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
