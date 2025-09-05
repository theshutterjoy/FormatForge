
"use client";

import { ImageConverter } from '@/components/image-converter';
import { AboutDialog } from '@/components/about-dialog';
import { ExifViewerDialog } from '@/components/exif-viewer-dialog';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import * as React from 'react';

export default function Home() {
  const isMobile = useIsMobile();
  const [open, setOpen] = React.useState(false);

  const handleSelectInSheet = () => {
    // This function will be called when a dialog is opened from the sheet.
    // We want the sheet to stay open, so we don't do anything here.
    // The dialog's own state will manage its opening and closing.
  };

  const aboutDialog = <AboutDialog onOpenInSheet={handleSelectInSheet} />;
  const exifDialog = <ExifViewerDialog onOpenInSheet={handleSelectInSheet} />;

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center p-4 sm:p-8 md:p-12">
      <div className="w-full max-w-6xl mx-auto border-2 border-foreground p-1">
        <header className="relative text-left mb-8 p-4 border-b-2 border-foreground">
          <div className="absolute top-4 right-4 flex items-center">
            {isMobile ? (
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-3/4">
                  <SheetHeader>
                    <SheetTitle className="font-bold uppercase text-2xl text-primary">Menu</SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col space-y-4 pt-8">
                    {exifDialog}
                    {aboutDialog}
                  </div>
                </SheetContent>
              </Sheet>
            ) : (
              <div className="flex items-center space-x-2">
                {exifDialog}
                {aboutDialog}
              </div>
            )}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-primary font-headline tracking-tighter uppercase">
            Format Forge
          </h1>
          <p className="text-lg text-muted-foreground mt-2 max-w-2xl">
            // Effortlessly convert your images. Upload a file, choose your settings, and let our smart converter do the rest. //
          </p>
        </header>
        <ImageConverter />
      </div>
    </main>
  );
}
