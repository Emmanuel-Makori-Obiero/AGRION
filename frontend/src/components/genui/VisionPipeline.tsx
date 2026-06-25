import type { VisionPipelineBlock } from "./types";
import { useState, useRef } from "react";
import { 
  Camera, 
  Sparkles,
  CheckCircle,
  Loader2,
  X,
  RefreshCw,
  Upload,
  Image as ImageIcon
} from "lucide-react";

interface Props {
  block: VisionPipelineBlock;
}

export function VisionPipeline({ block }: Props) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [farmerNotes, setFarmerNotes] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStage, setCurrentStage] = useState<number>(-1);
  const [result, setResult] = useState<{
    condition: string;
    confidence: number;
    advisory: string;
    sms: string;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const stages = [
    { id: 0, label: "Stage 1 — Backend capture (MMS received)", icon: "📥" },
    { id: 1, label: "Stage 2 — AI upscaling & denoising", icon: "🔍" },
    { id: 2, label: "Stage 3 — Vision LLM analysis", icon: "🧠" },
    { id: 3, label: "Stage 4 — Dispatching SMS via Africa's Talking", icon: "📱" },
  ];

  const processImageFile = (file: File) => {
    if (file.size > 8 * 1024 * 1024) {
      alert("File is too large. Maximum size is 8MB.");
      return;
    }
    if (!file.type.startsWith('image/')) {
      alert("Please upload an image file (JPG or PNG).");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedImage(event.target?.result as string);
      setResult(null);
      setCurrentStage(-1);
    };
    reader.readAsDataURL(file);
  };

  // Click to upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  // Camera capture
  const handleCameraCapture = () => {
    cameraInputRef.current?.click();
  };

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      processImageFile(file);
    }
  };

  const handleAnalyze = () => {
    if (!selectedImage) return;
    setIsAnalyzing(true);
    setResult(null);
    setCurrentStage(-1);

    const runPipeline = async () => {
      setCurrentStage(0);
      await new Promise(r => setTimeout(r, 600));
      setCurrentStage(1);
      await new Promise(r => setTimeout(r, 800));
      setCurrentStage(2);
      await new Promise(r => setTimeout(r, 1000));
      setCurrentStage(3);
      await new Promise(r => setTimeout(r, 500));

      setResult({
        condition: "Maize Streak Virus",
        confidence: 87,
        advisory: farmerNotes 
          ? `Based on your notes: ${farmerNotes}. Diagnosis: Maize Streak Virus. Remove infected plants. Spray neem extract. Plant resistant variety SAMMAZ-52 next season.`
          : "Remove infected plants. Spray neem extract. Plant resistant variety SAMMAZ-52 next season.",
        sms: `AGRION: Likely Maize Streak Virus. Remove infected plants. Spray neem extract. Plant resistant variety SAMMAZ-52 next season. Reply 1 for voice call.`
      });
      setIsAnalyzing(false);
    };

    runPipeline();
  };

  const handleReset = () => {
    setSelectedImage(null);
    setResult(null);
    setCurrentStage(-1);
    setIsAnalyzing(false);
    setFarmerNotes("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (cameraInputRef.current) {
      cameraInputRef.current.value = "";
    }
    setIsDragging(false);
  };

  return (
    <div className="rounded-xl border border-sand dark:border-dark-border bg-white dark:bg-dark-surface p-4 shadow-sm transition-colors duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-thunder dark:text-dark-text flex items-center gap-2">
          <Camera className="w-5 h-5 text-marigold dark:text-dark-accent" />
          Vision Pipeline · Live
        </h3>
        <span className="text-xs bg-cream dark:bg-dark-bg2 text-dallas dark:text-dark-text2 px-2 py-1 rounded">
          Upload, drag & drop, or capture
        </span>
      </div>

      <p className="text-sm text-dallas dark:text-dark-text2 mb-4">
        Upload, drag & drop, or take a photo of your crop. Run it through Alfred's four-stage pipeline to get a 160-character SMS advisory.
      </p>

      {/* Step 1: Upload */}
      <div className="mb-4">
        <div className="text-xs font-semibold text-dallas dark:text-dark-text2 uppercase tracking-wider mb-2">
          1. Provide a crop photo
        </div>
        <p className="text-xs text-dallas dark:text-dark-text2 mb-2">
          Upload from gallery, drag & drop, or take a photo with your camera.
        </p>
        
        {!selectedImage ? (
          <div
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
              isDragging
                ? 'border-marigold dark:border-dark-accent bg-marigold/10 dark:bg-dark-accent/10 scale-[1.01]'
                : 'border-sand dark:border-dark-border bg-cream dark:bg-dark-bg2 hover:border-marigold dark:hover:border-dark-accent'
            }`}
          >
            <div className="flex flex-col items-center">
              {isDragging ? (
                <>
                  <Upload className="w-12 h-12 text-marigold dark:text-dark-accent mb-2 animate-bounce" />
                  <p className="text-sm font-medium text-marigold dark:text-dark-accent">
                    Drop your image here
                  </p>
                </>
              ) : (
                <>
                  <Camera className="w-12 h-12 text-dallas dark:text-dark-text2 mb-2" />
                  <p className="text-sm font-medium text-thunder dark:text-dark-text">
                    Click to upload or drag & drop
                  </p>
                  <p className="text-xs text-dallas dark:text-dark-text2">
                    JPG or PNG · up to 8 MB
                  </p>
                </>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-marigold dark:bg-dark-accent text-white rounded-lg text-sm font-medium hover:bg-marigold/80 dark:hover:bg-dark-accent/80 transition-colors flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Upload
              </button>
              <button
                onClick={handleCameraCapture}
                className="px-4 py-2 bg-copper dark:bg-dark-text3 text-white rounded-lg text-sm font-medium hover:bg-copper/80 dark:hover:bg-dark-text3/80 transition-colors flex items-center gap-2"
              >
                <Camera className="w-4 h-4" />
                Take Photo
              </button>
            </div>

            {/* Hidden file inputs */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        ) : (
          <div className="relative bg-ussd-bg dark:bg-ussd-bg rounded-lg p-2">
            <img
              src={selectedImage}
              alt="Crop preview"
              className="w-full max-h-48 object-contain rounded"
            />
            <button
              onClick={handleReset}
              className="absolute top-2 right-2 p-1.5 bg-red-500/80 hover:bg-red-500 text-white rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="absolute bottom-2 left-2 flex gap-1">
              <span className="text-[10px] bg-black/60 text-white px-2 py-0.5 rounded flex items-center gap-1">
                <ImageIcon className="w-3 h-3" />
                Image loaded
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Step 2: Pipeline Stages */}
      <div className="mb-4">
        <div className="text-xs font-semibold text-dallas dark:text-dark-text2 uppercase tracking-wider mb-2">
          2. Pipeline stages
        </div>
        <div className="space-y-1.5">
          {stages.map((stage) => (
            <div
              key={stage.id}
              className={`flex items-center gap-2 p-2 rounded-lg transition-all ${
                currentStage >= stage.id
                  ? 'bg-marigold/10 dark:bg-dark-accent/10 border border-marigold/30 dark:border-dark-accent/30'
                  : isAnalyzing && currentStage === stage.id - 1
                  ? 'bg-marigold/5 dark:bg-dark-accent/5 border border-marigold/20 dark:border-dark-accent/20 animate-pulse'
                  : 'bg-cream dark:bg-dark-bg2'
              }`}
            >
              <span className="text-sm">{stage.icon}</span>
              <span className={`text-sm flex-1 ${
                currentStage >= stage.id
                  ? 'text-marigold dark:text-dark-accent'
                  : 'text-dallas dark:text-dark-text2'
              }`}>
                {stage.label}
              </span>
              {currentStage >= stage.id && (
                <CheckCircle className="w-4 h-4 text-marigold dark:text-dark-accent" />
              )}
              {isAnalyzing && currentStage === stage.id - 1 && (
                <Loader2 className="w-4 h-4 text-marigold dark:text-dark-accent animate-spin" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Farmer Notes */}
      <div className="mb-4">
        <div className="text-xs font-semibold text-dallas dark:text-dark-text2 uppercase tracking-wider mb-2">
          Farmer notes (optional)
        </div>
        <textarea
          value={farmerNotes}
          onChange={(e) => setFarmerNotes(e.target.value)}
          placeholder="e.g. Maize, 6 weeks, yellowing on lower leaves"
          className="w-full p-2 rounded-lg border border-sand dark:border-dark-border bg-cream dark:bg-dark-bg2 text-thunder dark:text-dark-text text-sm resize-none focus:outline-none focus:ring-2 focus:ring-marigold dark:focus:ring-dark-accent transition-all"
          rows={2}
          disabled={isAnalyzing}
        />
      </div>

      {/* Step 3: Results */}
      <div className="mb-4">
        <div className="text-xs font-semibold text-dallas dark:text-dark-text2 uppercase tracking-wider mb-2">
          3. SMS delivered to farmer
        </div>
        <p className="text-xs text-dallas dark:text-dark-text2 mb-2">
          Run the pipeline to see the diagnosis and the actual SMS the farmer would receive.
        </p>

        {isAnalyzing && (
          <div className="bg-ussd-bg dark:bg-ussd-bg rounded-lg p-4 text-center">
            <Loader2 className="w-6 h-6 text-marigold dark:text-dark-accent animate-spin mx-auto mb-2" />
            <p className="text-sm text-serria dark:text-dark-accent">Analyzing crop image...</p>
            <p className="text-xs text-ussd-dim">Processing through pipeline stages</p>
          </div>
        )}

        {result && (
          <div className="space-y-3">
            <div className="bg-marigold/10 dark:bg-dark-accent/10 border border-marigold/30 dark:border-dark-accent/30 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-thunder dark:text-dark-text">
                    🧬 {result.condition}
                  </p>
                  <p className="text-xs text-dallas dark:text-dark-text2">
                    Confidence: {result.confidence}%
                  </p>
                </div>
                <CheckCircle className="w-6 h-6 text-marigold dark:text-dark-accent" />
              </div>
              <p className="text-sm text-thunder dark:text-dark-text mt-2">
                {result.advisory}
              </p>
            </div>

            <div className="bg-ussd-bg dark:bg-ussd-bg rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-ussd-dim">📱 SMS Preview</span>
                <span className={`text-xs font-mono ${
                  result.sms.length <= 160 ? 'text-marigold dark:text-dark-accent' : 'text-copper'
                }`}>
                  {result.sms.length}/160 chars
                </span>
              </div>
              <p className="text-sm text-serria dark:text-dark-accent">{result.sms}</p>
            </div>
          </div>
        )}

        {!isAnalyzing && !result && selectedImage && (
          <div className="text-center text-xs text-dallas dark:text-dark-text2 p-4 border border-sand dark:border-dark-border rounded-lg bg-cream dark:bg-dark-bg2">
            Image ready! Click "Run pipeline" to see the diagnosis.
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={handleAnalyze}
          disabled={!selectedImage || isAnalyzing}
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
            !selectedImage || isAnalyzing
              ? 'bg-cream dark:bg-dark-bg2 text-dallas/50 dark:text-dark-text2/50 cursor-not-allowed border border-sand dark:border-dark-border'
              : 'bg-marigold dark:bg-dark-accent hover:bg-marigold/80 dark:hover:bg-dark-accent/80 text-white'
          }`}
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Run pipeline
            </>
          )}
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2.5 rounded-lg text-sm font-medium transition-colors bg-cream dark:bg-dark-bg2 hover:bg-sand/20 dark:hover:bg-dark-bg3 text-dallas dark:text-dark-text2 border border-sand dark:border-dark-border flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Reset
        </button>
      </div>
    </div>
  );
}