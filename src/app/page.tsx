import { ImageConverter } from '@/components/image-converter';

export default function Home() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center p-4 sm:p-8 md:p-12">
      <div className="w-full max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-primary font-headline tracking-tight">
            Format Forge
          </h1>
          <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
            Effortlessly convert your images. Upload a file, choose your settings, and let our smart converter do the rest.
          </p>
        </header>
        <ImageConverter />
      </div>
    </main>
  );
}
