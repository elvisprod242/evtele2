
'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import ReactPlayer from 'react-player/lazy';
import { Loader2 } from 'lucide-react';

interface ReplayPlayerDialogProps {
  videoUrl: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ReplayPlayerDialog = ({ videoUrl, open, onOpenChange }: ReplayPlayerDialogProps) => {
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 border-0">
        <div className="aspect-video w-full bg-black flex items-center justify-center">
            {isClient && videoUrl ? (
                <ReactPlayer
                    url={videoUrl}
                    width="100%"
                    height="100%"
                    controls
                    playing
                />
            ) : (
                <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
