"use client";

import * as React from 'react';
import ExifReader from 'exifreader';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Metadata {
  [key: string]: {
    description: string;
    value: any;
  };
}

type ExifViewerDialogProps = {
  onOpenInSheet?: () => void;
};

export function ExifViewerDialog({ onOpenInSheet }: ExifViewerDialogProps) {
  const [metadata, setMetadata] = React.useState<Metadata | null>(null);
  const [fileName, setFileName] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [open, setOpen] = React.useState(false);
  const isSheetButton = !!onOpenInSheet;


  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setError(null);
      setMetadata(null);
      try {
        const tags = await ExifReader.load(file);
        // We don't want to show the thumbnail data
        delete tags['Thumbnail'];
        if (Object.keys(tags).length === 0) {
            setError("No EXIF metadata found in this image.");
            setMetadata(null);
        } else {
            setMetadata(tags as Metadata);
        }
      } catch (err) {
        setError("Could not read metadata from this file. It might be corrupted or not a supported image format.");
        setMetadata(null);
      }
    }
  };
  
  const handleButtonClick = () => {
    fileInputRef.current?.click();
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
        setMetadata(null);
        setError(null);
        setFileName(null);
    }
    setOpen(isOpen);
  }

  const handleTriggerClick = () => {
    if (isSheetButton) {
        onOpenInSheet?.();
    }
    setOpen(true);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="font-bold uppercase w-full"
          onClick={handleTriggerClick}
        >
          Metadata
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl border-2 border-foreground shadow-[8px_8px_0px_0px_hsl(var(--foreground))]">
        <DialogHeader>
          <DialogTitle className="font-bold uppercase text-2xl text-primary">EXIF/Metadata Viewer</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-foreground">
            Upload an image to view its EXIF (Exchangeable Image File Format) metadata. This includes details like camera settings, date, and location information embedded in the file.
          </p>
          
          <Input type="file" accept="image/jpeg, image/tiff, image/png, image/webp" onChange={handleFileChange} className="hidden" ref={fileInputRef} />
          <Button onClick={handleButtonClick} variant="outline" className="w-full">
            {fileName ? `Loaded: ${fileName}` : 'Select an Image'}
          </Button>

          {error && (
            <div className="text-destructive border-2 border-destructive p-3 font-bold">
              {error}
            </div>
          )}

          {metadata && (
            <ScrollArea className="h-72 w-full border-2 border-foreground p-2">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="font-bold uppercase">Tag</TableHead>
                            <TableHead className="font-bold uppercase">Value</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Object.entries(metadata).map(([key, tag]) => (
                            <TableRow key={key}>
                                <TableCell className="font-medium">{key}</TableCell>
                                <TableCell>{tag.description}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
