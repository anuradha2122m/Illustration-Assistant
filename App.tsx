import React, { useState, useCallback } from 'react';
import { WorkflowState, GeneratedImage, TaggedPrompt } from './types';
import { generatePromptsForArticle, generateImageFromPrompt, refineImage, generateTagsForImage } from './services/geminiService';
import ArticleInput from './components/ArticleInput';
import PromptSelector from './components/PromptSelector';
import ImageGenerator from './components/ImageGenerator';
import { HeaderIcon } from './components/icons';

const App: React.FC = () => {
  const [workflowState, setWorkflowState] = useState<WorkflowState>(WorkflowState.ARTICLE_INPUT);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const [article, setArticle] = useState<string>('');
  const [prompts, setPrompts] = useState<TaggedPrompt[]>([]);
  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null);
  const [refinementPrompt, setRefinementPrompt] = useState<string>('');

  const handleError = (message: string, err: any) => {
    console.error(err);
    setError(message);
    setIsLoading(false);
  };

  const handleGeneratePrompts = useCallback(async () => {
    if (!article.trim()) {
      setError('Article content cannot be empty.');
      return;
    }
    setIsLoading(true);
    setLoadingMessage('Analyzing article and generating prompt ideas...');
    setError(null);
    try {
      const suggestedPrompts = await generatePromptsForArticle(article);
      setPrompts(suggestedPrompts);
      setWorkflowState(WorkflowState.PROMPT_SELECTION);
    } catch (err) {
      handleError('Failed to generate prompts. Please check your API key and try again.', err);
    } finally {
      setIsLoading(false);
    }
  }, [article]);

  const handleGenerateImage = useCallback(async (prompt: string) => {
    setIsLoading(true);
    setLoadingMessage('Creating initial illustration...');
    setError(null);
    try {
      const image = await generateImageFromPrompt(prompt);
      setLoadingMessage('Generating descriptive tags...');
      const tags = await generateTagsForImage(image.base64, article);
      setGeneratedImage({ ...image, tags });
      setWorkflowState(WorkflowState.IMAGE_DISPLAY);
    } catch (err) {
      handleError('Failed to generate the image. The model may have refused the request. Please try a different prompt.', err);
    } finally {
      setIsLoading(false);
    }
  }, [article]);

  const performImageRefinement = useCallback(async (currentImage: GeneratedImage, prompt: string) => {
      const refinedImage = await refineImage(currentImage.base64, currentImage.mimeType, prompt);
      setLoadingMessage('Updating descriptive tags...');
      const tags = await generateTagsForImage(refinedImage.base64, article);
      setGeneratedImage({ ...refinedImage, tags });
      setRefinementPrompt('');
  }, [article]);


  const handleRefineImage = useCallback(async () => {
    if (!generatedImage || !refinementPrompt.trim()) {
      setError('Cannot refine without an image and a refinement prompt.');
      return;
    }
    setIsLoading(true);
    setLoadingMessage('Applying your edits to the illustration...');
    setError(null);
    try {
        await performImageRefinement(generatedImage, refinementPrompt);
    } catch (err)      {
      handleError('Failed to refine the image. Please try a different refinement prompt.', err);
    } finally {
      setIsLoading(false);
    }
  }, [generatedImage, refinementPrompt, performImageRefinement]);

  const handleRefineStyle = useCallback(async (style: string) => {
    if (!generatedImage) {
        setError('Cannot refine a style without a base image.');
        return;
    }
    setIsLoading(true);
    setLoadingMessage(`Changing style to ${style}...`);
    setError(null);
    try {
        const stylePrompt = `Regenerate the image in a ${style} style, preserving the core subject matter.`;
        await performImageRefinement(generatedImage, stylePrompt);
    } catch (err) {
        handleError('Failed to refine the image style. Please try again.', err);
    } finally {
        setIsLoading(false);
    }
  }, [generatedImage, performImageRefinement]);


  const handleStartOver = () => {
    setWorkflowState(WorkflowState.ARTICLE_INPUT);
    setArticle('');
    setPrompts([]);
    setGeneratedImage(null);
    setRefinementPrompt('');
    setError(null);
    setIsLoading(false);
  };

  const handleBackToPrompts = () => {
    setGeneratedImage(null);
    setRefinementPrompt('');
    setError(null);
    setIsLoading(false);
    setWorkflowState(WorkflowState.PROMPT_SELECTION);
  };

  const renderContent = () => {
    switch (workflowState) {
      case WorkflowState.ARTICLE_INPUT:
        return (
          <ArticleInput
            article={article}
            setArticle={setArticle}
            onSubmit={handleGeneratePrompts}
            isLoading={isLoading}
            loadingMessage={loadingMessage}
          />
        );
      case WorkflowState.PROMPT_SELECTION:
        return (
          <PromptSelector
            prompts={prompts}
            onSelect={handleGenerateImage}
            isLoading={isLoading}
            loadingMessage={loadingMessage}
            onBack={handleStartOver}
          />
        );
      case WorkflowState.IMAGE_DISPLAY:
        return (
          <ImageGenerator
            image={generatedImage}
            refinementPrompt={refinementPrompt}
            setRefinementPrompt={setRefinementPrompt}
            onRefine={handleRefineImage}
            onRefineStyle={handleRefineStyle}
            onBackToPrompts={handleBackToPrompts}
            isLoading={isLoading}
            loadingMessage={loadingMessage}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans p-4 sm:p-6 lg:p-8">
      <main className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-4">
            <HeaderIcon />
            <h1 className="text-4xl sm:text-5xl font-bold text-brand-primary dark:text-brand-light">
              Illustration Assistant
            </h1>
          </div>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            Transform your articles into compelling visual stories.
          </p>
        </header>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md shadow-md" role="alert">
            <p className="font-bold">An error occurred</p>
            <p>{error}</p>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 sm:p-8 transition-all duration-300">
          {renderContent()}
        </div>

        <footer className="text-center mt-8 text-gray-500 dark:text-gray-400 text-sm">
          <p>Powered by Google Gemini. AI-generated images should be reviewed for accuracy and appropriateness.</p>
        </footer>
      </main>
    </div>
  );
};

export default App;
