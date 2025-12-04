
'use client';

import React, { useState, useEffect, useRef } from 'react';
import ReactPlayer from 'react-player/lazy';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, VolumeX, Volume } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { type Show } from '@/lib/data';
import { Skeleton } from '../ui/skeleton';

interface AudioPlayerProps {
  show: Show;
  streamUrl?: string;
}

export function AudioPlayer({ show, streamUrl = 'https://uk26freenew.listen2myradio.com/live.mp3?typeportmount=s1_27390_stream_642109194' }: AudioPlayerProps) {
  const [isClient, setIsClient] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const playerRef = useRef<ReactPlayer>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

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
  };
  
  if (!isClient) {
      return (
          <Card className="overflow-hidden">
                <CardContent className="p-0 flex flex-col sm:flex-row">
                    <Skeleton className="h-48 sm:h-auto sm:w-1/3" />
                    <div className="flex-1 p-6 flex flex-col justify-between">
                         <div className='space-y-2'>
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-8 w-4/5" />
                            <Skeleton className="h-16 w-full" />
                         </div>
                    </div>
                </CardContent>
                <CardFooter className="bg-muted/50 p-4 flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-2 w-full" />
                    <Skeleton className="h-10 w-24 rounded-md" />
                </CardFooter>
          </Card>
      )
  }

  return (
    <Card className="overflow-hidden relative">
        <div className='hidden'>
            <ReactPlayer
                ref={playerRef}
                url={streamUrl}
                playing={isPlaying}
                volume={volume}
                muted={isMuted}
                width="0"
                height="0"
            />
        </div>
      <CardContent className="p-0 flex flex-col sm:flex-row">
        <div className="relative h-48 sm:h-auto sm:w-1/3 bg-primary/10 flex items-center justify-center p-4">
            <div className="relative h-32 w-32">
                <Image
                    src="/ev-radio.png"
                    alt="Logo Radio"
                    fill
                    className="object-contain"
                />
            </div>
        </div>
        <div className="flex-1 p-6 flex flex-col justify-between">
          <div>
            <CardDescription>En direct sur la radio</CardDescription>
            <CardTitle className="text-3xl font-headline mt-1">{show.title}</CardTitle>
            <p className="text-muted-foreground mt-2 text-sm">{show.description}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-muted/50 p-4 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={handlePlayPause}>
          {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
        </Button>
        <div className="flex-1 flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleMute}>
                {isMuted || volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </Button>
            <Slider value={[isMuted ? 0 : volume]} max={1} step={0.1} onValueChange={handleVolumeChange} className="w-full" />
        </div>
      </CardFooter>
    </Card>
  );
}
