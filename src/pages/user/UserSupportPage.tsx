import React, { useState, useMemo } from 'react';
import { UserSidebar } from '../../components/user/UserSidebar';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import {
  HelpCircle,
  MessageSquare,
  Send,
  Mail,
  User,
  CheckCircle,
  Copy,
  ChevronDown,
  Search,
  Sparkles,
  LifeBuoy,
} from 'lucide-react';

interface FAQItem {
  id: string;
  category: 'ai' | 'calls' | 'voice' | 'privacy' | 'general';
  question: string;
  answer: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    id: 'f1',
    category: 'ai',
    question: 'How can I achieve the best sign recognition accuracy?',
    answer:
      'Keep your entire hand clearly in the webcam frame with even front lighting. Avoid heavy backlights, busy moving backgrounds, or covering your fingers. Hold each gesture steadily for about 1 second so the MediaPipe AI landmark detector can lock on and classify the sign with high confidence.',
  },
  {
    id: 'f2',
    category: 'ai',
    question: 'Why is my webcam mirrored, and does the AI still recognize signs?',
    answer:
      'SignMate mirrors your webcam video intentionally so signing feels natural, exactly like looking into a mirror. The sign AI automatically accounts for mirror mode coordinate transformations, ensuring sub-pixel accurate skeletal detection without distorting letter predictions.',
  },
  {
    id: 'f3',
    category: 'calls',
    question: 'How many participants can join a video call room?',
    answer:
      'SignMate video call rooms support up to 4 concurrent participants in a true peer-to-peer WebRTC mesh topology. Every caller gets real-time unmuted audio, video, and live sign subtitles. If a 5th user tries to enter, the room displays a "Room Full" notification.',
  },
  {
    id: 'f4',
    category: 'voice',
    question: 'Can hearing participants listen to incoming signs spoken aloud?',
    answer:
      'Yes! SignMate features built-in Text-to-Speech (TTS) voice synthesis. Toggle "Voice: ON" on the floating subtitles bar to have incoming signs automatically vocalized, or click the "Listen" button beside any live subtitle message to hear it on demand.',
  },
  {
    id: 'f5',
    category: 'calls',
    question: 'What should I do if my camera or microphone is blocked?',
    answer:
      'Click the lock or settings icon in your browser URL address bar and verify that Camera and Microphone permissions are set to "Allow". If browsing across a local network IP address, make sure to browse via localhost or HTTPS to comply with modern browser media security requirements.',
  },
  {
    id: 'f6',
    category: 'privacy',
    question: 'Are my video call streams and camera frames recorded or stored?',
    answer:
      'No. SignMate operates on a privacy-first foundation. Hand landmark detection runs locally on your device in the browser using WebAssembly. All video and audio streams travel directly between peers over encrypted WebRTC without saving your camera recordings to external servers.',
  },
  {
    id: 'f7',
    category: 'ai',
    question: 'How do I repeat double letters (e.g. "OO" in "MOON")?',
    answer:
      'In the active video call or practice screen, simply click the "2x" button in the buffer controls bar immediately after signing the letter. It automatically repeats the character without requiring you to drop and re-sign your hand.',
  },
  {
    id: 'f8',
    category: 'general',
    question: 'Can I use SignMate without an external camera or sensory gloves?',
    answer:
      'Absolutely! SignMate requires zero specialized hardware. Any standard built-in laptop camera or affordable USB webcam is fully supported.',
  },
];

export const UserSupportPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  // Search & FAQ state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>('f1');

  // Feedback form state
  const [formData, setFormData] = useState({
    name: user?.displayName || '',
    email: user?.email || '',
    category: 'General Feedback',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const SUPPORT_EMAIL = 'rashidkp2004@gmail.com';

  const filteredFaqs = useMemo(() => {
    return FAQ_DATA.filter((item) => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesSearch =
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const toggleFaq = (id: string) => {
    setExpandedFaqId((prev) => (prev === id ? null : id));
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(SUPPORT_EMAIL);
    setIsCopied(true);
    showToast({
      type: 'success',
      title: 'Email Copied',
      message: `${SUPPORT_EMAIL} copied to clipboard!`,
    });
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.message.trim()) {
      showToast({
        type: 'error',
        title: 'Message Required',
        message: 'Please enter your feedback or question message.',
      });
      return;
    }

    setIsSubmitting(true);

    const emailSubject = encodeURIComponent(
      `[SignMate Feedback - ${formData.category}]: ${formData.subject || 'User Inquiry'}`
    );
    const emailBody = encodeURIComponent(
      `From: ${formData.name || 'Anonymous User'} (${formData.email || 'No email provided'})
Category: ${formData.category}
Subject: ${formData.subject || 'SignMate Feedback'}

Message:
${formData.message}

---
Sent via SignMate Support & Feedback Center
Local Time: ${new Date().toLocaleString()}
`
    );

    // Open user's default email client addressed to rashidkp2004@gmail.com
    const mailtoUrl = `mailto:${SUPPORT_EMAIL}?subject=${emailSubject}&body=${emailBody}`;
    window.location.href = mailtoUrl;

    showToast({
      type: 'success',
      title: 'Email Draft Created',
      message: `Your default email client was opened to ${SUPPORT_EMAIL}. Thank you for your feedback!`,
    });

    // Reset message
    setFormData((prev) => ({ ...prev, subject: '', message: '' }));
    setIsSubmitting(false);
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-[calc(100vh-4rem)] bg-[#0d0f12] text-surface-100 font-['Montserrat',sans-serif]">
      {/* Sidebar */}
      <UserSidebar />

      {/* Main Content */}
      <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 overflow-y-auto custom-scrollbar">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-md">
                <LifeBuoy className="w-5 h-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold uppercase tracking-wider text-white">
                Support & Feedback
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-surface-400">
              Clear your doubts with FAQs, troubleshoot call issues, or contact the developer directly.
            </p>
          </div>

          {/* Quick Direct Email Pill */}
          <div className="flex items-center gap-2 bg-[#141722] border border-white/10 px-3.5 py-2 rounded-2xl shadow-sm self-start sm:self-auto">
            <Mail className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="text-left">
              <span className="text-[10px] uppercase font-bold text-surface-400 block tracking-wider">
                Direct Contact
              </span>
              <span className="text-xs font-mono font-bold text-white">{SUPPORT_EMAIL}</span>
            </div>
            <button
              type="button"
              onClick={handleCopyEmail}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-surface-300 hover:text-white transition-colors cursor-pointer ml-1"
              title="Copy developer email"
            >
              {isCopied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Two-Column Responsive Grid: FAQ on Left, Direct Feedback Form on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: Frequently Asked Questions (FAQ) (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-blue-400" />
                  <span>Frequently Asked Questions</span>
                </h2>
                <span className="text-xs text-surface-400 font-mono">
                  {filteredFaqs.length} {filteredFaqs.length === 1 ? 'Answer' : 'Answers'}
                </span>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search questions (e.g. lighting, accuracy, mirror, voice)..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#141720] border border-white/10 text-xs text-white placeholder:text-surface-500 outline-none focus:border-blue-500 transition-colors shadow-inner"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-surface-400 hover:text-white"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { id: 'all', label: 'All Doubts' },
                  { id: 'ai', label: 'Sign AI & Accuracy' },
                  { id: 'calls', label: 'Video Calls' },
                  { id: 'voice', label: 'Voice & TTS' },
                  { id: 'privacy', label: 'Privacy' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
                      selectedCategory === cat.id
                        ? 'bg-blue-600 border-blue-500 text-white shadow-sm'
                        : 'bg-[#141720] border-white/5 text-surface-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Accordion List */}
            <div className="space-y-3">
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((faq) => {
                  const isOpen = expandedFaqId === faq.id;
                  return (
                    <div
                      key={faq.id}
                      className="bg-[#141720] border border-white/10 rounded-2xl overflow-hidden shadow-md transition-all hover:border-white/20"
                    >
                      <button
                        type="button"
                        onClick={() => toggleFaq(faq.id)}
                        className="w-full px-4 sm:px-5 py-3.5 text-left flex items-center justify-between gap-3 cursor-pointer group"
                      >
                        <span className="text-xs sm:text-sm font-bold text-white group-hover:text-blue-300 transition-colors">
                          {faq.question}
                        </span>
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center bg-white/5 text-surface-400 group-hover:text-white shrink-0 transition-transform ${
                            isOpen ? 'rotate-180 bg-blue-600/30 text-blue-300' : ''
                          }`}
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </div>
                      </button>

                      {isOpen && (
                        <div className="px-4 sm:px-5 pb-4 pt-1 text-xs text-surface-300 leading-relaxed border-t border-white/5 bg-[#0e1017]">
                          <p className="mt-1">{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center bg-[#141720] border border-white/10 rounded-2xl text-surface-400 space-y-2">
                  <HelpCircle className="w-8 h-8 mx-auto text-surface-500" />
                  <p className="text-xs font-semibold">No questions matched your search "{searchQuery}"</p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                    }}
                    className="text-xs text-blue-400 hover:underline"
                  >
                    Reset filters
                  </button>
                </div>
              )}
            </div>

            {/* Quick Tips Box */}
            <div className="bg-gradient-to-r from-blue-950/40 to-indigo-950/40 border border-blue-500/20 rounded-2xl p-4 sm:p-5 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <span className="font-bold text-white block">Need Live Help During a Call?</span>
                <p className="text-surface-300 leading-relaxed">
                  You can toggle subtitles with Voice ON to have signs read aloud automatically, or use the in-call text chat drawer to communicate instantly with all call participants.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT: Send Feedback Form (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#141722] border border-white/15 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5">
              <div className="border-b border-white/10 pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <MessageSquare className="w-5 h-5 text-amber-400" />
                  <h2 className="text-base sm:text-lg font-bold text-white">Send Feedback & Report Issues</h2>
                </div>
                <p className="text-xs text-surface-400">
                  Submissions are directly forwarded to developer email{' '}
                  <span className="text-amber-300 font-mono font-semibold">{SUPPORT_EMAIL}</span>.
                </p>
              </div>

              <form onSubmit={handleSubmitFeedback} className="space-y-4">
                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-surface-300 block">
                    Your Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Alex Johnson"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#0e1017] border border-white/10 text-xs text-white placeholder:text-surface-600 outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-surface-300 block">
                    Your Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. alex@example.com"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#0e1017] border border-white/10 text-xs text-white placeholder:text-surface-600 outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Category Selection */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-surface-300 block">
                    Feedback Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0e1017] border border-white/10 text-xs text-white outline-none focus:border-amber-500 transition-colors cursor-pointer"
                  >
                    <option value="General Feedback">General Feedback & Impressions</option>
                    <option value="Sign Detection Suggestion">Sign Detection Accuracy / New Signs</option>
                    <option value="Video Call Issue">Video Call & WebRTC Audio/Video</option>
                    <option value="Bug Report">Bug Report</option>
                    <option value="Feature Request">Feature Request</option>
                    <option value="Direct Support Request">Direct Developer Support</option>
                  </select>
                </div>

                {/* Subject */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-surface-300 block">
                    Subject
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Short summary of your question or feedback..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0e1017] border border-white/10 text-xs text-white placeholder:text-surface-600 outline-none focus:border-amber-500 transition-colors"
                  />
                </div>

                {/* Message */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-surface-300">
                      Detailed Message
                    </label>
                    <span className="text-[10px] text-surface-500">{formData.message.length} chars</span>
                  </div>
                  <textarea
                    rows={5}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Describe your doubt, experience, or issue in detail. We review all messages sent to rashidkp2004@gmail.com..."
                    className="w-full p-3.5 rounded-xl bg-[#0e1017] border border-white/10 text-xs text-white placeholder:text-surface-600 outline-none focus:border-amber-500 transition-colors resize-none leading-relaxed"
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-950/40 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Feedback to {SUPPORT_EMAIL}</span>
                  </button>
                  <p className="text-[10px] text-surface-400 text-center mt-2">
                    Clicking opens your email app with a pre-filled draft to{' '}
                    <span className="font-mono text-amber-300 font-semibold">{SUPPORT_EMAIL}</span>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
