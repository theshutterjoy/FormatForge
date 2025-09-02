"use client";

import * as React from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import JSZip from 'jszip';
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
import { optimizeCompressionSettings, type OptimizeCompressionSettingsInput, type OptimizeCompressionSettingsOutput } from '@/ai/flows/optimize-compression-settings';

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
  maxFileSizeKB: z.coerce.number({invalid_type_error: "Please enter a number"}).min(10, "Must be at least 10KB").max(10000, "Must be 10000KB or less").default(1024),
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

// A simple retry wrapper with exponential backoff
async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  let lastError: Error | undefined;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  }
  throw lastError;
}


export function ImageConverter() {
  const [files, setFiles] = React.useState<FileState[]>([]);
  const [isConverting, setIsConverting] = React.useState(false);
  const [isZipping, setIsZipping] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);
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

  const resetState = React.useCallback(() => {
    files.forEach(f => URL.revokeObjectURL(f.previewUrl));
    setFiles([]);
    setIsConverting(false);
    form.reset();
    if(fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [files, form]);
  
  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (selectedFiles && selectedFiles.length > 0) {
      const newFiles: FileState[] = Array.from(selectedFiles).map((file, i) => {
        if (!file.type.startsWith('image/')) {
          toast({
            title: "Invalid File Type",
            description: `The selected file "${file.name}" is not a valid image.`,
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
  
  const applySettingsToAll = () => {
    const currentSettings = form.getValues();
    setFiles(prev => prev.map(f => ({...f, settings: currentSettings})));
    toast({ title: "Settings Applied", description: "The current settings have been applied to all uploaded images." });
  };
  
  const convertFile = async (fileState: FileState) => {
    try {
      setFiles(prev => prev.map(f => f.id === fileState.id ? {...f, status: 'converting', progress: 0} : f));

      let progressInterval = setInterval(() => {
        setFiles(prev => prev.map(f => {
          if (f.id === fileState.id && f.progress < 90) {
            return {...f, progress: f.progress + 10};
          }
          return f;
        }));
      }, 100);

      const input: OptimizeCompressionSettingsInput = {
        ...fileState.settings,
        maxFileSizeKB: Number(fileState.settings.maxFileSizeKB),
      };

      const aiResult = await withRetry(() => optimizeCompressionSettings(input));
      
      clearInterval(progressInterval);

      const originalFileName = fileState.file.name.split('.').slice(0, -1).join('.');
      const newFileName = `${originalFileName}.${fileState.settings.targetFormat.toLowerCase()}`;

      // This is a mock conversion. In a real app, you would use a library
      // to convert the image and get a new data URL.
      const reader = new FileReader();
      const convertedImageUrl = await new Promise<string>((resolve) => {
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(fileState.file);
      });


      const result: ConversionResult = {
        imageUrl: convertedImageUrl, // Using converted image URL
        fileName: newFileName,
        rationale: aiResult.optimizationRationale,
        adjustedSettings: aiResult,
      };

      setFiles(prev => prev.map(f => f.id === fileState.id ? {...f, status: 'done', progress: 100, result } : f));
    } catch (error) {
        console.error("Conversion failed for", fileState.file.name, error);
        setFiles(prev => prev.map(f => f.id === fileState.id ? {...f, status: 'error', progress: 0} : f));
        
        let errorMessage = "An unexpected error occurred.";
        if (error instanceof Error && error.message.includes('503')) {
          errorMessage = "The conversion service is temporarily overloaded. Please try again later.";
        }
        
        toast({ title: `Conversion Failed for ${fileState.file.name}`, description: errorMessage, variant: "destructive" });
    }
  };

  const onSubmit = async () => {
    if (files.length === 0) {
      toast({ title: "No files selected", description: "Please upload images to convert.", variant: "destructive" });
      return;
    }
    setIsConverting(true);
    await Promise.all(files.filter(f => f.status === 'pending').map(convertFile));
    setIsConverting(false);

    const allSucceeded = files.every(f => f.status === 'done');
    if (allSucceeded) {
      toast({ title: "All Conversions Successful!", description: "Your images have been converted." });
    }
  };
  
  const downloadAll = async () => {
    setIsZipping(true);
    const zip = new JSZip();
    try {
      const filesToZip = files.filter(f => f.status === 'done' && f.result);

      if (filesToZip.length === 0) {
        toast({ title: "No images to download", description: "There are no successfully converted images to download.", variant: "destructive" });
        return;
      }

      for (const fileState of filesToZip) {
        if(fileState.result?.imageUrl) {
            const response = await fetch(fileState.result.imageUrl);
            const blob = await response.blob();
            zip.file(fileState.result.fileName, blob);
        }
      }

      zip.generateAsync({ type: 'blob' }).then(content => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = 'converted-images.zip';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
      });

    } catch (error) {
        console.error("Failed to create zip file", error);
        toast({ title: "Zip Creation Failed", description: "Could not create zip file.", variant: "destructive" });
    } finally {
        setIsZipping(false);
    }
  };


  const allDone = files.length > 0 && files.every(f => f.status === 'done' || f.status === 'error');
  
  const conversionProgress = React.useMemo(() => {
    if (!isConverting) return 0;
    const completedCount = files.filter(f => f.status === 'done' || f.status === 'error').length;
    return Math.round((completedCount / files.length) * 100);
  }, [files, isConverting]);

  return (
    <Card className="w-full shadow-xl">
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
                  "relative flex flex-col items-center justify-center w-full h-48 rounded-lg border-2 border-dashed transition-colors duration-300 cursor-pointer",
                  isDragging ? "border-primary bg-accent/20" : "border-border hover:border-primary/80"
                )}
              >
                <div className="text-center p-8">
                  <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 font-semibold text-foreground">Click to upload or drag & drop</p>
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
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Uploaded Files</h3>
                <div className="max-h-96 overflow-y-auto space-y-3 pr-2">
                  {files.map(fileState => (
                    <div key={fileState.id} className="flex items-center gap-4 p-2 border rounded-lg">
                      <Image src={fileState.previewUrl} alt="preview" width={64} height={64} className="rounded-md object-cover w-16 h-16" />
                      <div className="flex-1">
                        <p className="text-sm font-medium truncate">{fileState.file.name}</p>
                        {fileState.status === 'converting' && <Progress value={fileState.progress} className="h-2 mt-1" />}
                        {fileState.status === 'done' && fileState.result && (
                           <a href={fileState.result.imageUrl} download={fileState.result.fileName} className="mt-1 inline-block">
                             <Button size="sm" variant="outline"><Download className="mr-2" /> Download</Button>
                           </a>
                        )}
                         {fileState.status === 'error' && <p className="text-xs text-destructive">Conversion failed</p>}
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => removeFile(fileState.id)}><X className="h-4 w-4" /></Button>
                    </div>
                  ))}
                </div>
                 <Button variant="outline" onClick={resetState} className="w-full">
                  <RotateCcw className="mr-2" /> Clear All
                 </Button>
              </div>
            )}
          </div>
          
          <div className="flex flex-col justify-center">
            <Form {...form}>
              <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-6">
                <h2 className="text-2xl font-semibold text-foreground border-b pb-2">Conversion Settings</h2>
                
                <FormField control={form.control} name="targetFormat" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Format</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select a format" /></SelectTrigger></FormControl>
                      <SelectContent>
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
                    <FormLabel>Max File Size (KB)</FormLabel>
                    <FormControl><Input type="number" placeholder="e.g., 1024" {...field} /></FormControl>
                    <FormDescription>AI will optimize settings to stay below this size.</FormDescription>
                     <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="compressionSpeed" render={({ field }) => (
                   <FormItem>
                      <div className="flex justify-between items-center">
                        <FormLabel>Compression Speed</FormLabel>
                        <span className="text-sm font-medium text-primary">{field.value}</span>
                      </div>
                      <FormControl>
                          <Slider
                              min={1} max={10} step={1}
                              value={[field.value]}
                              onValueChange={(value) => field.onChange(value[0])}
                          />
                      </FormControl>
                       <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Slower</span>
                          <span>Faster</span>
                      </div>
                   </FormItem>
                )} />

                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="lossless" render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-background/50">
                          <div className="space-y-0.5">
                              <FormLabel>Lossless</FormLabel>
                          </div>
                          <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                      </FormItem>
                  )} />

                  <FormField control={form.control} name="stripMetadata" render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-background/50">
                          <div className="space-y-0.5">
                              <FormLabel>Strip Metadata</FormLabel>
                          </div>
                          <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                      </FormItem>
                  )} />
                </div>
                
                 <Button type="button" variant="outline" className="w-full" onClick={applySettingsToAll} disabled={files.length === 0}>
                   Apply to All
                </Button>
                
                <Button type="submit" className="w-full" disabled={files.length === 0 || isConverting || allDone}>
                  {isConverting ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Converting... ({conversionProgress}%)</>
                  ) : (
                    <><Sparkles className="mr-2 h-4 w-4" /> Convert {files.filter(f=>f.status==='pending').length || ''} Images</>
                  )}
                </Button>
                {allDone && (
                  <Button type="button" onClick={downloadAll} className="w-full" disabled={isZipping || files.filter(f => f.status === 'done').length === 0}>
                    {isZipping ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Zipping...</> : <><Download className="mr-2 h-4 w-4" /> Download All</>}
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
