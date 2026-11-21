'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Award,
  CheckCircle2,
  XCircle,
  RotateCcw,
  BookOpen,
  ArrowRight,
  HelpCircle,
  Sparkles,
  LayoutDashboard,
  SlidersHorizontal,
  Layers,
  Timer,
  Play,
  Flame,
  Check,
} from 'lucide-react';
import { QUIZ_QUESTIONS, QuizQuestion, QuizDifficulty } from '@/lib/quizData';
import { useAuth } from '@/context/AuthContext';
import { saveUserQuizScore } from '@/lib/userService';

const QUESTION_COUNT_OPTIONS = [5, 10, 15, 20];
const DIFFICULTY_OPTIONS: ('All' | QuizDifficulty)[] = ['All', 'Easy', 'Medium', 'Hard'];

export default function QuizPage() {
  const { user } = useAuth();

  // Setup / Configuration State
  const [isStarted, setIsStarted] = useState(false);
  const [selectedCount, setSelectedCount] = useState<number>(10);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'All' | QuizDifficulty>('All');

  // Active Quiz State
  const [activeQuestions, setActiveQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [userAnswers, setUserAnswers] = useState<
    { questionId: number; selected: number; isCorrect: boolean }[]
  >([]);

  // Count available questions based on difficulty
  const availableQuestionsCount = useMemo(() => {
    if (selectedDifficulty === 'All') return QUIZ_QUESTIONS.length;
    return QUIZ_QUESTIONS.filter((q) => q.difficulty === selectedDifficulty).length;
  }, [selectedDifficulty]);

  const handleStartQuiz = () => {
    // Filter questions by difficulty
    let pool = QUIZ_QUESTIONS;
    if (selectedDifficulty !== 'All') {
      pool = QUIZ_QUESTIONS.filter((q) => q.difficulty === selectedDifficulty);
    }

    // Shuffle pool
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const finalSet = shuffled.slice(0, Math.min(selectedCount, shuffled.length));

    setActiveQuestions(finalSet);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setQuizCompleted(false);
    setUserAnswers([]);
    setIsStarted(true);
  };

  const currentQ: QuizQuestion | undefined = activeQuestions[currentIndex];

  const handleSelectOption = (index: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(index);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null || isAnswerSubmitted || !currentQ) return;

    const isCorrect = selectedOption === currentQ.correctIndex;
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }

    setUserAnswers((prev) => [
      ...prev,
      {
        questionId: currentQ.id,
        selected: selectedOption,
        isCorrect,
      },
    ]);

    setIsAnswerSubmitted(true);
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < activeQuestions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      setQuizCompleted(true);
      const totalQ = activeQuestions.length;
      const finalScore = score + (selectedOption === currentQ?.correctIndex && !isAnswerSubmitted ? 1 : 0);
      const finalPercentage = totalQ > 0 ? Math.round((finalScore / totalQ) * 100) : 0;

      const quizPayload = {
        score: finalScore,
        total: totalQ,
        percentage: finalPercentage,
        date: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        timestamp: Date.now(),
      };

      if (user) {
        saveUserQuizScore(user.uid, quizPayload);
      } else {
        try {
          localStorage.setItem('greenbin_last_quiz_score', JSON.stringify(quizPayload));
        } catch (err) {
          console.error('Error saving score:', err);
        }
      }
    }
  };

  const handleResetToConfig = () => {
    setIsStarted(false);
    setQuizCompleted(false);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setUserAnswers([]);
  };

  const percentage = activeQuestions.length > 0 ? Math.round((score / activeQuestions.length) * 100) : 0;

  const getScoreFeedback = () => {
    if (percentage >= 80) {
      return {
        title: 'Master Recycler!',
        message: 'Outstanding awareness! You possess exceptional waste segregation expertise.',
        color: 'text-forest',
        bg: 'bg-forest-subtle',
      };
    }
    if (percentage >= 60) {
      return {
        title: 'Eco Environmentalist',
        message: 'Great effort! A quick review of our Segregation Guide will make you an expert.',
        color: 'text-blue-700',
        bg: 'bg-blue-50',
      };
    }
    return {
      title: 'Keep Practicing!',
      message: 'Waste segregation takes practice. Check our guide to master proper bin sorting.',
      color: 'text-amber-700',
      bg: 'bg-amber-50',
    };
  };

  const getDifficultyBadge = (diff: QuizDifficulty) => {
    switch (diff) {
      case 'Easy':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Medium':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'Hard':
        return 'bg-rose-50 text-rose-800 border-rose-200';
    }
  };

  return (
    <div className="py-10 sm:py-14 bg-gray-50/50 min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-subtle text-forest text-xs font-semibold mb-3 border border-forest-200">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Eco Quiz</span>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Waste Segregation Challenge
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            Test your knowledge of organic composting, dry recyclables, and hazardous waste disposal.
          </p>
        </div>

        {/* 1. CONFIGURATION SCREEN */}
        {!isStarted && !quizCompleted && (
          <div className="card-stitch bg-white p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
              <SlidersHorizontal className="w-5 h-5 text-forest" />
              <div>
                <h2 className="text-base font-bold text-gray-900">
                  Customize Your Quiz
                </h2>
                <p className="text-xs text-gray-500">
                  Select question count and difficulty level to test your knowledge.
                </p>
              </div>
            </div>

            {/* Select Number of Questions */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2.5">
                Number of Questions
              </label>
              <div className="grid grid-cols-4 gap-2.5">
                {QUESTION_COUNT_OPTIONS.map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setSelectedCount(count)}
                    className={`py-3 px-3 rounded-xl text-center font-bold text-sm transition-all border ${
                      selectedCount === count
                        ? 'bg-forest text-white border-forest shadow-xs'
                        : 'bg-white border-gray-200 text-gray-700 hover:border-forest/40 hover:bg-forest-subtle/20'
                    }`}
                  >
                    <div className="text-base">{count}</div>
                    <div className={`text-[10px] font-medium ${selectedCount === count ? 'text-emerald-100' : 'text-gray-400'}`}>
                      Questions
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Select Difficulty Level */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2.5">
                Difficulty Level
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {DIFFICULTY_OPTIONS.map((diff) => {
                  const isSelected = selectedDifficulty === diff;
                  return (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => setSelectedDifficulty(diff)}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        isSelected
                          ? 'border-forest bg-forest-subtle/50 text-forest-dark ring-2 ring-forest/20'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-bold text-xs sm:text-sm">{diff}</div>
                      <div className="text-[10px] text-gray-500 mt-0.5">
                        {diff === 'All'
                          ? 'Mixed'
                          : diff === 'Easy'
                          ? 'Foundational'
                          : diff === 'Medium'
                          ? 'Intermediate'
                          : 'Expert'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quiz Info Summary Box */}
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-forest" />
                <span>
                  <strong>{availableQuestionsCount}</strong> questions available in database
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4 text-forest" />
                <span>Est. time: ~{Math.ceil(selectedCount * 0.6)} mins</span>
              </div>
            </div>

            {/* Start Button */}
            <button
              type="button"
              onClick={handleStartQuiz}
              className="w-full py-3.5 px-4 rounded-xl bg-forest hover:bg-forest-dark text-white font-semibold text-sm transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start Quiz ({selectedCount} Questions)</span>
            </button>
          </div>
        )}

        {/* 2. ACTIVE QUIZ QUESTION SCREEN */}
        {isStarted && !quizCompleted && currentQ && (
          <div className="card-stitch bg-white p-6 sm:p-8 shadow-sm">
            {/* Top Bar with Question Count, Category & Difficulty */}
            <div className="flex items-center justify-between gap-2 pb-4 mb-5 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-800">
                  Question {currentIndex + 1} of {activeQuestions.length}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getDifficultyBadge(
                    currentQ.difficulty
                  )}`}
                >
                  {currentQ.difficulty}
                </span>
              </div>

              <span className="text-xs text-gray-500 font-medium">
                {currentQ.category}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-forest h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${((currentIndex + 1) / activeQuestions.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Question Text */}
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-6 leading-snug">
              {currentQ.question}
            </h2>

            {/* Options List */}
            <div className="space-y-3 mb-6">
              {currentQ.options.map((option, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = idx === currentQ.correctIndex;

                let optionStyles = 'border-gray-200 hover:border-gray-300 bg-white';

                if (isAnswerSubmitted) {
                  if (isCorrect) {
                    optionStyles = 'border-forest bg-forest-subtle/40 text-forest-dark font-medium ring-1 ring-forest';
                  } else if (isSelected && !isCorrect) {
                    optionStyles = 'border-rose-300 bg-rose-50 text-rose-900 font-medium';
                  } else {
                    optionStyles = 'border-gray-100 bg-gray-50/50 opacity-60';
                  }
                } else if (isSelected) {
                  optionStyles = 'border-forest bg-forest-subtle/20 text-gray-900 ring-2 ring-forest/20';
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={isAnswerSubmitted}
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-start justify-between gap-3 text-sm ${optionStyles}`}
                  >
                    <span className="flex-1">{option}</span>
                    {isAnswerSubmitted && isCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-forest shrink-0 mt-0.5" />
                    )}
                    {isAnswerSubmitted && isSelected && !isCorrect && (
                      <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation box */}
            {isAnswerSubmitted && (
              <div className="mb-6 p-4 rounded-xl bg-gray-50 border border-gray-100 text-xs sm:text-sm text-gray-700 leading-relaxed animate-in fade-in">
                <div className="font-semibold text-gray-900 mb-1 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-forest" />
                  Explanation
                </div>
                {currentQ.explanation}
              </div>
            )}

            {/* Bottom Actions */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleResetToConfig}
                className="px-3.5 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-semibold"
                title="Exit quiz and adjust settings"
              >
                Quit
              </button>

              {!isAnswerSubmitted ? (
                <button
                  type="button"
                  disabled={selectedOption === null}
                  onClick={handleSubmitAnswer}
                  className="flex-1 py-3 rounded-xl bg-forest hover:bg-forest-dark disabled:opacity-50 disabled:pointer-events-none text-white text-sm font-semibold transition-colors shadow-2xs"
                >
                  Submit Answer
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNextQuestion}
                  className="flex-1 py-3 rounded-xl bg-forest hover:bg-forest-dark text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-2xs"
                >
                  <span>
                    {currentIndex + 1 < activeQuestions.length
                      ? 'Next Question'
                      : 'View Final Results'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* 3. FINAL RESULTS SCREEN */}
        {quizCompleted && (
          <div className="card-stitch bg-white p-6 sm:p-8 text-center shadow-sm">
            <div className={`w-16 h-16 rounded-2xl ${getScoreFeedback().bg} flex items-center justify-center mx-auto mb-4`}>
              <Award className={`w-8 h-8 ${getScoreFeedback().color}`} />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              Quiz Completed!
            </h2>
            <p className={`text-base font-semibold ${getScoreFeedback().color} mb-4`}>
              {getScoreFeedback().title}
            </p>

            {/* Score Ring Display */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 max-w-sm mx-auto mb-6">
              <div className="text-4xl font-extrabold text-gray-900">
                {score} <span className="text-xl font-medium text-gray-500">/ {activeQuestions.length}</span>
              </div>
              <p className="text-xs font-semibold text-forest mt-1">
                {percentage}% Score ({selectedDifficulty} Mode)
              </p>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                {getScoreFeedback().message}
              </p>
              {user && (
                <p className="text-[11px] text-emerald-700 font-medium mt-3 bg-emerald-50 py-1 px-2.5 rounded-lg border border-emerald-200 inline-block">
                  ✓ Score saved to your profile dashboard
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleResetToConfig}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-forest text-white text-xs font-semibold hover:bg-forest-dark transition-colors flex items-center justify-center gap-2 shadow-2xs"
              >
                <RotateCcw className="w-4 h-4" />
                New Quiz Setup
              </button>
              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-800 text-xs font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4 text-forest" />
                View on Dashboard
              </Link>
              <Link
                href="/guide"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-xs font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                <BookOpen className="w-4 h-4" />
                Guide
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
