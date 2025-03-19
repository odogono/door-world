interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  label?: string;
  min?: number;
}

export const NumberInput = ({
  value,
  onChange,
  placeholder,
  label,
  min
}: NumberInputProps) => {
  return (
    <div className="flex items-center gap-2">
      {label && <span className="text-white text-sm">{label}:</span>}
      <input
        type="number"
        value={value}
        onChange={e => onChange(parseInt(e.target.value, 10) || 0)}
        placeholder={placeholder}
        min={min}
        className="p-1.5 bg-[#3d3d3d] text-white border border-[#4d4d4d] rounded text-sm w-[100px]"
      />
    </div>
  );
};
