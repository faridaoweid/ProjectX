import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Plot from 'react-plotly.js';
import * as XLSX from 'xlsx';


interface RoomTemperatureEntry {
    time: string;
    temperature: number;
  };

interface RoomTemperatureViewProps {
    //roomTemperatures: RoomTemperatureEntry[];
    handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    handleUpload: () => void;
  }

// Helper function to convert Excel time (numeric) to HH:MM format
const excelTimeToHHMM = (excelTime: number) => {
  const totalSeconds = Math.floor(excelTime * 24 * 60 * 60);
  const hours = Math.floor(totalSeconds / (60 * 60));
  const minutes = Math.floor((totalSeconds - (hours * 60 * 60)) / 60);

  // Pad the hours and minutes with leading zeros if necessary
  const paddedHours = hours.toString().padStart(2, '0');
  const paddedMinutes = minutes.toString().padStart(2, '0');

  return `${paddedHours}:${paddedMinutes}`;
};

type Styles = {
[key: string]: React.CSSProperties;
};

  const styles: Styles = {

    inputContainer: {
    display: 'flex',
    flexDirection: 'column', // Stack children vertically
    alignItems: 'center', // Center children horizontally
    margin: '20px 0 0 0', // Provide some vertical space
  },
    fileInput: {
      margin: '0 0 10px 0',
      marginLeft: '200px',
    },

    buttonContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      margin: '10px 0 20px 0',
    },

    tableContainer: {
      display: "flex",
      flexDirection: 'column', // Stack children vertically
      alignItems: 'center',  // Center children horizontally
      justifyContent: 'center', // Center children vertically (if needed)
      width: '100%',         // Use the full width available
      marginTop: '40px',     // Space between the upload button and the table
      marginBottom: '100px',  // Space between the table and the plot
    },
  
    
    table: {
      width: '33%', // Set table to be approximately a third of the page width
      boxShadow: '0 2px 3px #ccc',
      borderCollapse: 'collapse',

    },

    button: {
      padding: '10px 20px',
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
    },
    header: {
      backgroundColor: '#f4f4f4',
      border: '1px solid #ddd',
      padding: '10px',
      textAlign: 'center',
    },
    cell: {
      border: '1px solid #ddd',
      padding: '10px',
      textAlign: 'center',
    },
  
  };

  const RoomTemperatureView: React.FC<RoomTemperatureViewProps> = () => {
    const [roomTemperatures, setRoomTemperatures] = React.useState<RoomTemperatureEntry[]>([]);
    const [fileToUpload, setFileToUpload] = useState<File | null>(null);
    const [fileName, setFileName] = useState<string>('No file chosen');
    const [isChooseFileHovering, setIsChooseFileHovering] = useState<boolean>(false);
    const [isUploadHovering, setIsUploadHovering] = useState<boolean>(false);
    const [isDataLoaded, setIsDataLoaded] = useState<boolean>(false);
    const [plotWidth, setPlotWidth] = useState<number>(window.innerWidth * 0.33);

      // Effect to handle window resizing for responsive plot width
  useEffect(() => {
    function handleResize() {
      // Adjust plot width based on the parent container or a percentage of the window
      setPlotWidth(window.innerWidth * 0.33);
    }

    window.addEventListener('resize', handleResize);
    
    // Set the initial width
    //handleResize();

    // Clean up listener when the component is unmounted
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleUpload = () => {
    if (fileToUpload) {
      const formData = new FormData();
      formData.append("file", fileToUpload);

      axios.post("http://localhost:8000/upload/", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'X-CSRFToken': 'csrftoken'
        }
      })
      .then(response => {console.log('Upload successful, server responded with:', response.data);
        setIsDataLoaded(true); // You may want to process the response data here
        alert('File uploaded successfully');
      })
      .catch(error => {
        console.error('Error uploading file', error);
        alert('Error uploading file');
      });
    }
  };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            const file = files[0];
            setFileName(file.name);
            setFileToUpload(file);

            const reader = new FileReader();
            reader.onload = (e: any) => {
                const bstr = e.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });
                const temperatures = data.slice(1).map((row: any[]) => ({ TIME: excelTimeToHHMM(row[0]), TEMPERATURE: row[1] }));
    
                setRoomTemperatures(temperatures.map(entry => ({
                    time: entry.TIME,
                    temperature: entry.TEMPERATURE
                })));
                setIsDataLoaded(true); // Reset the flag when new data is loaded

            };
            reader.readAsBinaryString(file);
        }
    };


 
  const fileInputStyle: React.CSSProperties = {
    // Style your file input here (you can hide it and style the label instead)
    opacity: 0,
    position: 'absolute',
    zIndex: -1,
  };

  const fileInputLabelStyle: React.CSSProperties = {
    padding: '10px 20px',
    backgroundColor: isChooseFileHovering ? '#e0e0e0' : '#f5f5f5', // Light grey, changes slightly on hover
    color: '#000',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'inline-block',
    border: '2px solid #ccc', // Adding a border
    // Optionally, change border color on hover as well
    borderColor: isChooseFileHovering ? '#bbb' : '#ccc',
};
  
    const buttonStyle: React.CSSProperties = {
      ...styles.button,
      backgroundColor: isUploadHovering ? 'darkred' : 'red',
    };

    const svgIconStyle: React.CSSProperties = {
      height: '24px',
      width: '24px',
      marginRight: '8px',
    };

    return (
      <div>
        <h1 style={{ color: '#333', textAlign: 'center' }}>Upload your Room Temperature Data</h1>
        <div style={styles.inputContainer}>
          <input 
          type="file" 
          id="fileInput"
          accept=".xlsx, .xls"
          onChange={handleFileChange} 
          style={fileInputStyle} />
                  <label 
          htmlFor="fileInput" 
          style={fileInputLabelStyle}
          onMouseEnter={() => setIsChooseFileHovering(true)}
          onMouseLeave={() => setIsChooseFileHovering(false)}
        >
          Choose File
        </label>
        <span style={{ color: '#aaa', marginLeft: '10px' }}>{fileName}</span>
        </div>
        <div style={styles.buttonContainer}>
        <button
          style={buttonStyle}
          onClick={handleUpload}
          onMouseEnter={() => setIsUploadHovering(true)}
          onMouseLeave={() => setIsUploadHovering(false)}>
           <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            className="bi bi-upload"
            viewBox="0 0 16 16"
            style={svgIconStyle}
          >
            <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5"/>
            <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708l3-3z"/>
          </svg>Upload</button>
        </div>
        <div style={styles.tableContainer}>
          <h2 style={{ color: '#333', textAlign: 'center' }}>Room Temperature Data</h2>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.header}>TIME</th>
                <th style={styles.header}>TEMPERATURE</th>
              </tr>
            </thead>
            <tbody>
              {roomTemperatures.map((RoomTemperatureEntry: { time: string, temperature: number }, index) => (
                <tr key={index}>
                  <td style={styles.cell}>{RoomTemperatureEntry.time}</td>
                  <td style={{ ...styles.cell, textAlign: 'center' }}>{RoomTemperatureEntry.temperature}</td>
                </tr>
              ))}
              {isDataLoaded && (
              <Plot
        data={[
          {
            x: roomTemperatures.map(entry => entry.time),
            y: roomTemperatures.map(entry => entry.temperature),
            type: 'scatter',
            mode: 'markers',
            marker: { color: 'red' }
          },
        ]}
        layout={{
          width: plotWidth, // Use state-controlled width for responsive design
          margin: {
            l: 50, // Left margin
            r: 50, // Right margin
            t: 50, // Top margin
            b: 50, // Bottom margin
          },
          title: 'Room Temperature over time',
          xaxis: { title: 'Time' },
          yaxis: { title: 'Temperature (°C)' },
        }}
      />
              )}   
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  
  export default RoomTemperatureView;