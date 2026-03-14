import { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { sections } from '../data/sections';
import { useFlashCards } from '../hooks/useFlashCards';
import { FlashCard } from '../types';
import SEO from '../components/SEO/SEO';

export default function FlashCardsPage() {
  const { getDueCards, reviewCard, allCards } = useFlashCards();
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [browsing, setBrowsing] = useState(false);
  const [browseIndex, setBrowseIndex] = useState(0);

  const dueCards = useMemo(
    () => getDueCards(selectedSection ?? undefined),
    [getDueCards, selectedSection]
  );

  const browseCards = useMemo(() => {
    if (!browsing) return [];
    return selectedSection
      ? allCards.filter(c => c.sectionId === selectedSection)
      : allCards;
  }, [browsing, selectedSection, allCards]);

  const currentCards = browsing ? browseCards : dueCards;
  const currentIndex = browsing ? browseIndex : 0;
  const currentCard: FlashCard | undefined = currentCards[currentIndex];

  const totalCards = currentCards.length;

  const handleReveal = useCallback(() => setShowAnswer(true), []);

  const handleResponse = useCallback((correct: boolean) => {
    if (!currentCard) return;
    reviewCard(currentCard.id, correct);
    setShowAnswer(false);
    setReviewedCount(prev => prev + 1);
  }, [currentCard, reviewCard]);

  const handleBrowseNav = useCallback((dir: 1 | -1) => {
    setBrowseIndex(prev => {
      const next = prev + dir;
      if (next < 0) return browseCards.length - 1;
      if (next >= browseCards.length) return 0;
      return next;
    });
    setShowAnswer(false);
  }, [browseCards.length]);

  const startBrowsing = useCallback(() => {
    setBrowsing(true);
    setBrowseIndex(0);
    setShowAnswer(false);
  }, []);

  const stopBrowsing = useCallback(() => {
    setBrowsing(false);
    setBrowseIndex(0);
    setShowAnswer(false);
  }, []);

  const sectionTabs = useMemo(() => {
    const sectionIds = new Set(allCards.map(c => c.sectionId));
    return sections.filter(s => sectionIds.has(s.id));
  }, [allCards]);

  const currentSection = currentCard
    ? sections.find(s => s.id === currentCard.sectionId)
    : null;

  return (
    <div className="max-w-[800px] mx-auto pb-12">
      <SEO
        title="Flash Cards"
        description="Review ML concepts with spaced repetition flash cards. Reinforce your understanding of NumPy, neural networks, transformers, and more."
        canonical="/flashcards"
        keywords="flash cards, spaced repetition, ML review, machine learning study"
      />

      {/* Header */}
      <div className="pt-8 mb-8 animate-fade-up">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-[13px] text-gray-500 dark:text-dark-200 hover:text-gray-900 dark:hover:text-dark-100 transition-colors mb-4"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Home
        </Link>
        <h1 className="font-display text-3xl text-gray-900 dark:text-dark-100 tracking-tight">
          Flash Cards
        </h1>
        <p className="text-[13px] text-gray-500 dark:text-dark-300 mt-1.5">
          {browsing ? 'Browsing all cards' : 'Spaced repetition review — reinforce what you\'ve learned'}
        </p>
      </div>

      {/* Section Filter Tabs */}
      <div className="mb-8 animate-fade-up [animation-delay:0.1s]">
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-none">
          <button
            onClick={() => { setSelectedSection(null); setShowAnswer(false); setBrowseIndex(0); }}
            className={`shrink-0 px-3 py-1.5 text-[12px] font-semibold rounded-lg border transition-all ${
              selectedSection === null
                ? 'bg-primary-500 text-white border-primary-500'
                : 'bg-white dark:bg-dark-800 text-gray-600 dark:text-dark-200 border-gray-200 dark:border-dark-500 hover:border-gray-300 dark:hover:border-dark-400'
            }`}
          >
            All
          </button>
          {sectionTabs.map(section => (
            <button
              key={section.id}
              onClick={() => { setSelectedSection(section.id); setShowAnswer(false); setBrowseIndex(0); }}
              className={`shrink-0 px-3 py-1.5 text-[12px] font-semibold rounded-lg border transition-all ${
                selectedSection === section.id
                  ? 'bg-primary-500 text-white border-primary-500'
                  : 'bg-white dark:bg-dark-800 text-gray-600 dark:text-dark-200 border-gray-200 dark:border-dark-500 hover:border-gray-300 dark:hover:border-dark-400'
              }`}
            >
              <span className="mr-1">{section.icon}</span>
              {section.title}
            </button>
          ))}
        </div>
      </div>

      {/* Main Card Area */}
      <div className="animate-fade-up [animation-delay:0.15s]">
        {currentCard ? (
          <>
            {/* Progress Bar */}
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-[11px] text-gray-400 dark:text-dark-300">
                {browsing
                  ? `${currentIndex + 1} of ${totalCards} cards`
                  : `${reviewedCount} reviewed — ${totalCards} remaining`
                }
              </span>
              {currentSection && (
                <span className="text-[11px] text-gray-400 dark:text-dark-300">
                  {currentSection.icon} {currentSection.title}
                </span>
              )}
            </div>

            {/* Card with Flip */}
            <div className="flashcard-container mb-6" style={{ minHeight: 280 }}>
              <div className={`flashcard-inner ${showAnswer ? 'flashcard-flipped' : ''}`}>
                {/* Front — Question */}
                <div className="flashcard-face flashcard-front bg-white dark:bg-dark-800 rounded-[14px] border border-gray-200 dark:border-dark-500 p-8 flex flex-col">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-primary-400 dark:text-primary-300 font-mono mb-4">
                    Question
                  </div>
                  <div className="flex-1 flex items-center">
                    <p className="text-lg text-gray-900 dark:text-dark-100 leading-relaxed font-medium">
                      {currentCard.question}
                    </p>
                  </div>
                  {currentCard.tags && currentCard.tags.length > 0 && (
                    <div className="flex gap-1.5 mt-4 pt-4 border-t border-gray-100 dark:border-dark-500">
                      {currentCard.tags.map(tag => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 text-[10px] font-mono text-gray-400 dark:text-dark-300 bg-gray-100 dark:bg-dark-600 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Back — Answer */}
                <div className="flashcard-face flashcard-back bg-white dark:bg-dark-800 rounded-[14px] border border-gray-200 dark:border-dark-500 p-8 flex flex-col overflow-y-auto">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-accent-500 dark:text-accent-400 font-mono mb-4">
                    Answer
                  </div>
                  <div className="flex-1 prose-sm text-gray-700 dark:text-dark-100 leading-relaxed flashcard-answer">
                    <ReactMarkdown>{currentCard.answer}</ReactMarkdown>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-center gap-3">
              {!showAnswer ? (
                <>
                  {browsing && (
                    <button
                      onClick={() => handleBrowseNav(-1)}
                      className="px-4 py-2.5 text-sm font-medium rounded-lg bg-gray-100 dark:bg-dark-600 text-gray-600 dark:text-dark-200 border border-gray-200 dark:border-dark-500 hover:bg-gray-200 dark:hover:bg-dark-500 transition-colors"
                    >
                      Previous
                    </button>
                  )}
                  <button
                    onClick={handleReveal}
                    className="px-8 py-2.5 text-sm font-semibold rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors shadow-sm"
                  >
                    Show Answer
                  </button>
                  {browsing && (
                    <button
                      onClick={() => handleBrowseNav(1)}
                      className="px-4 py-2.5 text-sm font-medium rounded-lg bg-gray-100 dark:bg-dark-600 text-gray-600 dark:text-dark-200 border border-gray-200 dark:border-dark-500 hover:bg-gray-200 dark:hover:bg-dark-500 transition-colors"
                    >
                      Next
                    </button>
                  )}
                </>
              ) : (
                <>
                  {browsing ? (
                    <>
                      <button
                        onClick={() => handleBrowseNav(-1)}
                        className="px-4 py-2.5 text-sm font-medium rounded-lg bg-gray-100 dark:bg-dark-600 text-gray-600 dark:text-dark-200 border border-gray-200 dark:border-dark-500 hover:bg-gray-200 dark:hover:bg-dark-500 transition-colors"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setShowAnswer(false)}
                        className="px-6 py-2.5 text-sm font-medium rounded-lg bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-300 border border-primary-200 dark:border-primary-500/20 hover:bg-primary-100 dark:hover:bg-primary-500/20 transition-colors"
                      >
                        Hide Answer
                      </button>
                      <button
                        onClick={() => handleBrowseNav(1)}
                        className="px-4 py-2.5 text-sm font-medium rounded-lg bg-gray-100 dark:bg-dark-600 text-gray-600 dark:text-dark-200 border border-gray-200 dark:border-dark-500 hover:bg-gray-200 dark:hover:bg-dark-500 transition-colors"
                      >
                        Next
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleResponse(false)}
                        className="px-6 py-2.5 text-sm font-semibold rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-500/20 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors"
                      >
                        Missed it
                      </button>
                      <button
                        onClick={() => handleResponse(true)}
                        className="px-6 py-2.5 text-sm font-semibold rounded-lg bg-accent-50 dark:bg-accent-500/10 text-accent-600 dark:text-accent-300 border border-accent-200 dark:border-accent-500/20 hover:bg-accent-100 dark:hover:bg-accent-500/20 transition-colors"
                      >
                        Got it
                      </button>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Mode toggle */}
            {browsing && (
              <div className="text-center mt-4">
                <button
                  onClick={stopBrowsing}
                  className="text-[12px] text-gray-400 dark:text-dark-300 hover:text-gray-600 dark:hover:text-dark-200 transition-colors"
                >
                  Back to review mode
                </button>
              </div>
            )}
          </>
        ) : (
          /* Empty State */
          <div className="text-center py-16 bg-white dark:bg-dark-800 rounded-[14px] border border-gray-200 dark:border-dark-500">
            <div className="w-14 h-14 mx-auto mb-4 bg-accent-50 dark:bg-accent-500/10 border border-accent-200 dark:border-accent-500/20 rounded-[14px] flex items-center justify-center">
              <svg className="w-7 h-7 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="text-lg font-semibold text-gray-900 dark:text-dark-100 mb-1.5">All caught up!</div>
            <p className="text-[13px] text-gray-500 dark:text-dark-300 mb-6 max-w-[320px] mx-auto">
              {reviewedCount > 0
                ? `You reviewed ${reviewedCount} card${reviewedCount !== 1 ? 's' : ''} this session. Come back later for more.`
                : 'No cards are due for review right now. Check back soon or browse all cards.'
              }
            </p>
            <button
              onClick={startBrowsing}
              className="px-5 py-2 text-[13px] font-semibold rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors"
            >
              Browse All Cards
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
