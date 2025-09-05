# Format Forge

**Smart AI-powered image conversion tool that optimizes your images for the web without compromising quality.**

![Format Forge Interface](<img width="1181" height="773" alt="image" src="https://github.com/user-attachments/assets/15662dac-e165-4d90-8762-0a2116bf9aeb" />
)

## Overview

Format Forge is a web-based image conversion tool that uses AI to intelligently optimize your images. Upload images, set your desired format and file size, and let our AI advisor recommend the best compression settings to achieve your goals while preserving maximum quality.

## Why Format Forge?

When building my portfolio website, I needed to convert images to WebP format for faster load times. Most online converters either had strict limits (5 images max on free tiers) or required payment for bulk processing. Rather than accepting these limitations, I built Format Forge to solve this common problem for developers and content creators.

## Features

- **AI-Powered Optimization**: Uses Google's Gemini AI to recommend optimal compression settings
- **Multiple Format Support**: Convert between PNG, JPG, GIF, and WebP formats
- **Smart Compression**: Balances file size reduction with quality preservation
- **Batch Processing**: Convert multiple images simultaneously
- **Client-Side Processing**: All conversions happen in your browser for privacy and speed
- **No Upload Limits**: Process as many images as your browser can handle
- **Metadata Preservation**: Option to strip or preserve image metadata
- **Instant Download**: Get your converted images as a ZIP file

## Technology Stack

### Frontend
- **Next.js** - React framework for production
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **ShadCN UI** - Modern React component library
- **Lucide React** - Beautiful icon library

### Backend & AI
- **Genkit** - Server-side flow orchestration
- **Google Generative AI** - Gemini models for compression optimization
- **Next.js API Routes** - Serverless backend functions

### Image Processing
- **Canvas API** - Native browser image processing
- **exifreader** - EXIF metadata extraction
- **jszip** - ZIP file creation for batch downloads

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/format-forge.git
cd format-forge

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your Google AI API key to .env.local

# Run the development server
npm run dev

# Open http://localhost:3000 in your browser
```

## Live Demo

Visit [formatforge.vercel.app](https://formatforge.vercel.app) to try Format Forge without any setup.

## How It Works

1. **Upload Images**: Drag and drop or select images (PNG, JPG, GIF, WebP)
2. **Configure Settings**: Choose target format, maximum file size, and compression preferences
3. **AI Optimization**: Gemini AI analyzes your requirements and recommends optimal settings
4. **Browser Processing**: Images are converted client-side using Canvas API
5. **Download Results**: Get your optimized images in a convenient ZIP file

### AI Integration Details

Format Forge uses Google's Gemini AI as an intelligent compression advisor:

- Analyzes your target format, file size, and quality preferences
- Acts as an "expert image compression optimizer" through detailed prompts
- Recommends optimal lossless and compression speed settings
- Balances trade-offs between file size, quality, and processing speed
- Provides reasoning for its recommendations

The AI doesn't perform the actual compression but guides the browser's Canvas API to use optimal settings for your specific needs.

## Limitations

- **Client-Side Processing**: Large images or batch processing may slow down or crash browsers
- **Canvas API Constraints**: Some formats (WebP, JPEG) don't support true lossless compression
- **Batch Error Handling**: Failed conversions are retried but may require manual reprocessing
- **Browser Compatibility**: Requires modern browsers with Canvas API support

## Roadmap

### Planned Features
- **Image Previews**: Side-by-side comparison of original vs. converted images
- **Advanced Controls**: Granular settings for chroma subsampling and color quantization
- **Preset Management**: Save and load favorite conversion settings
- **Progress Indicators**: Real-time feedback during batch processing
- **Format-Specific Options**: Specialized settings for each output format


## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Google Generative AI for intelligent compression optimization
- The open-source community for the excellent libraries that power this tool
- All developers who face the same image optimization challenges

---

Built with ❤️ to solve a real problem faced by designers & web developers everywhere.
