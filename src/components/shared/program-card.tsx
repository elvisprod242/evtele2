import { Program } from "@/lib/data";
import Image from "next/image";
import Link from 'next/link';
import { Button } from "../ui/button";
import { ArrowRight } from "lucide-react";

interface ProgramCardProps {
    program: Program & { imageUrl?: string; imageHint?: string };
}

const isValidImageUrl = (url: string | undefined | null): boolean => {
  if (!url) return false;
  try {
    const validHostnames = ['images.unsplash.com', 'picsum.photos', 'placehold.co'];
    const { hostname } = new URL(url);
    return validHostnames.includes(hostname);
  } catch (e) {
    return false;
  }
};


export function ProgramCard({ program }: ProgramCardProps) {
    if (!program) return null;

    const imageUrl = isValidImageUrl(program.imageUrl) 
        ? program.imageUrl 
        : `https://picsum.photos/seed/${program.id || 'placeholder'}/200/200`;

    return (
        <div className="flex items-center gap-4">
             <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md">
                <Image
                    src={imageUrl}
                    alt={program.title}
                    fill
                    className="object-cover"
                />
            </div>
            <div className="flex-1">
                <h4 className="font-semibold text-sm truncate">{program.title}</h4>
                <p className="text-xs text-muted-foreground">{program.time}</p>
            </div>
        </div>
    );
}

export function ProgramGuideHome() {
    return (
        <div className="flex justify-center mt-4">
             <Button variant="outline" asChild>
                <Link href="/program-guide">
                    Voir tout le guide <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
        </div>
    );
}
