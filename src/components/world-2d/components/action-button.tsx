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
      className="px-4 py-1.5 bg-[#4a9eff] text-white border-none rounded cursor-pointer text-sm transition-colors hover:bg-[#3a8eef] disabled:opacity-50"
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
