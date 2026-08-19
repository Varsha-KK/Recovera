import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, Sparkles, RefreshCw } from 'lucide-react';
import { notificationService } from '../../services/notificationService';
import { Button } from '../common/Button';

interface AudioPreviewPlayerProps {
  text: string;
  patientName?: string;
  className?: string;
}

export const AudioPreviewPlayer: React.FC<AudioPreviewPlayerProps> = ({
  text,
  patientName = 'Patient',
  className,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [voiceModel, setVoiceModel] = useState('Rachel (ElevenLabs Natural Voice)');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlayVoice = async () => {
    if (isPlaying) {
      if (audioRef.current) audioRef.current.pause();
      window.speechSynthesis?.cancel();
      setIsPlaying(false);
      return;
    }

    setIsLoading(true);
    try {
      // 1. Fetch generated audio or trigger Web Speech API fallback
      const data = await notificationService.generateVoicePreview(text);
      setVoiceModel(data.voiceName || 'Rachel (ElevenLabs AI)');

      if (data.audioUrl && data.audioUrl.startsWith('data:audio')) {
        setAudioUrl(data.audioUrl);
        if (audioRef.current) {
          audioRef.current.src = data.audioUrl;
          audioRef.current.play();
          setIsPlaying(true);
        }
      } else {
        // Natural speech synthesis fallback
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.rate = 0.95;
          utterance.pitch = 1.0;
          utterance.onend = () => setIsPlaying(false);
          utterance.onerror = () => setIsPlaying(false);
          window.speechSynthesis.speak(utterance);
          setIsPlaying(true);
        }
      }
    } catch (err) {
      console.warn('Voice preview error:', err);
      // Fallback to speech synthesis
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onend = () => setIsPlaying(false);
        window.speechSynthesis.speak(utterance);
        setIsPlaying(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) audioRef.current.pause();
      window.speechSynthesis?.cancel();
    };
  }, []);

  return (
    <div className={`p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-navy-900 to-slate-900 text-white border border-slate-700 shadow-md ${className}`}>
      <audio
        ref={audioRef}
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />

      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
            <Volume2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-white flex items-center gap-1.5">
              <span>Automated Voice Call Audio</span>
              <span className="px-1.5 py-0.5 text-[9px] rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                ElevenLabs Model
              </span>
            </div>
            <p className="text-[10px] text-slate-400">{voiceModel}</p>
          </div>
        </div>

        <button
          onClick={handlePlayVoice}
          disabled={isLoading}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-sm ${
            isPlaying
              ? 'bg-rose-500 hover:bg-rose-600 text-white animate-pulse'
              : 'bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold'
          }`}
        >
          {isLoading ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : isPlaying ? (
            <>
              <Pause className="w-3.5 h-3.5" /> Stop Audio
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" /> Play Voice Sample
            </>
          )}
        </button>
      </div>

      {/* Dynamic Audio Waveform Visualizer */}
      <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center gap-1 h-9 justify-center">
        {[40, 65, 80, 45, 90, 70, 35, 95, 60, 40, 85, 100, 55, 75, 45, 90, 65, 30, 80, 50].map((h, i) => (
          <div
            key={i}
            className={`w-1 rounded-full transition-all duration-150 ${
              isPlaying
                ? 'bg-gradient-to-t from-teal-500 to-cyan-400 animate-pulse'
                : 'bg-slate-700'
            }`}
            style={{
              height: isPlaying ? `${Math.max(15, (h * (i % 3 + 1)) % 100)}%` : '20%',
              animationDelay: `${i * 60}ms`,
            }}
          />
        ))}
      </div>

      <p className="text-[11px] text-slate-300 italic mt-2.5 border-t border-slate-800 pt-2 line-clamp-2">
        "{text}"
      </p>
    </div>
  );
};
