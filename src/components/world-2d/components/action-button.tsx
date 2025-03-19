interface ActionButtonProps {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}

export const ActionButton = ({
  onClick,
  disabled,
  children
}: ActionButtonProps) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-4 py-1.5 bg-[#4a9eff] text-white border-none rounded cursor-pointer text-sm transition-colors hover:bg-[#3a8eef] disabled:opacity-50"
    >
      {children}
    </button>
  );
};
