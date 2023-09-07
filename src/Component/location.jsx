import React, { useState, useEffect } from 'react';
import { useMyContext } from '../Context';

const CurrentLocation = (props) => {
  const {location,setLocation}=useMyContext();
  const sendData=()=>{
    console.log("Location:",location);
    if(location){
    props.onDataReceived(location);
    }
  }

  useEffect(() => {
    // Check if the Geolocation API is available in the browser
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        // Get the user's latitude and longitude
        const { latitude, longitude } = position.coords;

        // Reverse geocode the location to get the place name
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          const placeName = data.display_name;
          setLocation(placeName);
        } catch (error) {
          console.error('Error fetching location:', error);
        }
      }, (error) => {
        console.error('Error getting location:', error);
      });
    } else {
      console.error('Geolocation is not available in this browser.');
    }
    if(location){
      sendData();
    }
  }, [location]);

  return (
    <></>
  );
};

export default CurrentLocation;