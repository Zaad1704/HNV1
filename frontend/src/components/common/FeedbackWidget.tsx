import React, { useState } from 'react';
import { MessageSquare, Star, Send, X, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useToast } from './Toast';
import apiClient from '../../api/client';

interface FeedbackData {
  type: 'bug' | 'feature' | 'general';
  rating: number;
  message: string;
  email?: string;
  page: string;
}

const FeedbackWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<'rating' | 'details' | 'success'>('rating');
  const [feedback, setFeedback] = useState<Partial<FeedbackData>>({
    page: window.location.pathname
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const handleRating = (rating: number) => {
    setFeedback(prev => ({ ...prev, rating }));
    setStep('details');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.message?.trim()) return;

    setIsSubmitting(true);
    try {
      await apiClient.post('/feedback', {
        ...feedback,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      });
      
      setStep('success');
      showToast({
        type: 'success',
        title: 'Feedback Sent!',
        message: 'Thank you for helping us improve.'
      });
      
      setTimeout(() => {
        setIsOpen(false);
        setStep('rating');
        setFeedback({ page: window.location.pathname });
      }, 2000);
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Failed to Send',
        message: 'Please try again later.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetWidget = () => {
    setIsOpen(false);
    setStep('rating');
    setFeedback({ page: window.location.pathname });
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 bg-app-surface border border-app-border text-text-primary p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-40"
        aria-label="Send feedback"
      >
        <MessageSquare size={20} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 left-6 bg-app-surface border border-app-border rounded-3xl shadow-2xl z-50 w-80">
      {/* Header */}
      <div className="p-4 border-b border-app-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare size={16} className="text-brand-blue" />
          <span className="font-semibold text-text-primary">Feedback</span>
        </div>
        <button
          onClick={resetWidget}
          className="p-1 rounded-full hover:bg-app-bg transition-colors"
          aria-label="Close feedback"
        >
          <X size={16} className="text-text-secondary" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {step === 'rating' && (
          <div className="text-center">
            <h3 className="font-semibold text-text-primary mb-2">How was your experience?</h3>
            <p className="text-sm text-text-secondary mb-4">Your feedback helps us improve</p>
            
            <div className="flex justify-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map(rating => (
                <button
                  key={rating}
                  onClick={() => handleRating(rating)}
                  className="p-2 rounded-full hover:bg-app-bg transition-colors"
                  aria-label={`Rate ${rating} stars`}
                >
                  <Star
                    size={24}
                    className={`${
                      feedback.rating && rating <= feedback.rating
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setFeedback(prev => ({ ...prev, rating: 1, type: 'bug' }));
                  setStep('details');
                }}
                className="flex-1 flex items-center justify-center gap-2 p-2 rounded-xl border border-app-border hover:bg-app-bg transition-colors"
              >
                <ThumbsDown size={16} />
                <span className="text-sm">Report Issue</span>
              </button>
              <button
                onClick={() => {
                  setFeedback(prev => ({ ...prev, rating: 5, type: 'feature' }));
                  setStep('details');
                }}
                className="flex-1 flex items-center justify-center gap-2 p-2 rounded-xl border border-app-border hover:bg-app-bg transition-colors"
              >
                <ThumbsUp size={16} />
                <span className="text-sm">Suggest Feature</span>
              </button>
            </div>
          </div>
        )}

        {step === 'details' && (
          <form onSubmit={handleSubmit}>
            <h3 className="font-semibold text-text-primary mb-3">Tell us more</h3>
            
            <div className="mb-3">
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Type
              </label>
              <select
                value={feedback.type || 'general'}
                onChange={(e) => setFeedback(prev => ({ ...prev, type: e.target.value as any }))}
                className="w-full p-2 border border-app-border rounded-xl bg-app-bg text-text-primary"
              >
                <option value="general">General Feedback</option>
                <option value="bug">Bug Report</option>
                <option value="feature">Feature Request</option>
              </select>
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Message *
              </label>
              <textarea
                value={feedback.message || ''}
                onChange={(e) => setFeedback(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Describe your feedback..."
                rows={3}
                className="w-full p-2 border border-app-border rounded-xl bg-app-bg text-text-primary resize-none"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Email (optional)
              </label>
              <input
                type="email"
                value={feedback.email || ''}
                onChange={(e) => setFeedback(prev => ({ ...prev, email: e.target.value }))}
                placeholder="your@email.com"
                className="w-full p-2 border border-app-border rounded-xl bg-app-bg text-text-primary"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep('rating')}
                className="flex-1 p-2 border border-app-border rounded-xl text-text-secondary hover:bg-app-bg transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !feedback.message?.trim()}
                className="flex-1 flex items-center justify-center gap-2 p-2 bg-brand-blue text-white rounded-xl hover:bg-brand-blue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send size={16} />
                )}
                Send
              </button>
            </div>
          </form>
        )}

        {step === 'success' && (
          <div className="text-center py-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <ThumbsUp size={24} className="text-green-600" />
            </div>
            <h3 className="font-semibold text-text-primary mb-1">Thank you!</h3>
            <p className="text-sm text-text-secondary">Your feedback has been sent successfully.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackWidget;