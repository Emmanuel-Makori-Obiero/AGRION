import { useState } from "react";
import { 
  Phone, 
  Mic, 
  MessageSquare, 
  Brain, 
  Camera, 
  Shield,
  Menu,
  X,
  Sun,
  Moon,
  ArrowRight,
  Languages,
  Sprout,
  FileText,
  ExternalLink,
  ClipboardCheck,
  LifeBuoy,
  Edit,
  Lock,
  UserCog
} from "lucide-react";

interface LandingProps {
  onNavigate?: (page: any) => void;
  darkMode?: boolean;
  toggleDarkMode?: () => void;
}

export function LandingPage({ onNavigate, darkMode, toggleDarkMode }: LandingProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNDPAModal, setShowNDPAModal] = useState(false);

  const toggleTheme = () => {
    if (toggleDarkMode) {
      toggleDarkMode();
    }
    document.documentElement.classList.toggle('dark');
  };

  const channels = [
    { 
      icon: <Phone className="w-6 h-6 text-marigold dark:text-dark-accent" />,
      title: "USSD Access",
      description: "No internet needed. Works on any basic phone with *384#."
    },
    { 
      icon: <Mic className="w-6 h-6 text-marigold dark:text-dark-accent" />,
      title: "Voice Intel",
      description: "Toll-free IVR with local dialect support. Press 5 for voice."
    },
    { 
      icon: <MessageSquare className="w-6 h-6 text-marigold dark:text-dark-accent" />,
      title: "SMS Alerts",
      description: "Receive and reply to advisory messages. 160 characters."
    },
  ];

  const insights = [
    {
      icon: <Brain className="w-8 h-8 text-marigold dark:text-dark-accent" />,
      title: "AI Insights",
      description: "Personalised crop, soil and market intelligence powered by AI."
    },
    {
      icon: <Camera className="w-8 h-8 text-marigold dark:text-dark-accent" />,
      title: "Computer Vision",
      description: "Snap a leaf — instantly detect pests, diseases and nutrient gaps."
    },
    {
      icon: <Languages className="w-8 h-8 text-marigold dark:text-dark-accent" />,
      title: "Local Languages",
      description: "Hausa, Yoruba, Igbo, Pidgin and English — first-class support."
    },
  ];

  const ndpaContent = [
    {
      icon: <ClipboardCheck className="w-5 h-5 text-marigold dark:text-dark-accent" />,
      title: "Article 17 — Explicit Consent",
      description: "All data processing is based on explicit, informed user consent. Farmers have the right to withdraw consent at any time. Consent is obtained through clear, simple language in USSD, SMS, and web interfaces."
    },
    {
      icon: <LifeBuoy className="w-5 h-5 text-marigold dark:text-dark-accent" />,
      title: "Article 24 — Vital Interest",
      description: "In emergency situations where a farmer's vital interests are at stake (e.g., immediate pest outbreaks), data may be processed without prior consent to protect life and livelihood."
    },
    {
      icon: <Edit className="w-5 h-5 text-marigold dark:text-dark-accent" />,
      title: "Article 36-38 — Data Subject Rights",
      description: "Farmers have the right to access, rectify, and erase their personal data. All requests are processed within 30 days and can be made via SMS, USSD, or voice call in the farmer's preferred language."
    },
    {
      icon: <Lock className="w-5 h-5 text-marigold dark:text-dark-accent" />,
      title: "Article 29 — CIA Security",
      description: "AgriConnect implements Confidentiality, Integrity, and Availability (CIA) principles. All data is encrypted in transit and at rest, with regular security audits and access controls."
    },
    {
      icon: <UserCog className="w-5 h-5 text-marigold dark:text-dark-accent" />,
      title: "Article 2 — Privacy by Design",
      description: "Technical and organizational measures are integrated from the initial development phase. Privacy is not an afterthought — it is built into every layer of the system."
    }
  ];

  return (
    <main className="min-h-screen bg-white dark:bg-dark-bg transition-colors duration-300">
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-dark-bg/95 backdrop-blur-sm border-b border-sand/20 dark:border-dark-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sprout className="w-6 h-6 text-marigold dark:text-dark-accent" />
            <span className="font-bold text-thunder dark:text-dark-text text-xl">
              AgriConnect
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg border border-sand/30 dark:border-dark-border hover:bg-cream dark:hover:bg-dark-bg2 transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="w-5 h-5 text-marigold" /> : <Moon className="w-5 h-5 text-dallas" />}
            </button>

            <div className="hidden md:flex items-center gap-6">
              <a href="#channels" className="text-dallas dark:text-dark-text2 hover:text-marigold dark:hover:text-dark-accent text-sm font-medium transition-colors">
                Channels
              </a>
              <a href="#insights" className="text-dallas dark:text-dark-text2 hover:text-marigold dark:hover:text-dark-accent text-sm font-medium transition-colors">
                AI Insights
              </a>
              <button 
                onClick={() => setShowNDPAModal(true)}
                className="text-dallas dark:text-dark-text2 hover:text-marigold dark:hover:text-dark-accent text-sm font-medium transition-colors"
              >
                NDPA
              </button>
              <button 
                onClick={() => onNavigate?.('ussd')}
                className="px-4 py-2 bg-marigold dark:bg-dark-accent hover:bg-marigold/80 dark:hover:bg-dark-accent/80 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Explore the platform
              </button>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg border border-sand/30 dark:border-dark-border hover:bg-cream dark:hover:bg-dark-bg2 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-sand/20 dark:border-dark-border p-4 space-y-3 bg-white dark:bg-dark-bg">
            <a href="#channels" className="block text-dallas dark:text-dark-text2 hover:text-marigold dark:hover:text-dark-accent text-sm font-medium transition-colors">
              Channels
            </a>
            <a href="#insights" className="block text-dallas dark:text-dark-text2 hover:text-marigold dark:hover:text-dark-accent text-sm font-medium transition-colors">
              AI Insights
            </a>
            <button 
              onClick={() => setShowNDPAModal(true)}
              className="block w-full text-left text-dallas dark:text-dark-text2 hover:text-marigold dark:hover:text-dark-accent text-sm font-medium transition-colors"
            >
              NDPA
            </button>
            <button 
              onClick={() => onNavigate?.('ussd')}
              className="block w-full text-center px-4 py-2 bg-marigold dark:bg-dark-accent hover:bg-marigold/80 dark:hover:bg-dark-accent/80 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Explore the platform
            </button>
          </div>
        )}
      </header>

      {/* NDPA Modal */}
      {showNDPAModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-dark-surface rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 border border-sand dark:border-dark-border shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Shield className="w-8 h-8 text-marigold dark:text-dark-accent" />
                <h2 className="text-2xl font-bold text-thunder dark:text-dark-text">NDPA 2023 Policy</h2>
              </div>
              <button
                onClick={() => setShowNDPAModal(false)}
                className="p-2 rounded-lg hover:bg-cream dark:hover:bg-dark-bg2 transition-colors"
              >
                <X className="w-6 h-6 text-dallas dark:text-dark-text2" />
              </button>
            </div>

            <p className="text-dallas dark:text-dark-text2 mb-6 text-sm leading-relaxed">
              AgriConnect is fully compliant with the Nigeria Data Protection Act (NDPA) 2023 and the General Application and Implementation Directive (GAID) 2025. Below is a summary of our key compliance measures.
            </p>

            <div className="space-y-4">
              {ndpaContent.map((item, index) => (
                <div key={index} className="bg-cream dark:bg-dark-bg2 rounded-xl p-4 border border-sand/30 dark:border-dark-border">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{item.icon}</div>
                    <div>
                      <h3 className="font-semibold text-thunder dark:text-dark-text text-sm">{item.title}</h3>
                      <p className="text-sm text-dallas dark:text-dark-text2 mt-1 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-marigold/10 dark:bg-dark-accent/10 rounded-xl border border-marigold/30 dark:border-dark-accent/30">
              <p className="text-sm text-thunder dark:text-dark-text flex items-center gap-2">
                <UserCog className="w-4 h-4 text-marigold dark:text-dark-accent" />
                <strong>Data Protection Officer:</strong> dpo@agriconnect.ng · Available in Hausa, Yoruba, Igbo, and English
              </p>
              <p className="text-sm text-thunder dark:text-dark-text mt-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-marigold dark:text-dark-accent" />
                <strong>Last updated:</strong> June 2026
              </p>
            </div>

            <button
              onClick={() => setShowNDPAModal(false)}
              className="mt-6 w-full py-3 bg-marigold dark:bg-dark-accent hover:bg-marigold/80 dark:hover:bg-dark-accent/80 text-white rounded-lg font-medium transition-colors"
            >
              I Understand
            </button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-16">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-cream dark:bg-dark-bg2 rounded-full border border-sand/30 dark:border-dark-border mb-4">
            <span className="text-xs text-dallas dark:text-dark-text2 font-medium">Built for every Nigerian farmer</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-thunder dark:text-dark-text leading-tight">
            Tech that meets farmers
            <span className="text-marigold dark:text-dark-accent"> where they are.</span>
          </h1>
          <p className="mt-4 text-dallas dark:text-dark-text2 text-lg leading-relaxed max-w-2xl">
            From USSD on a feature phone to AI vision on a smartphone — AgriConnect delivers timely advice, market access and inclusion in the language you speak.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <button 
              onClick={() => onNavigate?.('ussd')}
              className="px-6 py-3 bg-marigold dark:bg-dark-accent hover:bg-marigold/80 dark:hover:bg-dark-accent/80 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              Explore the platform
              <ArrowRight className="w-4 h-4" />
            </button>
            <button 
              className="px-6 py-3 border border-sand/50 dark:border-dark-border hover:bg-cream dark:hover:bg-dark-bg2 text-thunder dark:text-dark-text rounded-lg font-medium transition-colors"
            >
              Talk to us
            </button>
          </div>
        </div>
      </section>

      {/* Channels Section */}
      <section id="channels" className="max-w-6xl mx-auto px-4 sm:px-6 py-16 border-t border-sand/20 dark:border-dark-border">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-thunder dark:text-dark-text">
            Six channels, <span className="text-marigold dark:text-dark-accent">one farmer-first platform.</span>
          </h2>
          <p className="mt-2 text-dallas dark:text-dark-text2">
            No matter the device, network or language — we meet you on it.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {channels.map((channel, index) => (
            <div key={index} className="bg-white dark:bg-dark-surface rounded-xl p-6 border border-sand/30 dark:border-dark-border hover:border-marigold dark:hover:border-dark-accent transition-all">
              <div className="mb-3">{channel.icon}</div>
              <h3 className="text-lg font-semibold text-thunder dark:text-dark-text">{channel.title}</h3>
              <p className="text-sm text-dallas dark:text-dark-text2 mt-1">{channel.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* AI Insights Section */}
      <section id="insights" className="max-w-6xl mx-auto px-4 sm:px-6 py-16 border-t border-sand/20 dark:border-dark-border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {insights.map((item, index) => (
            <div key={index} className="bg-cream dark:bg-dark-bg2 rounded-xl p-8 border border-sand/30 dark:border-dark-border hover:border-marigold dark:hover:border-dark-accent transition-all text-center">
              <div className="flex justify-center mb-4">{item.icon}</div>
              <h3 className="text-xl font-bold text-thunder dark:text-dark-text">{item.title}</h3>
              <p className="text-sm text-dallas dark:text-dark-text2 mt-2">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* NDPA Section */}
      <section id="ndpa" className="max-w-6xl mx-auto px-4 sm:px-6 py-16 border-t border-sand/20 dark:border-dark-border">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-cream dark:bg-dark-bg2 rounded-full border border-sand/30 dark:border-dark-border mb-4">
              <Shield className="w-4 h-4 text-marigold dark:text-dark-accent" />
              <span className="text-xs text-dallas dark:text-dark-text2 font-medium">NDPA 2023 Compliant</span>
            </div>
            <h2 className="text-3xl font-bold text-thunder dark:text-dark-text">
              Your data, protected by Nigerian law.
            </h2>
            <p className="mt-4 text-dallas dark:text-dark-text2 leading-relaxed">
              AgriConnect is built in alignment with the Nigeria Data Protection Act (NDPA) 2023. Farmers stay in control of their information — always.
            </p>
            <ul className="mt-6 space-y-3">
              <li className="flex items-start gap-3 text-sm text-dallas dark:text-dark-text2">
                <CheckCircle className="w-5 h-5 text-marigold dark:text-dark-accent flex-shrink-0 mt-0.5" />
                Explicit, informed consent for every data point we collect.
              </li>
              <li className="flex items-start gap-3 text-sm text-dallas dark:text-dark-text2">
                <CheckCircle className="w-5 h-5 text-marigold dark:text-dark-accent flex-shrink-0 mt-0.5" />
                Local data residency with audited security controls.
              </li>
              <li className="flex items-start gap-3 text-sm text-dallas dark:text-dark-text2">
                <CheckCircle className="w-5 h-5 text-marigold dark:text-dark-accent flex-shrink-0 mt-0.5" />
                Right to access, correct, port and delete your data on request.
              </li>
              <li className="flex items-start gap-3 text-sm text-dallas dark:text-dark-text2">
                <CheckCircle className="w-5 h-5 text-marigold dark:text-dark-accent flex-shrink-0 mt-0.5" />
                A dedicated Data Protection Officer reachable in your language.
              </li>
            </ul>
            <button 
              onClick={() => setShowNDPAModal(true)}
              className="mt-6 text-marigold dark:text-dark-accent hover:underline text-sm font-medium flex items-center gap-1"
            >
              Read full NDPA policy <ExternalLink className="w-3 h-3" />
            </button>
          </div>
          <div 
            onClick={() => setShowNDPAModal(true)}
            className="bg-cream dark:bg-dark-bg2 rounded-xl p-8 border border-sand/30 dark:border-dark-border cursor-pointer hover:border-marigold dark:hover:border-dark-accent transition-all"
          >
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-8 h-8 text-marigold dark:text-dark-accent" />
              <span className="text-sm font-semibold text-thunder dark:text-dark-text">NDPA 2023 Compliant</span>
            </div>
            <div className="space-y-2 text-sm text-dallas dark:text-dark-text2">
              <p>✓ Explicit, informed consent for every data point we collect.</p>
              <p>✓ Local data residency with audited security controls.</p>
              <p>✓ Right to access, correct, port and delete your data on request.</p>
              <p>✓ A dedicated Data Protection Officer reachable in your language.</p>
            </div>
            <div className="mt-4 text-xs text-marigold dark:text-dark-accent flex items-center gap-1">
              <FileText className="w-3 h-3" />
              Click to read full policy
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-4 sm:px-6 py-8 border-t border-sand/20 dark:border-dark-border text-center text-sm text-dallas dark:text-dark-text2">
        <p className="font-medium text-thunder dark:text-dark-text">AgriConnect Nigeria © 2026</p>
        <div className="mt-2 flex flex-wrap justify-center gap-4 text-xs">
          <button onClick={() => setShowNDPAModal(true)} className="hover:text-marigold dark:hover:text-dark-accent transition-colors">
            Privacy
          </button>
          <button onClick={() => setShowNDPAModal(true)} className="hover:text-marigold dark:hover:text-dark-accent transition-colors">
            Terms
          </button>
          <button onClick={() => setShowNDPAModal(true)} className="hover:text-marigold dark:hover:text-dark-accent transition-colors">
            NDPA Notice
          </button>
          <a href="mailto:hello@agriconnect.ng" className="hover:text-marigold dark:hover:text-dark-accent transition-colors">
            hello@agriconnect.ng
          </a>
        </div>
        <p className="mt-4 text-xs text-copper dark:text-dark-text3">Sandy Serenity Palette · Kenya AI Challenge 2026 · Crop2Cash Brief</p>
      </footer>
    </main>
  );
}

// Helper component for checkmark list items
function CheckCircle({ className }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
}