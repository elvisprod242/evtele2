
'use client';

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';
import Link from 'next/link';
import { Show } from '@/lib/data';

function RecommendedShowList({ shows }: { shows: Show[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {shows.map((show) => (
        <div key={show.id}>
          <Card className="overflow-hidden group">
            <CardContent className="p-0">
              <div className="relative aspect-video w-full overflow-hidden">
                <Image
                  src={show.image.imageUrl}
                  alt={show.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  data-ai-hint={show.image.imageHint}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <Button size="icon" className="absolute bottom-4 right-4 h-12 w-12 rounded-full bg-primary/80 backdrop-blur-sm transition-transform duration-300 group-hover:scale-110 group-hover:bg-accent">
                      <Play className="h-6 w-6" />
                </Button>
              </div>
              <div className="p-4">
                <h3 className="font-semibold font-headline truncate">{show.title}</h3>
                <p className="text-sm text-muted-foreground truncate">{show.genre}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}


export function Recommendations({ shows }: { shows: Show[] }) {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-3xl font-bold font-headline">Populaires et Recommandés</h2>
        <Button variant="ghost" asChild>
          <Link href="#">Voir tout</Link>
        </Button>
      </div>
      <RecommendedShowList shows={shows} />
    </section>
  );
}
