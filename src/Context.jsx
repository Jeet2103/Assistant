import React, { createContext, useContext, useState,useRef } from 'react';

// Create a context for the data
const MyContext = createContext();

// Create a Context Provider component
export function MyProvider({ children }) {
    const [location, setLocation] = useState(null);
    const [stream, setStream] = useState(null);
    const [apiResponse, setApiResponse] = useState('');
    const videoRef = useRef(null);
    const isRecording = useRef(false);

    const stopVidRecording = () => {
        console.log("stop");
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
          setStream(null);
          videoRef.current.srcObject = null;
          isRecording.current = false;
        }
      };

  // Create an object with the data and functions to provide
  const contextValue = {
    location,setLocation,stopVidRecording,stream,setStream,apiResponse,setApiResponse,videoRef,isRecording
  };

  return (
    <MyContext.Provider value={contextValue}>
      {children}
    </MyContext.Provider>
  );
}

// Create custom hooks to access the context
export function useMyContext() {
  return useContext(MyContext);
}