import { useState } from "react";
import api from "../../services/api"; // Your Axios instance
import toast from "react-hot-toast";

// Import our Step Components (We will build these next)
import MobilityStep from "../../pages/steps/MobilityStep";
import PowerStep from "../../pages/steps/PowerStep";
import SprintStep from "../../pages/steps/SprintStep";
import StrengthStep from "../../pages/steps/StrengthStep";

export default function AssessmentWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // The Master State Object
  const [formData, setFormData] = useState({
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
      // Hit the endpoint we just created in the backend!
      await api.post("/assessments/submit", formData);
      toast.success("Assessment Submitted Successfully!");

      // Force a reload or navigate to the Dashboard so the AuthContext
      // sees the new "UNDER_REVIEW" status and locks the app.
      window.location.href = "/athlete";
    } catch {
      toast.error("Failed to submit. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F14] text-white flex flex-col pt-12 md:pt-24 px-4 pb-24">
      <div className="max-w-xl mx-auto w-full">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-amber-500 mb-3">
            <span>Phase {currentStep} of 4</span>
            <span>{currentStep * 25}% Complete</span>
          </div>
          <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 transition-all duration-500 ease-out"
              style={{ width: `${currentStep * 25}%` }}
            />
          </div>
        </div>

        {/* Dynamic Step Rendering */}
        <div className="bg-white/5 border border-white/10 p-6 md:p-8 rounded-3xl shadow-2xl backdrop-blur-xl">
          {currentStep === 1 && (
            <MobilityStep data={formData.mobility} updateData={updateData} />
          )}
          {currentStep === 2 && (
            <PowerStep data={formData.power} updateData={updateData} />
          )}
          {currentStep === 3 && (
            <SprintStep data={formData.sprinting} updateData={updateData} />
          )}
          {currentStep === 4 && (
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

          {currentStep < 4 ? (
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
              {isSubmitting ? "Submitting..." : "Submit to Coach"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
