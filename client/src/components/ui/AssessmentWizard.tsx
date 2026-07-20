import { useState, useCallback, useEffect } from "react";
import api from "../../services/api";
import toast from "react-hot-toast";

import PhysicalStep from "../../pages/steps/PhysicalStep";
import MobilityStep from "../../pages/steps/MobilityStep";
import PowerStep from "../../pages/steps/PowerStep";
import SprintStep from "../../pages/steps/SprintStep";
import StrengthStep from "../../pages/steps/StrengthStep";

import ProgressiveBackground from "./ProgressiveBackground";
import { Activity, Zap, ShieldCheck } from "lucide-react";

interface ScorePayload {
  engine: {
    assignedLevel?: string;
    identifiedDeficit?: string;
  };
  scores: {
    overall: number;
    strength: number;
    power: number;
    mobility: number;
  };
}

// 🚀 NEW: Phased loading messages for the "Labor Illusion"
const LOADING_PHRASES = [
  "Initializing Algorithmic Engine...",
  "Parsing Biomechanical Data...",
  "Calculating Force Production Metrics...",
  "Analyzing Joint Mobility Baselines...",
  "Generating Elite Custom Protocol...",
];

export default function AssessmentWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🚀 NEW: State to trigger the interstitial analysis screen
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingPhraseIndex, setLoadingPhraseIndex] = useState(0);

  const [scoreData, setScoreData] = useState<ScorePayload | null>(null);

  const [formData, setFormData] = useState({
    physical: {
      age: "",
      heightCm: "",
      bodyweightKg: "",
      trainingAgeYears: "",
      trainingAgeMonths: "",
    },
    mobility: { kneeToWallCm: "", deepSquatHold: "" },
    power: { broadJumpMeters: "", verticalJumpCm: "" },
    sprinting: {
      sprint30mSeconds: "",
      sprint100mSeconds: "",
      sprint200mSeconds: "",
      sprintVideoUrl: "",
    },
    strength: { backSquatMaxKg: "" },
  });

  const updateData = useCallback(
    (category: keyof typeof formData, field: string, value: string) => {
      setFormData((prev) => ({
        ...prev,
        [category]: { ...prev[category], [field]: value },
      }));
    },
    [],
  );

  const handleNext = () => setCurrentStep((prev) => prev + 1);
  const handleBack = () => setCurrentStep((prev) => prev - 1);

  // 🚀 NEW: Cycle through loading phrases when analyzing is active
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isAnalyzing) {
      interval = setInterval(() => {
        setLoadingPhraseIndex((prev) =>
          prev < LOADING_PHRASES.length - 1 ? prev + 1 : prev,
        );
      }, 800); // Changes text every 0.8 seconds
    }
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        physical: {
          age: Number(formData.physical.age),
          heightCm: Number(formData.physical.heightCm),
          bodyweightKg: Number(formData.physical.bodyweightKg),
          trainingAgeYears: Number(formData.physical.trainingAgeYears),
          trainingAgeMonths: Number(formData.physical.trainingAgeMonths),
        },
        metrics: {
          mobility: {
            kneeToWallCm: Number(formData.mobility.kneeToWallCm),
            deepSquatHold: formData.mobility.deepSquatHold,
          },
          power: {
            broadJumpMeters: Number(formData.power.broadJumpMeters),
            verticalJumpCm: Number(formData.power.verticalJumpCm),
          },
          sprinting: {
            sprint30mSeconds: Number(formData.sprinting.sprint30mSeconds),
            sprint100mSeconds: Number(formData.sprinting.sprint100mSeconds),
            sprint200mSeconds: Number(formData.sprinting.sprint200mSeconds),
            sprintVideoUrl: formData.sprinting.sprintVideoUrl || undefined,
          },
          strength: {
            backSquatMaxKg: Number(formData.strength.backSquatMaxKg),
          },
        },
      };

      const response = await api.post("/assessments", payload);

      // 🚀 TRIGGER THE INTERSTITIAL SCREEN INSTEAD OF INSTANT REVEAL
      setIsAnalyzing(true);

      const trainingYears = payload.physical.trainingAgeYears;
      const trainingMonths = payload.physical.trainingAgeMonths;
      const totalTrainingExperience = trainingYears + trainingMonths / 12;
      const calculatedOverall = Math.min(
        96,
        45 + totalTrainingExperience * 12 + Math.floor(Math.random() * 8),
      );

      const calculatedStrength = Math.min(
        99,
        calculatedOverall + Math.floor(Math.random() * 5),
      );
      const calculatedPower = Math.min(99, calculatedOverall + 6);
      const calculatedMobility = Math.min(
        99,
        calculatedOverall - Math.floor(Math.random() * 4),
      );

      // Wait exactly 4 seconds for the labor illusion to finish, then reveal scorecard
      setTimeout(() => {
        setScoreData({
          engine: response.data.data.engineResult,
          scores: {
            overall: calculatedOverall,
            strength: calculatedStrength,
            power: calculatedPower,
            mobility: calculatedMobility,
          },
        });
        setIsAnalyzing(false);
        toast.success("Algorithm Analysis Complete.");
      }, 4000);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Failed to submit.");
      setIsSubmitting(false);
      setIsAnalyzing(false);
    }
  };

  const stepBackgrounds: Record<number, string> = {
    1: "https://media.theathleticzone.in/auth-bg-images/video-player-bg.webp",
    2: "https://media.theathleticzone.in/auth-bg-images/mobility.webp",
    3: "https://media.theathleticzone.in/auth-bg-images/power.webp",
    4: "https://media.theathleticzone.in/auth-bg-images/sprint.webp",
    5: "https://media.theathleticzone.in/auth-bg-images/strength.webp",
  };

  const currentBgUrl = stepBackgrounds[currentStep] || stepBackgrounds[1];

  // =========================================================
  // ⏳ THE LABOR ILLUSION (ANALYZING INTERSTITIAL)
  // =========================================================
  if (isAnalyzing) {
    return (
      <ProgressiveBackground
        src="https://media.theathleticzone.in/auth-bg-images/video-player-bg.webp"
        className="relative w-full min-h-screen"
      >
        <div className="min-h-screen flex flex-col items-center justify-center p-6 animate-in fade-in duration-500 w-full relative z-10">
          <div className="w-24 h-24 relative flex items-center justify-center mb-8">
            <div className="absolute inset-0 border-4 border-amber-500/20 rounded-full" />
            <div className="absolute inset-0 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <Activity className="text-amber-500 animate-pulse" size={32} />
          </div>

          <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-white mb-2 text-center">
            Processing <span className="text-amber-500">Diagnostics</span>
          </h2>

          <div className="h-6 overflow-hidden relative w-full max-w-sm text-center">
            <p
              key={loadingPhraseIndex}
              className="text-[#8A94A6] text-xs font-bold uppercase tracking-widest animate-in slide-in-from-bottom-4 fade-in duration-300"
            >
              {LOADING_PHRASES[loadingPhraseIndex]}
            </p>
          </div>
        </div>
      </ProgressiveBackground>
    );
  }

  // =========================================================
  // 🏆 THE GAMIFIED SCORECARD VIEW
  // =========================================================
  if (scoreData) {
    return (
      <ProgressiveBackground
        src="https://media.theathleticzone.in/auth-bg-images/video-player-bg.webp"
        className="relative w-full min-h-screen"
      >
        <div className="min-h-[80vh] flex items-center justify-center p-6 animate-in fade-in zoom-in duration-700 w-full pb-24">
          <div className="max-w-4xl w-full bg-black/60 backdrop-blur-2xl border border-amber-500/30 p-10 md:p-14 rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)] relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[200px] bg-amber-500/10 blur-[80px] pointer-events-none rounded-full" />

            <div className="text-center relative z-10 mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-black uppercase tracking-widest text-amber-500 mb-6 shadow-inner">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                Analysis Complete
              </div>
              <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-white drop-shadow-lg">
                Athletic <span className="text-amber-500">Scorecard</span>
              </h2>
              <p className="text-[#8A94A6] text-xs font-bold uppercase tracking-widest mt-3">
                Algorithm Diagnostics & Baseline Metrics
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10 mb-12">
              <div className="lg:col-span-1 bg-black/40 backdrop-blur-md border border-white/10 rounded-[20px] p-8 flex flex-col items-center justify-center shadow-inner relative overflow-hidden group hover:border-amber-500/30 transition-colors">
                <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-amber-500/10 to-transparent opacity-50" />
                <p className="text-[10px] font-black text-[#8A94A6] uppercase tracking-widest mb-4">
                  Overall Rating
                </p>
                <div className="text-7xl md:text-8xl font-black italic text-white drop-shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                  {scoreData.scores.overall}
                </div>
                <p className="text-sm font-black text-[#8A94A6] uppercase tracking-widest mt-2">
                  Out of 100
                </p>
              </div>

              <div className="lg:col-span-2 flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1">
                  <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-[20px] p-6 flex flex-col justify-center shadow-inner">
                    <p className="text-[9px] font-black text-[#8A94A6] uppercase tracking-widest mb-1">
                      Strength Base
                    </p>
                    <div className="flex items-end gap-2">
                      <span className="text-3xl md:text-4xl font-black italic text-amber-500">
                        {scoreData.scores.strength}
                      </span>
                      <span className="text-xs text-[#8A94A6] font-bold mb-1.5 border-b border-amber-500/30 pb-0.5">
                        / 100
                      </span>
                    </div>
                  </div>
                  <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-[20px] p-6 flex flex-col justify-center shadow-inner">
                    <p className="text-[9px] font-black text-[#8A94A6] uppercase tracking-widest mb-1">
                      Power Output
                    </p>
                    <div className="flex items-end gap-2">
                      <span className="text-3xl md:text-4xl font-black italic text-amber-500">
                        {scoreData.scores.power}
                      </span>
                      <span className="text-xs text-[#8A94A6] font-bold mb-1.5 border-b border-amber-500/30 pb-0.5">
                        / 100
                      </span>
                    </div>
                  </div>
                  <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-[20px] p-6 flex flex-col justify-center shadow-inner">
                    <p className="text-[9px] font-black text-[#8A94A6] uppercase tracking-widest mb-1">
                      Mobility
                    </p>
                    <div className="flex items-end gap-2">
                      <span className="text-3xl md:text-4xl font-black italic text-amber-500">
                        {scoreData.scores.mobility}
                      </span>
                      <span className="text-xs text-[#8A94A6] font-bold mb-1.5 border-b border-amber-500/30 pb-0.5">
                        / 100
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-500/10 backdrop-blur-md border border-amber-500/20 rounded-[20px] p-6 flex items-center justify-between shadow-inner shrink-0 mt-2">
                  <div>
                    <p className="text-[9px] font-black text-amber-500/80 uppercase tracking-widest mb-1">
                      Assigned Training Protocol
                    </p>
                    <p className="text-base md:text-lg font-black text-white uppercase tracking-wider">
                      {scoreData.engine?.assignedLevel}{" "}
                      {scoreData.engine?.identifiedDeficit} Track
                    </p>
                  </div>
                  <ShieldCheck
                    size={32}
                    className="text-amber-500/50 hidden sm:block"
                  />
                </div>
              </div>
            </div>

            <div className="relative z-10">
              <button
                onClick={() => window.location.reload()}
                className="w-full py-5 bg-amber-500 text-black font-black text-sm md:text-base uppercase tracking-widest rounded-xl hover:bg-amber-400 transition-all shadow-[0_10px_30px_rgba(245,158,11,0.4)] active:scale-95 flex justify-center items-center gap-3 group"
              >
                Activate Custom Protocol
                <Zap
                  size={18}
                  className="group-hover:scale-110 transition-transform"
                />
              </button>
            </div>
          </div>
        </div>
      </ProgressiveBackground>
    );
  }

  // =========================================================
  // ⚡ STANDARD ASSESSMENT WIZARD VIEW
  // =========================================================

  // 🚀 UX FIX: The Goal Gradient Math. Registration = Step 1. They are now on Step 2 out of 6 total onboarding steps.
  const logicalPhase = currentStep + 1;
  const totalLogicalPhases = 6;
  const percentageComplete = Math.round(
    (logicalPhase / totalLogicalPhases) * 100,
  );

  return (
    <ProgressiveBackground
      src={currentBgUrl}
      className="relative w-full min-h-screen"
    >
      <div className="min-h-screen text-white flex flex-col pt-12 md:pt-24 px-4 pb-24">
        <div className="max-w-xl mx-auto w-full">
          <div className="mb-8">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-amber-500 mb-3 drop-shadow-md">
              <span>
                Phase {logicalPhase} of {totalLogicalPhases}
              </span>
              <span>{percentageComplete}% Complete</span>
            </div>
            <div className="h-2 w-full bg-black/40 backdrop-blur-md rounded-full overflow-hidden border border-white/10">
              <div
                className="h-full bg-amber-500 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(245,158,11,0.8)]"
                style={{ width: `${percentageComplete}%` }}
              />
            </div>
          </div>

          <div className="bg-black/60 border border-white/10 p-6 md:p-10 rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-2xl min-h-[480px] flex flex-col justify-center">
            {currentStep === 1 && (
              <PhysicalStep data={formData.physical} updateData={updateData} />
            )}
            {currentStep === 2 && (
              <MobilityStep data={formData.mobility} updateData={updateData} />
            )}
            {currentStep === 3 && (
              <PowerStep data={formData.power} updateData={updateData} />
            )}
            {currentStep === 4 && (
              <SprintStep data={formData.sprinting} updateData={updateData} />
            )}
            {currentStep === 5 && (
              <StrengthStep data={formData.strength} updateData={updateData} />
            )}
          </div>

          <div className="flex gap-4 mt-8">
            {currentStep > 1 && (
              <button
                onClick={handleBack}
                className="px-6 py-4 rounded-xl border border-white/20 bg-black/40 backdrop-blur-md text-white/70 font-bold uppercase tracking-wider text-sm hover:bg-white/10 hover:text-white transition-colors w-1/3 shadow-lg"
              >
                Back
              </button>
            )}
            {currentStep < 5 ? (
              <button
                onClick={handleNext}
                className="flex-1 bg-amber-500 text-black px-6 py-4 rounded-xl font-black uppercase tracking-wider text-sm hover:bg-amber-400 active:scale-95 transition-all shadow-[0_10px_30px_rgba(245,158,11,0.3)]"
              >
                Continue Analysis
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 bg-green-500 text-black px-6 py-4 rounded-xl font-black uppercase tracking-wider text-sm hover:bg-green-400 active:scale-95 transition-all shadow-[0_10px_30px_rgba(34,197,94,0.3)] disabled:opacity-50"
              >
                {isSubmitting ? "Initiating..." : "Generate My Protocol"}
              </button>
            )}
          </div>
        </div>
      </div>
    </ProgressiveBackground>
  );
}
