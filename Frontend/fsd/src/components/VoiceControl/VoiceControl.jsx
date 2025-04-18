import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff } from 'lucide-react';

const VoiceControl = ({ onCommand }) => {
  const [isListening, setIsListening] = useState(false);
  const [voiceFeedback, setVoiceFeedback] = useState('');
  const [browserSupported, setBrowserSupported] = useState(true);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Check for browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setBrowserSupported(false);
      setVoiceFeedback('Voice commands not supported in your browser');
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('');
      onCommand(transcript.trim());
      setVoiceFeedback(`Heard: "${transcript}"`);
      setTimeout(() => setVoiceFeedback(''), 3000);
    };

    recognitionRef.current.onerror = (event) => {
      console.error('Voice recognition error:', event.error);
      let errorMessage = 'Error occurred';
      switch(event.error) {
        case 'no-speech':
          errorMessage = 'No speech detected';
          break;
        case 'audio-capture':
          errorMessage = 'Microphone not available';
          break;
        case 'not-allowed':
          errorMessage = 'Microphone access denied';
          break;
        default:
          errorMessage = `Error: ${event.error}`;
      }
      setVoiceFeedback(errorMessage);
      setIsListening(false);
    };

    recognitionRef.current.onend = () => {
      if (isListening) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.error('Restart error:', e);
          setIsListening(false);
          setVoiceFeedback('Failed to restart listening');
        }
      }
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isListening, onCommand]);

  const toggleVoiceControl = () => {
    if (!browserSupported) return;

    if (isListening) {
      try {
        recognitionRef.current.stop();
        setIsListening(false);
        setVoiceFeedback('Voice control stopped');
        setTimeout(() => setVoiceFeedback(''), 2000);
      } catch (e) {
        console.error('Stop error:', e);
        setVoiceFeedback('Error stopping recognition');
      }
    } else {
      setVoiceFeedback('Starting voice control...');
      try {
        recognitionRef.current.start();
        setIsListening(true);
        setVoiceFeedback('Listening... Speak now');
      } catch (e) {
        console.error('Start error:', e);
        setVoiceFeedback('Error starting recognition');
      }
    }
  };

  if (!browserSupported) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <div className="bg-red-500/90 text-white px-4 py-2 rounded-lg shadow-lg">
          Browser doesn't support speech recognition
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end space-y-2">
      {voiceFeedback && (
        <div className="bg-blue-900/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg shadow-lg max-w-xs animate-fade-in">
          {voiceFeedback}
        </div>
      )}
      <button
        onClick={toggleVoiceControl}
        className={`p-4 rounded-full shadow-lg transition-all duration-300 flex flex-col items-center ${
          isListening 
            ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
        aria-label={isListening ? "Stop listening" : "Start voice control"}
      >
        {isListening ? (
          <MicOff className="h-6 w-6 text-white" />
        ) : (
          <Mic className="h-6 w-6 text-white" />
        )}
        <span className="text-xs mt-1 text-white">
          {isListening ? 'Listening...' : 'Voice Control'}
        </span>
      </button>
    </div>
  );
};

export default VoiceControl;