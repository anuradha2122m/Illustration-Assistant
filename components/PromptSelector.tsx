import React, { useState } from 'react';
import Loader from './Loader';
import { BackIcon, CopyIcon } from './icons';
import { TaggedPrompt } from '../types';

interface PromptSelectorProps {
  prompts: TaggedPrompt[];
  onSelect: (prompt: string) => void;
  isLoading: boolean;
  loadingMessage: string;
  onBack: () => void;
}

const PromptSelector: React.FC<PromptSelectorProps> = ({ prompts, onSelect, isLoading, loadingMessage, onBack }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (prompt: string, index: number) => {
    navigator.clipboard.writeText(prompt);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">Step 2: Choose a Visual Concept</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Based on your article, here are a few suggested starting points. Click one to generate an image.
        </p>
      </div>
      
      {isLoading ? (
        <div className="flex flex-col items-center justify-center gap-4 p-8 text-center bg-gray-100 dark:bg-gray-700 rounded-lg">
          <Loader />
          <p className="font-semibold text-brand-primary dark:text-brand-light">{loadingMessage}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {prompts.map((item, index) => (
            <div
              key={index}
              className="group flex flex-col justify-between p-4 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-brand-accent dark:hover:border-brand-accent hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            >
              <div>
                <span className="inline-block bg-brand-light text-brand-primary text-xs font-semibold px-2.5 py-1 rounded-full mb-3">
                  {item.tag}
                </span>
                <p 
                  className="text-gray-700 dark:text-gray-300 group-hover:text-brand-primary dark:group-hover:text-brand-light transition-colors cursor-pointer"
                  onClick={() => onSelect(item.prompt)}
                >
                  {item.prompt}
                </p>
              </div>
              <div className="flex justify-end mt-3">
                <button
                  onClick={() => handleCopy(item.prompt, index)}
                  className={`flex items-center gap-1 text-xs transition-colors ${copiedIndex === index ? 'text-green-500 dark:text-green-400 font-semibold' : 'text-gray-500 dark:text-gray-400 hover:text-brand-accent dark:hover:text-brand-light'}`}
                  aria-label="Copy prompt"
                >
                  <CopyIcon />
                  <span>{copiedIndex === index ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={onBack}
        disabled={isLoading}
        className="flex items-center justify-center gap-2 w-full sm:w-auto self-start px-6 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 disabled:opacity-50 transition-colors"
      >
        <BackIcon />
        <span>Back to Article</span>
      </button>
    </div>
  );
};

export default PromptSelector;