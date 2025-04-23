

import { useState, useRef, useEffect } from 'react';

interface AudioVisualizerProps {
  onRecordingComplete: (audioBlob: Blob) => void;
}

const AudioVisualizer = ({ onRecordingComplete }: AudioVisualizerProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [dataArray, setDataArray] = useState<Uint8Array | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const animationRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [mediaStream]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMediaStream(stream);
      
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      setAudioContext(audioContext);
      
      const analyser = audioContext.createAnalyser();
      setAnalyser(analyser);
      
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      analyser.fftSize = 256;
      
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      setDataArray(dataArray);
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        onRecordingComplete(audioBlob);
        audioChunksRef.current = [];
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      draw();
    } catch (err) {
      console.error('Error accessing microphone:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setIsRecording(false);
    setMediaStream(null);
  };

  const draw = () => {
    if (!canvasRef.current || !analyser || !dataArray) return;
    
    animationRef.current = requestAnimationFrame(draw);
    analyser.getByteFrequencyData(dataArray);
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    
    ctx.clearRect(0, 0, width, height);
    
    const barWidth = (width / dataArray.length) * 2.5;
    let x = 0;
    
    for (let i = 0; i < dataArray.length; i++) {
      const barHeight = dataArray[i] / 2;
      
      // Create gradient
      const gradient = ctx.createLinearGradient(0, height - barHeight, 0, height);
      gradient.addColorStop(0, '#D9288C');
      gradient.addColorStop(1, '#5A00FF');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(x, height - barHeight, barWidth, barHeight);
      
      x += barWidth + 1;
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div 
        className={`relative w-24 h-24 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 ${isRecording ? 'bg-gradient-to-br from-[#D9288C] to-[#5A00FF]' : 'bg-gray-200 hover:bg-gray-300'}`}
        onClick={toggleRecording}
      >
        {isRecording ? (
          <canvas 
            ref={canvasRef} 
            width={96} 
            height={96}
            className="absolute inset-0 w-full h-full rounded-full"
          />
        ) : null}
        
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke={isRecording ? "white" : "#5A00FF"} 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="w-12 h-12 relative z-10"
        >
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="23" />
          <line x1="8" y1="23" x2="16" y2="23" />
        </svg>
        
        {isRecording && (
          <div className="absolute -bottom-2 bg-[#D9288C] text-white text-xs px-2 py-1 rounded-full animate-pulse">
            REC
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioVisualizer;