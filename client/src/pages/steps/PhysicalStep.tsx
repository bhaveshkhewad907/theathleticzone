interface PhysicalStepProps {
  data: {
    age: string;
    heightCm: string;
    bodyweightKg: string;
    trainingAgeYears: string;
  };
  updateData: (category: "physical", field: string, value: string) => void;
}

export default function PhysicalStep({ data, updateData }: PhysicalStepProps) {
  const inputs = [
    {
      label: "Age (Years)",
      field: "age",
      type: "number",
      placeholder: "e.g. 21",
    },
    {
      label: "Height (cm)",
      field: "heightCm",
      type: "number",
      placeholder: "e.g. 180",
    },
    {
      label: "Bodyweight (kg)",
      field: "bodyweightKg",
      type: "number",
      placeholder: "e.g. 75",
    },
    {
      label: "Training Age (Years)",
      field: "trainingAgeYears",
      type: "number",
      placeholder: "e.g. 3",
    },
  ];

  return (
    <div className="animate-fade-up space-y-6 relative">
      <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-6">
        Athlete Profile
      </h2>
      {inputs.map((input) => (
        <div key={input.field}>
          <label className="block text-xs font-bold uppercase tracking-widest text-white/70 mb-2">
            {input.label}
          </label>
          <input
            type={input.type}
            placeholder={input.placeholder}
            value={data[input.field as keyof typeof data]}
            onChange={(e) =>
              updateData("physical", input.field, e.target.value)
            }
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-white text-lg font-bold placeholder:text-white/20 focus:outline-none focus:border-amber-500 transition-all shadow-inner"
          />
        </div>
      ))}
      <p className="text-[10px] text-white/40 italic font-bold tracking-wide mt-4">
        *Data is used exclusively by the recommendation engine to determine your
        course tier.
      </p>
    </div>
  );
}
