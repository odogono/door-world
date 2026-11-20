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
    <label
      style={{
        alignItems: 'center',
        color: 'white',
        display: 'flex',
        fontSize: '0.875rem',
        gap: '0.5rem'
      }}
    >
      <input
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        style={{ accentColor: '#4a9eff', height: '1rem', width: '1rem' }}
        type="checkbox"
      />
      {label}
    </label>
  );
};
