import { fieldStyle } from './field-style';

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
    <div style={{ alignItems: 'center', display: 'flex', gap: '0.5rem' }}>
      {label && (
        <span style={{ color: 'white', fontSize: '0.875rem' }}>{label}:</span>
      )}
      <input
        min={min}
        onChange={e => onChange(Number.parseInt(e.target.value, 10) || 0)}
        placeholder={placeholder}
        style={{ ...fieldStyle, width: '100px' }}
        type="number"
        value={value}
      />
    </div>
  );
};
