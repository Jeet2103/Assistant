import React, { useState, useRef, useEffect } from 'react';
import { useMyContext } from '../Context';

const CameraRecorder = (props) => {
  // const [stream, setStream] = useState(null);
  // const [recording, setRecording] = useState(false);
  // const [apiResponse, setApiResponse] = useState('');
  // const videoRef = useRef(null);
  // const isRecording = useRef(false);
  const {stream,setStream,apiResponse,setApiResponse,videoRef,isRecording,stopVidRecording}=useMyContext();

  const synth = useRef(window.speechSynthesis);

  const startRecording = async () => {
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(newStream);
      // videoRef.current.srcObject = newStream;
      // await videoRef.current.play();
      // setRecording(true);
      // isRecording.current = true;
      // captureAndSendFrame();
      setTimeout(() => {
        videoRef.current.srcObject = newStream;
        videoRef.current.play();
        isRecording.current=true;
        // setRecording(true);
        // Capture a frame from the video
        setTimeout(()=>{captureAndSendFrame();},1000);
      }, 2000);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const speakApiResponse = (text, rate) => {
    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate; // Set the desired speech rate
      utterance.onend = resolve;
      synth.current.speak(utterance);
      console.log("speakin!");
    });
  };



  const captureAndSendFrame = async () => {
    try {
      if (!videoRef.current || !isRecording.current) return;

      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext('2d').drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const frameDataURL = canvas.toDataURL('image/jpeg');

      const base64Frame = frameDataURL.split(',')[1];

      const response = await fetch('http://127.0.0.1:8000/roadassist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imagedata: base64Frame }),
      });

      const data = await response.json();
      setApiResponse(JSON.stringify(data));
      const text = JSON.stringify(data);

      console.log(text.length);
      if(text.length>4){
        await speakApiResponse(text, 1.2);
      }
      if (isRecording.current) {
        captureAndSendFrame();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const sendData=()=>{
    if(apiResponse){
      props.onDataReceived(apiResponse);
    }
  }

  useEffect(() => {
    startRecording();
    return () => {
      stopVidRecording();
    };
  }, []);

  useEffect(()=>{
    if(!isRecording.current){
      startRecording();
    }
    sendData();
  },[apiResponse]);

  return (
      <div id="videoContainer">
        <video className="video" ref={videoRef} style={{ display: 'block', marginBottom: '10px' }} />
      </div>
  );
};

export default CameraRecorder;