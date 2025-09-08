import React, { useState } from 'react';
import { GeneratedImage } from '../types';
import Loader from './Loader';
import { DownloadIcon, RefineIcon, BackIcon, TagIcon, CopyIcon } from './icons';

interface ImageGeneratorProps {
  image: GeneratedImage | null;
  refinementPrompt: string;
  setRefinementPrompt: (prompt: string) => void;
  onRefine: () => void;
  onRefineStyle: (style: string) => void;
  onBackToPrompts: () => void;
  isLoading: boolean;
  loadingMessage: string;
}

const StyleButton: React.FC<{style: string, onRefineStyle: (style: string) => void, disabled: boolean}> = ({ style, onRefineStyle, disabled }) => (
    <button
        onClick={() => onRefineStyle(style)}
        disabled={disabled}
        className="px-4 py-2 text-sm font-medium text-brand-primary bg-brand-light rounded-full hover:bg-brand-accent hover:text-white disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
    >
        {style}
    </button>
);

const ImageGenerator: React.FC<ImageGeneratorProps> = ({
  image,
  refinementPrompt,
  setRefinementPrompt,
  onRefine,
  onRefineStyle,
  onBackToPrompts,
  isLoading,
  loadingMessage,
}) => {
  const [tagsCopied, setTagsCopied] = useState(false);
  if (!image) return null;

  const imageUrl = `data:${image.mimeType};base64,${image.base64}`;
  const styles = ['Photorealistic', 'Illustration', 'Abstract', 'Painterly', 'Comic Book', 'Watercolor', 'Pixel Art'];

  const handleCopyTags = () => {
    if (image.tags && image.tags.length > 0) {
        navigator.clipboard.writeText(image.tags.join(', '));
        setTagsCopied(true);
        setTimeout(() => setTagsCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">Step 3: Refine and Finalize</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Here is your generated illustration. Refine it with text commands, apply a new style, or download it.
        </p>
      </div>

      <div className="relative w-full aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden shadow-lg">
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black bg-opacity-50 z-10">
            <Loader />
            <p className="font-semibold text-white">{loadingMessage}</p>
          </div>
        ) : null}
        <img src={imageUrl} alt="AI-generated illustration" className="w-full h-full object-contain" />
      </div>

      <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
         <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-200">Refine Style</h3>
         <div className="flex flex-wrap gap-3">
            {styles.map(style => <StyleButton key={style} style={style} onRefineStyle={onRefineStyle} disabled={isLoading} />)}
         </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          value={refinementPrompt}
          onChange={(e) => setRefinementPrompt(e.target.value)}
          placeholder="Or, refine with a custom prompt, e.g., 'Make the sky deeper blue'"
          className="flex-grow p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-brand-accent focus:outline-none transition duration-200"
          disabled={isLoading}
        />
        <button
          onClick={onRefine}
          disabled={isLoading || !refinementPrompt.trim()}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-brand-secondary text-white font-bold rounded-lg shadow-md hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300"
        >
          <RefineIcon />
          <span>Refine</span>
        </button>
      </div>
      
      {image.tags && image.tags.length > 0 && (
        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
             <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2"><TagIcon /> Suggested Tags</h3>
                <button
                    onClick={handleCopyTags}
                    className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-brand-accent dark:hover:text-brand-light transition-colors"
                >
                    <CopyIcon />
                    <span>{tagsCopied ? 'Copied!' : 'Copy All'}</span>
                </button>
             </div>
             <div className="flex flex-wrap gap-2">
                {image.tags.map((tag, index) => (
                    <span key={index} className="px-3 py-1 text-sm text-blue-800 bg-blue-100 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                        {tag}
                    </span>
                ))}
             </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
         <button
          onClick={onBackToPrompts}
          disabled={isLoading}
          className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 disabled:opacity-50 transition-colors"
        >
          <BackIcon />
          <span>Back to Prompts</span>
        </button>
         <a
          href={imageUrl}
          download="illustration.png"
          className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-all duration-300 transform hover:scale-105"
        >
          <DownloadIcon />
          <span>Download Image</span>
        </a>
      </div>
    </div>
  );
};

export default ImageGenerator;