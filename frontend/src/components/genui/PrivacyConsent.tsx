import type { PrivacyConsentBlock } from "./types";
import { useState } from "react";
import { 
  Shield, 
  CheckCircle, 
  XCircle,
  Info,
  FileText,
  Lock,
  Eye
} from "lucide-react";

interface Props {
  block: PrivacyConsentBlock;
}

export function PrivacyConsent({ block: _block }: Props) {
  const [consentGiven, setConsentGiven] = useState(false);
  const [showPolicy, setShowPolicy] = useState(false);

  const handleConsent = (agree: boolean) => {
    setConsentGiven(agree);
    if (agree) {
      console.log("Consent given at:", new Date().toISOString());
    }
  };

  return (
    <div className="rounded-xl border border-sand dark:border-dark-border bg-white dark:bg-dark-surface p-4 shadow-sm transition-colors duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-thunder dark:text-dark-text flex items-center gap-2">
          <Shield className="w-5 h-5 text-marigold dark:text-dark-accent" />
          Privacy and Consent
        </h3>
        <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          NDPA 2023 Compliant
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
        {[
          { label: "Art. 17", text: "Explicit Consent", icon: <FileText className="w-3 h-3" /> },
          { label: "Art. 36–38", text: "Data Subject Rights", icon: <Eye className="w-3 h-3" /> },
          { label: "Art. 29", text: "CIA Security", icon: <Lock className="w-3 h-3" /> },
          { label: "Art. 2", text: "Privacy by Design", icon: <Shield className="w-3 h-3" /> },
        ].map((item) => (
          <div key={item.label} className="bg-cream dark:bg-dark-bg2 p-2 rounded-lg text-center">
            <div className="text-xs font-bold text-marigold dark:text-dark-accent">{item.label}</div>
            <div className="text-[10px] text-dallas dark:text-dark-text2 flex items-center justify-center gap-1">
              {item.icon} {item.text}
            </div>
          </div>
        ))}
      </div>

      <div className={`p-3 rounded-lg mb-4 ${
        consentGiven 
          ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
          : 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-thunder dark:text-dark-text">
              {consentGiven ? 'Consent Given' : 'Consent Required'}
            </p>
            <p className="text-xs text-dallas dark:text-dark-text2">
              {consentGiven 
                ? 'You have agreed to our data processing terms.'
                : 'Please review and accept our privacy policy to continue.'}
            </p>
          </div>
          {consentGiven && (
            <span className="text-xs text-green-600 dark:text-green-400">
              {new Date().toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      <div className="mb-4">
        <button
          onClick={() => setShowPolicy(!showPolicy)}
          className="text-sm text-marigold dark:text-dark-accent hover:underline flex items-center gap-1"
        >
          <FileText className="w-4 h-4" />
          {showPolicy ? 'Hide Privacy Policy' : 'Read Privacy Policy'}
        </button>

        {showPolicy && (
          <div className="mt-2 p-3 bg-cream dark:bg-dark-bg2 rounded-lg border border-sand dark:border-dark-border max-h-48 overflow-y-auto text-xs text-dallas dark:text-dark-text2 space-y-2">
            <p><strong className="text-thunder dark:text-dark-text">Nigeria Data Protection Act (NDPA) 2023</strong></p>
            <p>AgriConnect Nigeria collects and processes your data in accordance with the NDPA 2023 and the General Application and Implementation Directive (GAID) 2025.</p>
            
            <p><strong className="text-thunder dark:text-dark-text">1. Lawful Basis for Processing (Art. 17)</strong></p>
            <p>All data processing is based on explicit user consent or vital interest. You have the right to withdraw consent at any time.</p>
            
            <p><strong className="text-thunder dark:text-dark-text">2. Data Subject Rights (Art. 36–38)</strong></p>
            <p>You have the right to access, rectify, and erase your personal data. Requests can be made via SMS or voice call.</p>
            
            <p><strong className="text-thunder dark:text-dark-text">3. Security Measures (Art. 29)</strong></p>
            <p>We implement Confidentiality, Integrity, and Availability (CIA) principles to protect your data.</p>
            
            <p><strong className="text-thunder dark:text-dark-text">4. Privacy by Design (Art. 2)</strong></p>
            <p>Technical and organizational measures are integrated from the initial development phase.</p>
            
            <p className="text-copper dark:text-dark-text3 text-[10px]">Last updated: June 2026</p>
          </div>
        )}
      </div>

      {!consentGiven && (
        <div className="flex gap-3">
          <button
            onClick={() => handleConsent(true)}
            className="flex-1 py-2.5 px-4 bg-marigold dark:bg-dark-accent hover:bg-marigold/80 dark:hover:bg-dark-accent/80 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            I Agree
          </button>
          <button
            onClick={() => handleConsent(false)}
            className="flex-1 py-2.5 px-4 bg-cream dark:bg-dark-bg2 hover:bg-sand/20 dark:hover:bg-dark-bg3 text-dallas dark:text-dark-text2 rounded-lg text-sm font-medium transition-colors border border-sand dark:border-dark-border flex items-center justify-center gap-2"
          >
            <XCircle className="w-4 h-4" />
            Decline
          </button>
        </div>
      )}

      {consentGiven && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setConsentGiven(false)}
            className="px-4 py-2 text-xs text-dallas dark:text-dark-text2 hover:text-red-500 transition-colors border border-sand dark:border-dark-border rounded-lg"
          >
            Withdraw Consent
          </button>
          <button
            className="px-4 py-2 text-xs text-dallas dark:text-dark-text2 hover:text-marigold transition-colors border border-sand dark:border-dark-border rounded-lg flex items-center gap-1"
          >
            <Eye className="w-3 h-3" />
            Request Data Access
          </button>
          <button
            className="px-4 py-2 text-xs text-dallas dark:text-dark-text2 hover:text-red-500 transition-colors border border-sand dark:border-dark-border rounded-lg flex items-center gap-1"
          >
            <XCircle className="w-3 h-3" />
            Request Data Erasure
          </button>
        </div>
      )}

      <div className="mt-4 flex items-center gap-2 text-[10px] text-dallas dark:text-dark-text2 bg-cream dark:bg-dark-bg2 p-2 rounded">
        <Info className="w-3 h-3 text-marigold dark:text-dark-accent" />
        <span>NDPA 2023 Compliant · Data processed with explicit consent · Privacy by design integrated</span>
      </div>
    </div>
  );
}