
'use client';

import React, { useState, useEffect, useRef } from 'react';
import ReactPlayer from 'react-player/lazy';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, VolumeX, Maximize, Loader2 } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { type Show } from '@/lib/data';
import { Card } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';

interface VideoPlayerProps {
  show: Show;
  streamUrl?: string;
}

export function VideoPlayer({ show, streamUrl = 'https://terranoweb.duckdns.org/live/Evtele/index.m3u8' }: VideoPlayerProps) {
    const [isClient, setIsClient] = useState(false);
    const [isPlaying, setIsPlaying] = useState(true);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [played, setPlayed] = useState(0);
    const [duration, setDuration] = useState(0);
    const [showControls, setShowControls] = useState(false);
    const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const playerRef = useRef<ReactPlayer>(null);
    const playerWrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const hideControls = () => {
        if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current);
        }
        controlsTimeoutRef.current = setTimeout(() => {
            setShowControls(false);
        }, 3000); // Hide after 3 seconds
    };

    const handleMouseMove = () => {
        setShowControls(true);
        hideControls();
    };
    
    // Show controls on click, but also toggle play/pause
    const handleClick = () => {
        setShowControls(true);
        handlePlayPause();
    };


    useEffect(() => {
        const wrapper = playerWrapperRef.current;
        if (wrapper) {
            wrapper.addEventListener('mousemove', handleMouseMove);
             // Start the hide timer on initial load if playing
            if (isPlaying) {
                hideControls();
            }
            return () => {
                wrapper.removeEventListener('mousemove', handleMouseMove);
                if (controlsTimeoutRef.current) {
                    clearTimeout(controlsTimeoutRef.current);
                }
            };
        }
    }, [isPlaying]);

    const handlePlayPause = () => {
        setIsPlaying(!isPlaying);
    };

    const handleVolumeChange = (value: number[]) => {
        const newVolume = value[0];
        setVolume(newVolume);
        if (newVolume > 0) {
            setIsMuted(false);
        } else {
            setIsMuted(true);
        }
    };
    
    const handleMute = () => {
        setIsMuted(!isMuted);
    }

    const handleProgress = (state: { played: number }) => {
        setPlayed(state.played);
    };

    const handleDuration = (duration: number) => {
        setDuration(duration);
    };
    
    const handleSeekChange = (value: number[]) => {
      setPlayed(value[0]);
      playerRef.current?.seekTo(value[0]);
    };

    const handleFullScreen = () => {
      if (playerWrapperRef.current && document.fullscreenEnabled) {
        if (!document.fullscreenElement) {
            playerWrapperRef.current.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
      }
    }

    if (!show) return null;
    
    if (!isClient) {
        return <Skeleton className="aspect-video w-full" />
    }

  return (
    <Card className="overflow-hidden border-2 border-primary shadow-2xl shadow-primary/20">
      <div 
        ref={playerWrapperRef}
        className="relative aspect-video w-full bg-black cursor-pointer"
        onClick={handleClick}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        {isClient ? (
             <ReactPlayer
                ref={playerRef}
                url={streamUrl}
                playing={isPlaying}
                volume={volume}
                muted={isMuted}
                onProgress={handleProgress}
                onDuration={handleDuration}
                width="100%"
                height="100%"
                className="absolute top-0 left-0 pointer-events-none"
            />
        ) : (
             <div className="w-full h-full flex items-center justify-center bg-muted">
                <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
            </div>
        )}
        
        {/* Big Play/Pause button in center */}
        <div className={cn(
            "absolute inset-0 flex items-center justify-center transition-opacity duration-300 pointer-events-none",
            showControls ? "opacity-100" : "opacity-0"
        )}>
             <div className="h-20 w-20 bg-black/50 rounded-full flex items-center justify-center">
                {isPlaying ? <Pause className="h-12 w-12 text-white" /> : <Play className="h-12 w-12 text-white" />}
            </div>
        </div>
        
        {/* Controls Bar */}
        <div 
          className={cn(
            "absolute bottom-0 left-0 right-0 p-4 transition-all duration-300",
            showControls ? "opacity-100 translate-y-0" : "opacity-0 translate-y-full pointer-events-none"
          )}
          onClick={(e) => e.stopPropagation()} // Prevent click from bubbling to the parent div
        >
          <div className="bg-background/80 backdrop-blur-sm rounded-lg p-2 flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handlePlayPause}>
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
            </Button>
            <div className="flex-1 flex items-center">
                <Slider value={[played]} max={1} step={0.0001} onValueChange={handleSeekChange} className="flex-1" />
            </div>
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={handleMute}>
                    {isMuted || volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </Button>
                 <Slider value={[isMuted ? 0 : volume]} max={1} step={0.1} onValueChange={handleVolumeChange} className="w-24" />
                <Button variant="ghost" size="icon" onClick={handleFullScreen}>
                    <Maximize className="h-5 w-5" />
                </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
