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
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill="currentColor" 
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                >
                    <path d="M7.9333 11.424C7.9333 11.424 9.0666 11.424 9.0666 12.4C9.0666 13.376 7.9333 13.376 7.9333 13.376H4V17.2H8.0666C8.0666 17.2 10.6666 17.2 10.6666 14.8C10.6666 12.4 8.0666 11.424 8.0666 11.424H4V10.048H7.9333C7.9333 10.048 8.9333 10.048 8.9333 9.12C8.9333 8.192 7.9333 8.192 7.9333 8.192H4V6.8H8.0666C8.0666 6.8 10.2666 6.8 10.2666 8.96C10.2666 11.12 8.0666 11.424 8.0666 11.424H7.9333V11.424Z"></path>
                    <path d="M16 7.6H20V6.8H16V7.6Z"></path>
                    <path d="M16.4667 11.424C16.4667 11.424 18.0667 11.024 18.0667 9.8C18.0667 8.576 16.4667 8.192 16.4667 8.192H13.2V11.424H16.4667Z"></path>
                    <path d="M20 10C19.2 9.2 18 8.8 16.4 8.8C14.2667 8.8 12.8 10.096 12.8 12.16C12.8 14.224 14.2667 15.6 16.4 15.6C17.6 15.6 18.8 15.2 19.6 14.4H19.6667V16H21.2V9.2C21.2 8.96 20.6667 9.2 20 10Z"></path>
                </svg>
              <span className="sr-only">Behance</span>
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
