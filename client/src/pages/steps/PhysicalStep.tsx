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
    <div className="space-y-6">
      <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-4">
        Athlete Profile
      </h2>
      {inputs.map((input) => (
        <div key={input.field}>
          <label className="block text-xs font-bold uppercase tracking-widest text-white/50 mb-2">
            {input.label}
          </label>
          <input
            type={input.type}
            placeholder={input.placeholder}
            value={data[input.field as keyof typeof data]}
            onChange={(e) =>
              updateData("physical", input.field, e.target.value)
            }
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>
      ))}
      <p className="text-[10px] text-white/30 italic">
        *Data is used exclusively by the recommendation engine to determine your
        course tier.
      </p>
    </div>
  );
}
