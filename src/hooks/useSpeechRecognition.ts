import { useState, useEffect, useRef } from 'react';

interface SpeechRecognitionHook {
  isSupported: boolean;
  isListening: boolean;
  transcript: string;
  startListening: (langCode: string) => void;
  stopListening: () => void;
  error: string | null;
}

export function useSpeechRecognition(onFinalResult?: (result: string) => void): SpeechRecognitionHook {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true;
      recognitionRef.current = rec;
    } else {
      setIsSupported(false);
    }
  }, []);

  const startListening = (langCode: string) => {
    if (!isSupported || !recognitionRef.current) {
      setError('Speech recognition not supported in this browser.');
      return;
    }

    setError(null);
    setTranscript('');

    const rec = recognitionRef.current;
    rec.lang = langCode;

    rec.onstart = () => {
      setIsListening(true);
    };

    rec.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      const displayTranscript = finalTranscript || interimTranscript;
      setTranscript(displayTranscript);
    };

    rec.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'no-speech') {
        setError('No speech was detected. Please try again.');
      } else if (event.error === 'audio-capture') {
        setError('No microphone was found. Ensure it is plugged in.');
      } else if (event.error === 'not-allowed') {
        setError('Microphone permission was denied.');
      } else {
        setError(`Speech recognition error: ${event.error}`);
      }
      setIsListening(false);
    };

    rec.onend = () => {
      setIsListening(false);
      // Retrieve the current transcript at the end and pass it to the callback
      setTranscript((prev) => {
        if (prev && onFinalResult) {
          onFinalResult(prev);
        }
        return prev;
      });
    };

    try {
      rec.start();
    } catch (e: any) {
      console.error('Failed to start recognition:', e);
      setError('Speech recognition is already running.');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error('Failed to stop recognition:', e);
      }
    }
    setIsListening(false);
  };

  return {
    isSupported,
    isListening,
    transcript,
    startListening,
    stopListening,
    error
  };
}
