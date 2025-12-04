
'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Loader2, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Replay } from '@/lib/data';

interface LatestReplaysProps {
    replays: Replay[] | null;
    isLoading: boolean;
}

const isValidImageUrl = (url: string | undefined | null): boolean => {
  if (!url) return false;
  try {
    const validHostnames = ['images.unsplash.com', 'picsum.photos', 'placehold.co', 'img.youtube.com'];
    const { hostname } = new URL(url);
    return validHostnames.includes(hostname);
  } catch (e) {
    return false;
  }
};

const formatDuration = (seconds: number = 0) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
        return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
    }
    if (minutes > 0) {
        return `${minutes}m ${remainingSeconds.toString().padStart(2, '0')}s`;
    }
    return `${remainingSeconds}s`;
}

export function LatestReplays({ replays, isLoading }: LatestReplaysProps) {
    return (
        <>
        <section>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-3xl font-bold font-headline">Dernières Rediffusions</h2>
                <Button variant="ghost" asChild>
                    <Link href="/replays">Voir plus <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
            </div>
            {isLoading ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    {Array.from({length: 5}).map((_, i) => (
                        <Card key={i}><CardContent className="p-0"><div className="aspect-[4/3] w-full bg-muted animate-pulse" /></CardContent></Card>
                    ))}
                </div>
            ) : (
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    {replays?.map((replay) => (
                        <Card key={replay.id} className="overflow-hidden group w-full">
                            <CardContent className="p-0">
                            <div className="relative aspect-[4/3] w-full overflow-hidden block">
                                <Image
                                    src={isValidImageUrl(replay.thumbnail) ? replay.thumbnail : `https://picsum.photos/seed/${replay.id}/400/300`}
                                    alt={replay.title}
                                    fill
                                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                                <Link href={`/replays/${replay.id}`} className="absolute inset-0 flex items-center justify-center cursor-pointer">
                                    <div className="h-12 w-12 rounded-full bg-white/20 text-white backdrop-blur-sm transition-all duration-300 opacity-0 group-hover:opacity-100 group-hover:scale-110 flex items-center justify-center">
                                        <Play className="h-6 w-6 fill-current" />
                                    </div>
                                </Link>
                                <Badge variant="secondary" className="absolute bottom-2 right-2 text-xs">{formatDuration(replay.duration)}</Badge>
                            </div>
                            <div className="p-3 bg-card">
                                <h3 className="font-semibold font-headline truncate text-sm">
                                    <Link href={`/replays/${replay.id}`} className="hover:underline">{replay.title}</Link>
                                </h3>
                                <p className="text-xs text-muted-foreground truncate">{replay.category}</p>
                            </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </section>
        </>
    );
}
