
import React from 'react';
import Loader from './Loader';
import { GenerateIcon } from './icons';

interface ArticleInputProps {
  article: string;
  setArticle: (article: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  loadingMessage: string;
}

const ArticleInput: React.FC<ArticleInputProps> = ({ article, setArticle, onSubmit, isLoading, loadingMessage }) => {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">Step 1: Paste Your Article</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Enter the full text of your story below. The AI will analyze it to suggest relevant illustration concepts.
        </p>
      </div>
      <textarea
        value={article}
        onChange={(e) => setArticle(e.target.value)}
        placeholder="In a small village in Gujarat, the sun is not just a source of light, but a beacon of hope..."
        className="w-full h-64 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-brand-accent focus:outline-none transition duration-200 resize-y"
        disabled={isLoading}
      />
      <button
        onClick={onSubmit}
        disabled={isLoading || !article.trim()}
        className="flex items-center justify-center gap-2 w-full sm:w-auto self-end px-6 py-3 bg-brand-primary text-white font-bold rounded-lg shadow-md hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
      >
        {isLoading ? (
          <>
            <Loader />
            <span>{loadingMessage}</span>
          </>
        ) : (
          <>
            <GenerateIcon />
            <span>Generate Prompts</span>
          </>
        )}
      </button>
    </div>
  );
};

export default ArticleInput;
