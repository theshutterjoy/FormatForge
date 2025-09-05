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
                  <path d="M22.5 7.625H16.875V6H22.5V7.625ZM16.334 14.834C17.313 14.834 18.25 14.438 18.25 13.125C18.25 11.875 17.313 11.438 16.334 11.438H13.25V14.834H16.334ZM22.25 11.125C21.407 10.344 20.125 10 18.313 10C15.875 10 14.25 11.313 14.25 13.5C14.25 15.688 15.844 17 18.125 17C19.469 17 20.75 16.406 21.563 15.5H21.625V17.375H24V10.5C24 10.188 23.313 10.438 22.25 11.125ZM11.125 12.125H5.875V14.5H10.188C10.782 14.5 11.313 14.125 11.313 13.344C11.313 12.563 10.782 12.125 10.188 12.125H11.125ZM11.875 17H4V6H12C14.188 6 15.5 7.156 15.5 9.125C15.5 11.094 14.188 12.25 12 12.25H11.125V12.125H5.875V10.25H11.313C12.438 10.25 13.25 9.75 13.25 8.969C13.25 8.188 12.469 7.75 11.313 7.75H5.875V8.5H4V6H12C14.188 6 15.5 7.156 15.5 9.125C15.5 11.094 14.188 12.25 12 12.25H5.875V15.25H11.875C14.031 15.25 15.375 14.125 15.375 12.188C15.375 10.25 14.031 9.125 11.875 9.125H4V17H11.875Z"/>
              </svg>
              <span className="sr-only">Behance</span>
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
