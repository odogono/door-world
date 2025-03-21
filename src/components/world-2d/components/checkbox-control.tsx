interface CheckboxControlProps {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}

export const CheckboxControl = ({
  checked,
  label,
  onChange
}: CheckboxControlProps) => {
  return (
    <label className="flex items-center gap-2 text-white text-sm">
      <input
        checked={checked}
        className="w-4 h-4 accent-[#4a9eff]"
        onChange={e => onChange(e.target.checked)}
        type="checkbox"
      />
      {label}
    </label>
  );
};
