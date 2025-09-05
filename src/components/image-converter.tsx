
"use client";

import * as React from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Download,
  FileImage,
  Loader2,
  RotateCcw,
  Sparkles,
  UploadCloud,
  Settings,
  X,
} from 'lucide-react';
import { type OptimizeCompressionSettingsInput, type OptimizeCompressionSettingsOutput } from '@/ai/flows/optimize-compression-settings';
import JSZip from 'jszip';

import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';

const formSchema = z.object({
  targetFormat: z.enum(['WEBP', 'PNG', 'JPEG', 'AVIF']).default('WEBP'),
  lossless: z.boolean().default(false),
  compressionSpeed: z.number().min(1).max(10).default(5),
  stripMetadata: z.boolean().default(true),
  maxFileSizeKB: z.coerce.number().min(10).max(10000).default(1024),
});

type FormValues = z.infer<typeof formSchema>;

type FileState = {
  id: string;
  file: File;
  previewUrl: string;
  status: 'pending' | 'converting' | 'done' | 'error';
  progress: number;
  result: ConversionResult | null;
  settings: FormValues;
};

type ConversionResult = {
  imageUrl: string;
  fileName: string;
  rationale: string;
  adjustedSettings: OptimizeCompressionSettingsOutput;
};

// Helper function to convert a file to a data URL
const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Helper function to create an image from a data URL
const createImage = (dataUrl: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = document.createElement('img');
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });
};

// Helper function to perform the conversion on a canvas
const performConversion = async (
  image: HTMLImageElement,
  settings: FormValues,
  adjustedSettings: OptimizeCompressionSettingsOutput
): Promise<string> => {
  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  ctx.drawImage(image, 0, 0);

  // The 'quality' parameter for toDataURL is a number between 0 and 1.
  // We can map the compression speed (1-10) to a quality value.
  // Slower speed = higher quality.
  // We'll use the AI's adjusted speed.
  const quality = (11 - adjustedSettings.adjustedCompressionSpeed) / 10;
  
  const mimeType = `image/${settings.targetFormat.toLowerCase()}`;

  return canvas.toDataURL(mimeType, quality);
};

export function ImageConverter() {
  const [files, setFiles] = React.useState<FileState[]>([]);
  const [isConverting, setIsConverting] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);
  const [overallProgress, setOverallProgress] = React.useState(0);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      targetFormat: 'WEBP',
      lossless: false,
      compressionSpeed: 5,
      stripMetadata: true,
      maxFileSizeKB: 1024,
    },
  });

  const handleReset = React.useCallback(() => {
    setFiles(prevFiles => {
      prevFiles.forEach(f => URL.revokeObjectURL(f.previewUrl));
      return [];
    });
    setIsConverting(false);
    setOverallProgress(0);
    form.reset();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [form]);
  
  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (selectedFiles && selectedFiles.length > 0) {
      const newFiles: FileState[] = Array.from(selectedFiles).map((file, i) => {
        if (!file.type.startsWith('image/')) {
          toast({
            title: "Error: Invalid File Type",
            description: `File "${file.name}" is not a valid image.`,
            variant: "destructive",
          });
          return null;
        }
        return {
          id: `${file.name}-${file.lastModified}-${i}`,
          file,
          previewUrl: URL.createObjectURL(file),
          status: 'pending',
          progress: 0,
          result: null,
          settings: form.getValues(),
        };
      }).filter((f): f is FileState => f !== null);

      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (id: string) => {
    setFiles(prev => {
      const fileToRemove = prev.find(f => f.id === id);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.previewUrl);
      }
      return prev.filter(f => f.id !== id);
    });
  };

  const applySettingsToAll = () => {
    const currentSettings = form.getValues();
    setFiles(prev => prev.map(f => ({
      ...f,
      settings: currentSettings,
    })));
    toast({
      title: 'Settings Applied',
      description: 'The current settings have been applied to all uploaded images.',
    });
  };

  const onDragEnter = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(false); };
  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); };
  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFileSelect(e.dataTransfer.files);
    }
  };
  
  const convertFile = async (
    fileState: FileState, 
    onProgress: (progress: number) => void,
    retries = 3
  ) => {
    try {
      const updateProgress = (p: number) => {
        setFiles(prev => prev.map(f => f.id === fileState.id ? {...f, status: 'converting', progress: p } : f));
        onProgress(p);
      };
      
      updateProgress(10);

      const input: OptimizeCompressionSettingsInput = {
        ...fileState.settings,
        maxFileSizeKB: Number(fileState.settings.maxFileSizeKB),
      };

      const response = await fetch('/api/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.statusText} - ${errorText}`);
      }
      
      const aiResult = await response.json();
      updateProgress(30);
      
      const originalFileName = fileState.file.name.split('.').slice(0, -1).join('.');
      const newFileName = `${originalFileName}.${fileState.settings.targetFormat.toLowerCase()}`;

      // Perform the actual conversion
      const dataUrl = await fileToDataUrl(fileState.file);
      const image = await createImage(dataUrl);
      updateProgress(60);

      const convertedImageUrl = await performConversion(image, fileState.settings, aiResult);

      const result: ConversionResult = {
        imageUrl: convertedImageUrl,
        fileName: newFileName,
        rationale: aiResult.optimizationRationale,
        adjustedSettings: aiResult,
      };

      setFiles(prev => prev.map(f => f.id === fileState.id ? {...f, status: 'done', progress: 100, result } : f));
      onProgress(100);

    } catch (error: any) {
        if (retries > 0 && error.message.includes('503 Service Unavailable')) {
          console.warn(`Retrying conversion for ${fileState.file.name}... (${retries} retries left)`);
          await new Promise(res => setTimeout(res, (4 - retries) * 1000));
          await convertFile(fileState, onProgress, retries - 1);
        } else {
          console.error("Conversion failed for", fileState.file.name, error);
          setFiles(prev => prev.map(f => f.id === fileState.id ? {...f, status: 'error', progress: 0} : f));
          toast({ title: `Conversion Failed for ${fileState.file.name}`, description: "An unexpected error occurred.", variant: "destructive" });
        }
    }
  };

  const onSubmit = async () => {
    if (files.length === 0) {
      toast({ title: "No files selected", description: "Please upload images to convert.", variant: "destructive" });
      return;
    }
    setIsConverting(true);
    setOverallProgress(0);

    const filesToConvert = files.filter(f => f.status === 'pending');
    const totalFiles = filesToConvert.length;
    
    for (let i = 0; i < totalFiles; i++) {
        const baseProgress = (i / totalFiles) * 100;
        const onProgress = (currentFileProgress: number) => {
            const overall = baseProgress + (currentFileProgress / totalFiles);
            setOverallProgress(overall);
        };
        await convertFile(filesToConvert[i], onProgress);
    }

    setIsConverting(false);
  };
  
  const downloadAll = async () => {
    const zip = new JSZip();
    const convertedFiles = files.filter(f => f.status === 'done' && f.result);
    
    if (convertedFiles.length === 0) {
      toast({ title: "No converted files", description: "There are no successfully converted images to download.", variant: "destructive" });
      return;
    }

    toast({ title: "Zipping files...", description: `Packaging ${convertedFiles.length} images.` });

    for (const fileState of convertedFiles) {
        if (fileState.result) {
            const response = await fetch(fileState.result.imageUrl);
            const blob = await response.blob();
            zip.file(fileState.result.fileName, blob);
        }
    }

    zip.generateAsync({ type: "blob" })
        .then(function (content) {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = "converted_images.zip";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
            toast({ title: "Download started", description: "Your zip file is being downloaded." });
        })
        .catch(err => {
            console.error("Zipping failed", err);
            toast({ title: "Zipping Failed", description: "Could not create the zip file.", variant: "destructive" });
        });
  };

  const handlePrimaryButtonClick = () => {
    if (allDone) {
      handleReset();
      fileInputRef.current?.click();
    } else {
      onSubmit();
    }
  };

  const allDone = files.length > 0 && files.every(f => f.status === 'done' || f.status === 'error');
  const filesToConvertCount = files.filter(f => f.status === 'pending').length;

  return (
    <Card className="w-full shadow-none border-0 rounded-none bg-transparent">
      <CardContent className="p-4 md:p-8">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          
          <div className="flex flex-col space-y-4">
              <div
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragEnter={onDragEnter}
                onDragLeave={onDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed transition-colors duration-300 cursor-pointer",
                  isDragging ? "border-primary bg-primary/10" : "border-foreground hover:border-primary"
                )}
              >
                <div className="text-center p-8">
                  <UploadCloud className="mx-auto h-12 w-12 text-foreground" />
                  <p className="mt-4 font-bold text-foreground uppercase">Click to upload or drag & drop</p>
                  <p className="mt-1 text-sm text-muted-foreground">Supports PNG, JPG, GIF, WEBP</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/gif, image/webp"
                  className="sr-only"
                  multiple
                  onChange={(e) => handleFileSelect(e.target.files)}
                />
              </div>

            {files.length > 0 && (
              <div className="space-y-4 border-2 border-foreground p-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold uppercase">Uploaded Files</h3>
                  <Button variant="outline" size="sm" onClick={applySettingsToAll} className="text-xs">
                    Apply to All
                  </Button>
                </div>
                <div className="max-h-96 overflow-y-auto space-y-3 pr-2">
                  {files.map(fileState => (
                    <div key={fileState.id} className="flex items-center gap-4 p-2 border-2 border-foreground">
                      <Image src={fileState.previewUrl} alt="preview" width={64} height={64} className="object-cover w-16 h-16 border-2 border-foreground" />
                      <div className="flex-1">
                        <p className="text-sm font-medium truncate">{fileState.file.name}</p>
                        {fileState.status === 'converting' && <Progress value={fileState.progress} className="h-2 mt-1 bg-foreground/20" />}
                        {fileState.status === 'done' && fileState.result && (
                           <a href={fileState.result.imageUrl} download={fileState.result.fileName} className="mt-1 inline-block">
                             <Button size="sm" variant="outline">Download</Button>
                           </a>
                        )}
                         {fileState.status === 'error' && <p className="text-xs text-destructive">Conversion failed</p>}
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => removeFile(fileState.id)} className="hover:bg-destructive"><X className="h-4 w-4" /></Button>
                    </div>
                  ))}
                </div>
                 <Button variant="outline" onClick={handleReset} className="w-full hover:bg-destructive">
                  Clear All
                 </Button>
              </div>
            )}
          </div>
          
          <div className="flex flex-col justify-center">
            <Form {...form}>
              <form onSubmit={(e) => { e.preventDefault(); handlePrimaryButtonClick(); }} className="space-y-6">
                <h2 className="text-2xl font-bold text-foreground uppercase border-b-2 border-primary pb-2">Settings</h2>
                
                <FormField control={form.control} name="targetFormat" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold uppercase">Target Format</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger className="border-2 border-foreground font-bold"><SelectValue placeholder="Select a format" /></SelectTrigger></FormControl>
                      <SelectContent className="border-2 border-foreground bg-background font-bold">
                        <SelectItem value="WEBP">WEBP</SelectItem>
                        <SelectItem value="PNG">PNG</SelectItem>
                        <SelectItem value="JPEG">JPEG</SelectItem>
                        <SelectItem value="AVIF">AVIF</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )} />

                <FormField control={form.control} name="maxFileSizeKB" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold uppercase">Max File Size (KB)</FormLabel>
                    <FormControl><Input type="number" placeholder="e.g., 1024" {...field} className="border-2 border-foreground font-bold" /></FormControl>
                    <FormDescription>AI will optimize for this size</FormDescription>
                     <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="compressionSpeed" render={({ field }) => (
                   <FormItem>
                      <div className="flex justify-between items-center">
                        <FormLabel className="font-bold uppercase">Compression Speed</FormLabel>
                        <span className="text-sm font-bold text-primary">{field.value}</span>
                      </div>
                      <FormControl>
                          <Slider
                              min={1} max={10} step={1}
                              value={[field.value]}
                              onValueChange={(value) => field.onChange(value[0])}
                              className="[&>span>span]:border-primary [&>span>span]:bg-background [&>span>span]:border-2"
                          />
                      </FormControl>
                       <div className="flex justify-between text-xs text-muted-foreground font-bold">
                          <span>Slower</span>
                          <span>Faster</span>
                      </div>
                   </FormItem>
                )} />

                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="lossless" render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between border-2 border-foreground p-3">
                          <div className="space-y-0.5">
                              <FormLabel className="font-bold uppercase">Lossless</FormLabel>
                          </div>
                          <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                      </FormItem>
                  )} />

                  <FormField control={form.control} name="stripMetadata" render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between border-2 border-foreground p-3">
                          <div className="space-y-0.5">
                              <FormLabel className="font-bold uppercase">Strip Metadata</FormLabel>
                          </div>
                          <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                      </FormItem>
                  )} />
                </div>
                
                <Button type="submit" className="w-full font-bold uppercase border-2 border-foreground bg-primary text-background hover:bg-primary/90" disabled={files.length === 0 || isConverting}>
                  {isConverting ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Converting... ({Math.round(overallProgress)}%)</>
                  ) : allDone ? (
                    <>Convert More</>
                  ) : (
                    <>Convert {filesToConvertCount > 0 ? filesToConvertCount : ''} {filesToConvertCount === 1 ? 'Image' : 'Images'}</>
                  )}
                </Button>
                {allDone && (
                  <Button type="button" onClick={downloadAll} className="w-full font-bold uppercase border-2 border-foreground hover:bg-primary hover:text-background">
                    <Download className="mr-2 h-4 w-4" /> Download All
                  </Button>
                )}
              </form>
            </Form>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

    