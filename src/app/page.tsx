import { ImageConverter } from '@/components/image-converter';
import { AboutDialog } from '@/components/about-dialog';
import { ExifViewerDialog } from '@/components/exif-viewer-dialog';

export default function Home() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center p-4 sm:p-8 md:p-12">
      <div className="w-full max-w-6xl mx-auto border-2 border-foreground p-1">
        <header className="relative text-left mb-8 p-4 border-b-2 border-foreground">
          <div className="absolute top-4 right-4 flex items-center space-x-2">
            <ExifViewerDialog />
            <AboutDialog />
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
