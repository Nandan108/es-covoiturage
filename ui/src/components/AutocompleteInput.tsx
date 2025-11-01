// AutocompleteInput.tsx
import { useRef, useState } from "react";

type AutocompleteInputProps<T> = {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  options: T[];
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  renderOption: (opt: T) => React.ReactNode;
  selectOption: (opt: T) => void;
  isLoading?: boolean;
  loadingText?: string;
  loadingNode?: React.ReactNode;
  loadingClassName?: string;
  ref?: React.Ref<HTMLInputElement>;
} & Omit<React.ComponentProps<"input">, "onChange">;

export default function AutocompleteInput<T>({
  onChange: handleChange,
  open,
  onOpenChange: handleOpenChange,
  options,
  renderOption,
  selectOption,
  isLoading = false,
  loadingText = "Searching…",
  loadingNode,
  loadingClassName,
  ref,
  ...props
}: AutocompleteInputProps<T>) {
  const [localOpen, setLocalOpen] = useState(false);
  if (handleOpenChange == null) {
    handleOpenChange = setLocalOpen;
    open = localOpen;
  }
  const [highlighted, setHighlighted] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  ref ??= inputRef;

  const handleSelect = (opt: T) => {
    selectOption(opt);
    handleOpenChange?.(false);
    setHighlighted(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || options.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((prev) => (prev + 1) % options.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((prev) => (prev - 1 + options.length) % options.length);
    } else if (e.key === "Enter" && highlighted >= 0) {
      e.preventDefault();
      handleSelect(options[highlighted]);
    } else if (e.key === "Escape") {
      handleOpenChange?.(false);
      setHighlighted(-1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange(e);
    handleOpenChange?.(true);
    setHighlighted(-1);
  }

  const inputClass = isLoading && loadingClassName ? loadingClassName : props.className || "";

  return (
    <div className="relative">
      <input
        ref={ref}
        type="text"
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        className={`input ${inputClass}`}
        {...props}
      />

      {isLoading && (loadingNode || <p className="text-sm text-gray-500">{loadingText}</p>)}

      {open && options.length > 0 && (
        <ul className="absolute left-0 right-0 border rounded -mt-[1px] bg-white shadow-lg z-500">
          {options.map((opt, i) => (
            <li
              key={i}
              className={`p-2 cursor-pointer ${
                highlighted === i ? "bg-blue-100" : "hover:bg-gray-100"
              }`}
              onMouseEnter={() => setHighlighted(i)}
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(opt);
              }}
            >
              {renderOption(opt)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
