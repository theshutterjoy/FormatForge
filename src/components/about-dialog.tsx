"use client";

import { Instagram, Twitter } from 'lucide-react';
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
      <DialogContent className="sm:max-w-md border-2 border-foreground shadow-[8px_8px_0px_0px_hsl(var(--foreground))]">
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
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
