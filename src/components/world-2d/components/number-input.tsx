interface NumberInputProps {
  label?: string;
  min?: number;
  onChange: (value: number) => void;
  placeholder?: string;
  value: number;
}

export const NumberInput = ({
  label,
  min,
  onChange,
  placeholder,
  value
}: NumberInputProps) => {
  return (
    <div className="flex items-center gap-2">
      {label && <span className="text-white text-sm">{label}:</span>}
      <input
        className="p-1.5 bg-[#3d3d3d] text-white border border-[#4d4d4d] rounded text-sm w-[100px]"
        min={min}
        onChange={e => onChange(Number.parseInt(e.target.value, 10) || 0)}
        placeholder={placeholder}
        type="number"
        value={value}
      />
    </div>
  );
};
