interface ActionButtonProps {
  children: React.ReactNode;
  disabled?: boolean;
  onClick: () => void;
}

export const ActionButton = ({
  children,
  disabled,
  onClick
}: ActionButtonProps) => {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      style={{
        background: '#4a9eff',
        border: 'none',
        borderRadius: '0.25rem',
        color: 'white',
        cursor: disabled ? 'default' : 'pointer',
        fontSize: '0.875rem',
        opacity: disabled ? 0.5 : 1,
        padding: '0.375rem 1rem'
      }}
    >
      {children}
    </button>
  );
};
