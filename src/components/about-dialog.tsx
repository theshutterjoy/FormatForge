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
      <DialogContent className="max-w-md border-2 border-foreground shadow-[8px_8px_0px_0px_hsl(var(--foreground))] w-[calc(100%-2rem)] rounded-lg">
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
                  <path d="M19.9 6.9c-0.1-0.5-0.6-0.9-1.2-0.9H15v1.8h3.6c0 0-0.1 0.6-0.6 0.6s-3 0-3 0v3.6c0 0 1.9 0 1.9-1.8s-1.9-1.8-1.9-1.8V7H9.2v1.8c0 0-1.2 0-1.2-1.2s1.2-1.2 1.2-1.2V6.9H5.2C4.6 6.9 4 7.4 4 8v8c0 0.6 0.6 1.1 1.2 1.1h3.3c0 0 0-1.8-1.8-1.8s-1.2-1.2-1.2-1.2s0-1.8 3-1.8s3.6 1.8 3.6 1.8s0.6 1.2 3.6 1.2s3-1.8 3-1.8s1.2-2.4 1.2-3.6C21.1 9.3 19.9 6.9 19.9 6.9z M17.4 15.3c-1.2 0.6-3 0-3 0s-1.2-0.6-1.2-1.8c0-1.2 1.2-1.8 1.2-1.8s1.2-0.6 2.4 0c1.2 0.6 1.2 1.8 1.2 1.8S18.6 14.7 17.4 15.3z M15 11.1h4.2v-1H15V11.1z" />
                </svg>
              <span className="sr-only">Behance</span>
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
