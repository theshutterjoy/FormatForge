"use client";

import { Instagram } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import * as React from 'react';

type AboutDialogProps = {
  onOpenInSheet?: () => void;
};

export function AboutDialog({ onOpenInSheet }: AboutDialogProps) {
  const [open, setOpen] = React.useState(false);
  const isSheetButton = !!onOpenInSheet;

  const handleTriggerClick = () => {
    if (isSheetButton) {
        onOpenInSheet?.();
    }
    setOpen(true);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="font-bold uppercase w-full"
          onClick={handleTriggerClick}
        >
          About
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md border-2 border-foreground shadow-[8px_8px_0px_0px_hsl(var(--foreground))]">
        <DialogHeader>
          <DialogTitle className="font-bold uppercase text-2xl text-primary">About Format Forge</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-foreground">
            Format Forge is a smart image conversion tool that uses AI to optimize your images for the web. Effortlessly convert formats and reduce file sizes without compromising quality.
          </p>
          <div>
            <p className="font-bold text-foreground">Designer & Developer: Suman Debnath</p>
            <p className="text-sm text-muted-foreground">(Product Designer)</p>
          </div>
          <div className="flex items-center space-x-4">
            <a href="https://www.instagram.com/uxwithsuman/" target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-primary transition-colors">
              <Instagram className="h-6 w-6" />
              <span className="sr-only">Instagram</span>
            </a>
            <a href="https://x.com/uxwithsuman" target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-primary transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
              <span className="sr-only">Twitter / X</span>
            </a>
            <a href="https://www.behance.net/theshutterjoy" target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-primary transition-colors">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-6 w-6"
              >
                <path d="M7.938 10.359h5.125c1.125 0 1.688.563 1.688 1.594 0 1.031-.563 1.594-1.688 1.594h-5.125v-3.188zm10.375-1.5c-.281-.094-.656-.188-1.031-.188-2.156 0-3.656 1.406-3.656 4.219 0 2.813 1.5 4.125 3.563 4.125 1.219 0 2.156-.469 2.719-1.219h.094v.938h2.313v-7.188c0-1.031-.75-1.406-1.875-1.406-.656 0-1.219.188-1.563.313l-.563 1.813zm-8.219 8.219h5.813c1.688 0 2.906-1.031 2.906-2.813 0-1.781-1.219-2.813-2.906-2.813h-5.813v5.626zM15.75 3h-7.5c-1.219 0-2.25.938-2.25 2.25v13.5c0 1.313 1.031 2.25 2.25 2.25h7.5c1.313 0 2.25-1.031 2.25-2.25v-13.5c0-1.313-.938-2.25-2.25-2.25zm.75 7.125h-2.25v-1.875h2.25v1.875z"/>
              </svg>
              <span className="sr-only">Behance</span>
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
