import { useState, useRef, useEffect } from 'react';

interface AudioVisualizerProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  isLoading?: boolean;
  audioUrl?: string | null;
}

const AudioVisualizer = ({ onRecordingComplete, isLoading, audioUrl }: AudioVisualizerProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [scale, setScale] = useState(1);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const animationRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAll();
    };
  }, []);

  // Handle AI response audio playback
  useEffect(() => {
    if (!audioUrl) return;

    const playResponseAudio = async () => {
      if (!audioElementRef.current) {
        audioElementRef.current = new Audio();
      }

      const audio = audioElementRef.current;
      audio.src = audioUrl;
      
      audio.onplay = () => {
        setIsPlaying(true);
        setupAudioAnalysis(audio);
      };
      
      audio.onended = () => {
        setIsPlaying(false);
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };

      try {
        await audio.play();
      } catch (err) {
        console.error('Error playing audio:', err);
      }
    };

    playResponseAudio();

    return () => {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current.currentTime = 0;
        audioElementRef.current.onplay = null;
        audioElementRef.current.onended = null;
      }
    };
  }, [audioUrl]);

  const stopAll = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.currentTime = 0;
    }
    setIsRecording(false);
    setIsPlaying(false);
    setScale(1);
  };

  const setupAudioAnalysis = (audioElement: HTMLAudioElement) => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioContextRef.current = audioContext;
    
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    analyserRef.current = analyser;
    
    const source = audioContext.createMediaElementSource(audioElement);
    sourceNodeRef.current = source;
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    
    const bufferLength = analyser.frequencyBinCount;
    dataArrayRef.current = new Uint8Array(bufferLength);
    
    drawVisualizer();
  };

  const startRecording = async () => {
    try {
      stopAll();
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;
      
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      
      const bufferLength = analyser.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        onRecordingComplete(audioBlob);
        audioChunksRef.current = [];
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      drawVisualizer();
    } catch (err) {
      console.error('Error accessing microphone:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const drawVisualizer = () => {
    if (!canvasRef.current) {
      animationRef.current = requestAnimationFrame(drawVisualizer);
      return;
    }
    
    const analyser = analyserRef.current;
    const dataArray = dataArrayRef.current;
    
    if (!analyser || !dataArray) {
      animationRef.current = requestAnimationFrame(drawVisualizer);
      return;
    }
    
    analyser.getByteFrequencyData(dataArray);
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      animationRef.current = requestAnimationFrame(drawVisualizer);
      return;
    }
    
    const width = canvas.width;
    const height = canvas.height;
    
    ctx.clearRect(0, 0, width, height);
    
    // Calculate average volume for scaling
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i];
    }
    const average = sum / dataArray.length;
    
    // Dynamic scaling based on audio level (0.9 to 1.3 scale range)
    const newScale = 0.9 + (average / 255) * 0.4;
    setScale(newScale);
    
    // Draw the visualizer bars
    const barWidth = (width / dataArray.length) * 2.5;
    let x = 0;
    
    for (let i = 0; i < dataArray.length; i++) {
      const barHeight = dataArray[i] / 2;
      
      const gradient = ctx.createLinearGradient(0, height - barHeight, 0, height);
      gradient.addColorStop(0, '#D9288C');
      gradient.addColorStop(1, '#5A00FF');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(x, height - barHeight, barWidth, barHeight);
      
      x += barWidth + 1;
    }
    
    animationRef.current = requestAnimationFrame(drawVisualizer);
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const getVisualizerState = () => {
    if (isLoading) return 'loading';
    if (isPlaying) return 'playing';
    if (isRecording) return 'recording';
    return 'idle';
  };

  const visualizerState = getVisualizerState();

  return (
    <div className="flex flex-col items-center">
      <div 
        className={`relative w-24 h-24 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 ${
          visualizerState === 'recording' ? 'bg-gradient-to-br from-[#D9288C] to-[#5A00FF]' :
          visualizerState === 'playing' ? 'bg-gradient-to-br from-[#5A00FF] to-[#00B4FF]' :
          visualizerState === 'loading' ? 'bg-gray-400' :
          'bg-gray-200 hover:bg-gray-300'
        }`}
        onClick={toggleRecording}
        style={{
          transform: `scale(${scale})`,
          transition: 'transform 0.1s ease-out'
        }}
      >
        {visualizerState !== 'idle' ? (
          <canvas 
            ref={canvasRef} 
            width={96} 
            height={96}
            className="absolute inset-0 w-full h-full rounded-full"
          />
        ) : null}
        
        {visualizerState === 'loading' ? (
          <div className="relative z-10 w-12 h-12 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        ) : (
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke={
              visualizerState === 'recording' ? "white" :
              visualizerState === 'playing' ? "white" :
              "#5A00FF"
            } 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="w-12 h-12 relative z-10"
          >
            {visualizerState === 'playing' ? (
              <>
                <polygon points="5 3 19 12 5 21 5 3" />
              </>
            ) : (
              <>
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </>
            )}
          </svg>
        )}
        
        {visualizerState === 'recording' && (
          <div className="absolute -bottom-2 bg-[#D9288C] text-white text-xs px-2 py-1 rounded-full animate-pulse">
            REC
          </div>
        )}
        {visualizerState === 'playing' && (
          <div className="absolute -bottom-2 bg-[#5A00FF] text-white text-xs px-2 py-1 rounded-full">
            PLAYING
          </div>
        )}
        {visualizerState === 'loading' && (
          <div className="absolute -bottom-2 bg-gray-600 text-white text-xs px-2 py-1 rounded-full">
            PROCESSING
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioVisualizer;