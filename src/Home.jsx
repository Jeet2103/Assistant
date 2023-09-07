import React, { useState, useRef, useEffect, useReducer } from "react";
import { useMyContext } from "./Context";
import "./Home.css";
import Chat from "./Component/Chat";
import gif from "/gif/jarvis.gif";
import logo from "/images/logo.png";
import CameraRecorder from "./Component/roadassist";
import CurrentLocation from "./Component/location";
import FaceRecognition from "./Component/facerecognition";

const Home = () => {
  const [text, setText] = useState("");
  const [recording, setRecording] = useState(false);
  const [streamAudio, setStreamAudio] = useState(null);
  const [clicked, setClicked] = useState(false);
  const [voicePrompt, setVoicePrompt] = useState(""); // Voice prompt state
  const [show, setShow] = useState(false);
  const voiceText = useRef("");
  const [audio1] = useState(new Audio("./sound/start.mp3"));
  const [audio2] = useState(new Audio("./sound/end.mp3"));
  const [version, setVersion] = useState(null);
  const scrollDiv = useRef(null);
  const [promptDone, setPromptDone] = useState(false);
  const prompt1 = "How can I help you?";
  const intro =
    "Hi! My name is BlindSightAI. I am designed to assist visually impaired people";
  const [messages, setMessages] = useState([{ text: intro, user: "AI" }]);
  const {
    location,
    setLocation,
    stopVidRecording,
    apiResponse,
    setApiResponse,
  } = useMyContext();

  // Function to animate the voice prompt letter by letter
  const animateVoicePrompt = (textElement) => {
    let currentIndex = 0;
    const intervalId = setInterval(() => {
      setVoicePrompt(textElement.slice(0, currentIndex + 1));

      // if (currentIndex === textElement.length - 1) {
      //   clearInterval(intervalId);
      // }
      currentIndex++;
    }, 70); // Adjust the speed here (e.g., 70ms per letter)
  };

  const startRecording = async () => {
    try {
      const audioStreamAudio = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      setStreamAudio(audioStreamAudio);
      setRecording(true);
      audio1.play();

      let SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      let recognition = new SpeechRecognition();
      recognition.lang = "en-US";

      recognition.onresult = (event) => {
        const result = event.results[0][0];
        const transcript = result.transcript;
        const objUser = { text: transcript, user: "User" };
        setMessages((prevMessages) => [...prevMessages, objUser]);
        voiceText.current = transcript;
      };

      recognition.onend = () => {
        setRecording(false);
      };

      recognition.start();
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopRecording = () => {
    if (streamAudio) {
      streamAudio.getTracks().forEach((track) => track.stop());
    }
    setStreamAudio(null);
    setRecording(false);
    audio2.play();
  };

  const voiceNav = (text) => {
    text = text.toLowerCase();
    console.log("voice :", text);
    const roadAssist = [
      "road",
      "walk",
      "assist",
      "outside",
      "street",
      "stroll",
      "outdoors",
    ];
    const location = ["current", "location", "where", "place"];
    const facialRecog = ["who", "recognize", "face", "know", "recognition"];
    for (let i = 0; i < roadAssist.length; i++) {
      const item = roadAssist[i];
      if (text.includes(item)) {
        setVersion("roadAssist");
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            text: "Hold your camera upright.Let's embark on your journey",
            user: "AI",
          },
        ]);
        speakPrompt("Hold your camera upright");
        speakPrompt("Let's embark on your journey");
        if (apiResponse) {
          setApiResponse("");
        }
        break;
      }
    }

    for (let i = 0; i < location.length; i++) {
      const item = location[i];
      if (text.includes(item)) {
        setVersion("location");
        if (location) {
          setLocation(null);
        }
        break;
      }
    }

    for (let i = 0; i < facialRecog.length; i++) {
      const item = facialRecog[i];
      if (text.includes(item)) {
        setVersion("faceRecog");
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: "Face your camera towards the person.", user: "AI" },
        ]);
        speakPrompt("Face your camera towards the person.");
        if (apiResponse) {
          setApiResponse("");
        }
        break;
      }
    }

    if (text.includes("stop")) {
      stopVidRecording();
      setVersion(null);
    }
  };

  const speakPrompt = (text) => {
    return new Promise((resolve) => {
      const synth = window.speechSynthesis;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = resolve;
      synth.speak(utterance);
    });
  };

  const handleClick = async () => {
    setClicked(true);
    setShow(true);
    // animateVoicePrompt(prompt1);
    setMessages((prevMessages) => [
      ...prevMessages,
      { text: prompt1, user: "AI" },
    ]);
    await speakPrompt(prompt1);
    startRecording();
    setTimeout(() => {
      stopRecording();
      voiceNav(voiceText.current);
      // animateVoicePrompt(text);
    }, 4000);
  };

  const handleLocationData = (data) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { text: `Your Current location is ${data}`, user: "AI" },
    ]);
    speakPrompt(`Your Current location is ${data}`);
  };

  const handleFaceData = (data) => {
    const text = JSON.stringify(data);
    console.log(text.length);
    if (text.length > 4) {
      speakPrompt(`${data}`);
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: `${data}`, user: "AI" },
      ]);
    } else {
      speakPrompt(`This person cannot be recognized.`);
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: `This person cannot be recognized.`, user: "AI" },
      ]);
    }
    stopVidRecording();
    setVersion(null);
  };

  const handleYoloData = async (data) => {
    if (data.length > 2) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: `${data}`, user: "AI" },
      ]);
    }
    // if(data.length >2){
    //   await speakPrompt(`${data}`);
    //   setPromptDone(true);
    // }
  };

  useEffect(() => {
    speakPrompt("Hi");
    speakPrompt("My name is BlindSightAI");
    speakPrompt("I am designed to assist you");

    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  useEffect(() => {
    if (scrollDiv.current) {
      scrollDiv.current.scrollTop = scrollDiv.current.scrollHeight;
    }
  }, [messages]);

  return (
    <>
      <div id="hm-main">
        {!version ? (
          <div>
            <div id="gif">
              <img id="gifvd" src={gif} alt="BlindSightAI Logo" />
            </div>
          </div>
        ) : version === "roadAssist" ? (
          <CameraRecorder onDataReceived={handleYoloData} info={promptDone} />
        ) : version === "location" ? (
          <div>
            <div id="gif">
              <img id="gifvd" src={gif} alt="BlindSightAI Logo" />
            </div>
            <CurrentLocation onDataReceived={handleLocationData} />
          </div>
        ) : (
          <FaceRecognition onDataReceived={handleFaceData} />
        )}
        {/* heading */}
        <div id="logo">
          <img src={logo} id="lg-img" alt="" />
        </div>
        {!show ? (
          <div ref={scrollDiv} className="conv" id="welcome">
            <h2>
              AI : <span>{intro}</span>
            </h2>
          </div>
        ) : (
          ({
            /* Conversetion section */
          },
          (
            <div ref={scrollDiv} className="conv">
              <Chat messages={messages} />
            </div>
          ))
        )}
        {/* Button */}
        <div className="hm-btn">
          <div id="hm-btn-s" onClick={handleClick}>
            Click Here to Speak
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
