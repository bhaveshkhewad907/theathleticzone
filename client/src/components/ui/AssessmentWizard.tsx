import { useState, useEffect } from "react";
import api from "../../services/api";
import toast from "react-hot-toast";

// Import the paywall from the exact same directory smoothly
import ProgramPaywall from "../../pages/assessment/ProgramPaywall";

// Import our Step Components
import PhysicalStep from "../../pages/steps/PhysicalStep";
import MobilityStep from "../../pages/steps/MobilityStep";
import PowerStep from "../../pages/steps/PowerStep";
import SprintStep from "../../pages/steps/SprintStep";
import StrengthStep from "../../pages/steps/StrengthStep";

// Define explicit types to avoid any implicit 'any' compiler flags
interface ApiResponse {
  data?: {
    data?: {
      platformState?: {
        hasPaidEntryFee?: boolean;
      };
    };
  };
}

export default function AssessmentWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Self-contained state machine values to guarantee zero compile errors
  const [hasPaid, setHasPaid] = useState<boolean | null>(null);
  const [loadingPaymentCheck, setLoadingPaymentCheck] = useState(true);

  // Fetch status directly from backend to avoid untyped AuthContext crashes
  useEffect(() => {
    api
      .get("/auth/me")
      .then((res: ApiResponse) => {
        const paidStatus =
          res.data?.data?.platformState?.hasPaidEntryFee || false;
        setHasPaid(paidStatus);
      })
      .catch(() => {
        setHasPaid(false);
      })
      .finally(() => {
        setLoadingPaymentCheck(false);
      });
  }, []);

  // Master State Object
  const [formData, setFormData] = useState({
    physical: { age: "", heightCm: "", bodyweightKg: "", trainingAgeYears: "" },
    mobility: { kneeToWallCm: "", deepSquatHold: "" },
    power: { broadJumpMeters: "", verticalJumpCm: "" },
    sprinting: { sprint30mSeconds: "", sprintVideoUrl: "" },
    strength: { backSquatMaxKg: "" },
  });

  // Helper to update deeply nested state
  const updateData = (
    category: keyof typeof formData,
    field: string,
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [category]: { ...prev[category], [field]: value },
    }));
  };

  const handleNext = () => setCurrentStep((prev) => prev + 1);
  const handleBack = () => setCurrentStep((prev) => prev - 1);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        physical: {
          age: Number(formData.physical.age),
          heightCm: Number(formData.physical.heightCm),
          bodyweightKg: Number(formData.physical.bodyweightKg),
          trainingAgeYears: Number(formData.physical.trainingAgeYears),
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
            sprintVideoUrl: formData.sprinting.sprintVideoUrl || undefined,
          },
          strength: {
            backSquatMaxKg: Number(formData.strength.backSquatMaxKg),
          },
        },
      };

      await api.post("/assessments", payload);

      toast.success("Assessment Processed Successfully!");
      window.location.href = "/athlete";
    } catch (err) {
      const error = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };

      console.error("Submit Error:", error.response?.data || error.message);
      toast.error(
        error.response?.data?.message || "Failed to submit. Check console.",
      );
      setIsSubmitting(false);
    }
  };

  // 1. Initial micro-spinner while determining verification status
  if (loadingPaymentCheck) {
    return (
      <div className="min-h-screen bg-[#0B0F14] flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  // 2. THE INTERCEPTOR: If backend state proves they haven't paid, mount the Paywall Gate
  if (!hasPaid) {
    return <ProgramPaywall onSuccess={() => setHasPaid(true)} />;
  }

  // 3. Otherwise, smoothly step down to open the dynamic evaluation phases
  return (
    <div className="min-h-screen bg-[#0B0F14] text-white flex flex-col pt-12 md:pt-24 px-4 pb-24">
      <div className="max-w-xl mx-auto w-full">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-amber-500 mb-3">
            <span>Phase {currentStep} of 5</span>
            <span>{currentStep * 20}% Complete</span>
          </div>
          <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 transition-all duration-500 ease-out"
              style={{ width: `${currentStep * 20}%` }}
            />
          </div>
        </div>

        {/* Dynamic Step Rendering */}
        <div className="bg-white/5 border border-white/10 p-6 md:p-8 rounded-3xl shadow-2xl backdrop-blur-xl">
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

        {/* Navigation Controls */}
        <div className="flex gap-4 mt-8">
          {currentStep > 1 && (
            <button
              onClick={handleBack}
              className="px-6 py-4 rounded-xl border border-white/20 text-white/70 font-bold uppercase tracking-wider text-sm hover:bg-white/5 w-1/3"
            >
              Back
            </button>
          )}

          {currentStep < 5 ? (
            <button
              onClick={handleNext}
              className="flex-1 bg-amber-500 text-black px-6 py-4 rounded-xl font-black uppercase tracking-wider text-sm hover:bg-amber-400 active:scale-95 transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)]"
            >
              Continue to Phase {currentStep + 1}
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 bg-green-500 text-black px-6 py-4 rounded-xl font-black uppercase tracking-wider text-sm hover:bg-green-400 active:scale-95 transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)] disabled:opacity-50"
            >
              {isSubmitting ? "Calculating..." : "Calculate Assessment"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
