interface CheckboxControlProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const CheckboxControl = ({
  label,
  checked,
  onChange
}: CheckboxControlProps) => {
  return (
    <label className="flex items-center gap-2 text-white text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        className="w-4 h-4 accent-[#4a9eff]"
      />
      {label}
    </label>
  );
};
