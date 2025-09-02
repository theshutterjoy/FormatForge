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

const formSchema = z.object({
  targetFormat: z.enum(['WEBP', 'PNG', 'JPEG', 'AVIF']).default('WEBP'),
  lossless: z.boolean().default(false),
  compressionSpeed: z.number().min(1).max(10).default(5),
  stripMetadata: z.boolean().default(true),
  maxFileSizeKB: z.coerce.number({invalid_type_error: "Please enter a number"}).min(10, "Must be at least 10KB").max(10000, "Must be 10000KB or less").default(1024),
});

type FormValues = z.infer<typeof formSchema>;

type ConversionResult = {
  imageUrl: string;
  fileName: string;
  rationale: string;
  adjustedSettings: OptimizeCompressionSettingsOutput;
};

export function ImageConverter() {
  const [uploadedFile, setUploadedFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [isConverting, setIsConverting] = React.useState(false);
  const [result, setResult] = React.useState<ConversionResult | null>(null);
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
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setUploadedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setIsConverting(false);
    form.reset();
    if(fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [previewUrl, form]);

  const handleFileSelect = (file: File | null) => {
    if (file && file.type.startsWith('image/')) {
      resetState();
      setUploadedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else if (file) {
      toast({
        title: "Invalid File Type",
        description: `The selected file "${file.name}" is not a valid image.`,
        variant: "destructive",
      });
    }
  };

  const onDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };
  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const onSubmit = async (data: FormValues) => {
    if (!uploadedFile) {
      toast({ title: "No file selected", description: "Please upload an image to convert.", variant: "destructive" });
      return;
    }
    setIsConverting(true);
    setResult(null);

    try {
      const input: OptimizeCompressionSettingsInput = {
        ...data,
      };
      const aiResult = await optimizeCompressionSettings(input);

      // Simulate network delay and conversion process
      await new Promise(resolve => setTimeout(resolve, 1500));

      const originalFileName = uploadedFile.name.split('.').slice(0, -1).join('.');
      const newFileName = `${originalFileName}.${data.targetFormat.toLowerCase()}`;

      setResult({
        imageUrl: previewUrl!,
        fileName: newFileName,
        rationale: aiResult.optimizationRationale,
        adjustedSettings: aiResult,
      });

      toast({
        title: "Conversion Successful!",
        description: "Your image has been converted and optimized.",
      })

    } catch (error) {
      console.error("Conversion failed:", error);
      toast({ title: "Conversion Failed", description: "An unexpected error occurred. Please try again.", variant: "destructive" });
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <Card className="w-full shadow-xl">
      <CardContent className="p-4 md:p-8">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          
          {/* Left Column: Upload and Preview */}
          <div className="flex flex-col items-center justify-center space-y-4">
            {!previewUrl ? (
              <div
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragEnter={onDragEnter}
                onDragLeave={onDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "relative flex flex-col items-center justify-center w-full h-64 md:h-full rounded-lg border-2 border-dashed transition-colors duration-300 cursor-pointer",
                  isDragging ? "border-primary bg-accent/20" : "border-border hover:border-primary/80"
                )}
                role="button"
                aria-label="Upload an image"
                tabIndex={0}
                onKeyDown={(e) => {if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click()}}
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
                  onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
                />
              </div>
            ) : (
              <div className="w-full space-y-4">
                 <div className="relative aspect-video w-full overflow-hidden rounded-lg border shadow-sm">
                    <Image src={previewUrl} alt="Image preview" fill style={{ objectFit: 'contain' }} data-ai-hint="image preview"/>
                 </div>
                 <Button variant="outline" onClick={resetState} className="w-full">
                  <RotateCcw className="mr-2" />
                  Upload Another Image
                 </Button>
              </div>
            )}
          </div>

          {/* Right Column: Settings and Results */}
          <div className="flex flex-col justify-center">
            {!result ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <h2 className="text-2xl font-semibold text-foreground border-b pb-2">Conversion Settings</h2>
                  
                  <FormField control={form.control} name="targetFormat" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Format</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!uploadedFile}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select a format" /></SelectTrigger>
                        </FormControl>
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
                      <FormControl><Input type="number" placeholder="e.g., 1024" {...field} disabled={!uploadedFile}/></FormControl>
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
                                disabled={!uploadedFile}
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
                                <FormDescription className="text-xs">Higher quality, larger file.</FormDescription>
                            </div>
                            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} disabled={!uploadedFile}/></FormControl>
                        </FormItem>
                    )} />

                    <FormField control={form.control} name="stripMetadata" render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-background/50">
                            <div className="space-y-0.5">
                                <FormLabel>Strip Metadata</FormLabel>
                                 <FormDescription className="text-xs">Remove EXIF data.</FormDescription>
                            </div>
                            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} disabled={!uploadedFile}/></FormControl>
                        </FormItem>
                    )} />
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={!uploadedFile || isConverting}>
                    {isConverting ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Converting...</>
                    ) : (
                      <><Sparkles className="mr-2 h-4 w-4" /> Convert Image</>
                    )}
                  </Button>
                </form>
              </Form>
            ) : (
              <div className="space-y-6 animate-in fade-in">
                 <h2 className="text-2xl font-semibold text-foreground border-b pb-2">Conversion Complete</h2>
                  <Alert>
                    <Sparkles className="h-4 w-4" />
                    <AlertTitle>AI Optimization Report</AlertTitle>
                    <AlertDescription>
                      {result.rationale}
                    </AlertDescription>
                  </Alert>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="rounded-lg border p-3">
                      <p className="text-muted-foreground">Final Format</p>
                      <p className="font-semibold text-primary">{result.fileName.split('.').pop()?.toUpperCase()}</p>
                    </div>
                     <div className="rounded-lg border p-3">
                      <p className="text-muted-foreground">Lossless</p>
                      <p className="font-semibold text-primary">{result.adjustedSettings.adjustedLossless ? "Yes" : "No"}</p>
                    </div>
                     <div className="rounded-lg border p-3">
                      <p className="text-muted-foreground">Compression</p>
                      <p className="font-semibold text-primary">{result.adjustedSettings.adjustedCompressionSpeed} / 10</p>
                    </div>
                     <div className="rounded-lg border p-3">
                      <p className="text-muted-foreground">Metadata</p>
                      <p className="font-semibold text-primary">{form.getValues('stripMetadata') ? "Stripped" : "Kept"}</p>
                    </div>
                  </div>
                 
                  <a href={result.imageUrl} download={result.fileName} className="block">
                    <Button className="w-full"><Download className="mr-2" /> Download Converted Image</Button>
                  </a>
                  <Button variant="outline" onClick={resetState} className="w-full">
                    <RotateCcw className="mr-2" /> Start Over
                  </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
