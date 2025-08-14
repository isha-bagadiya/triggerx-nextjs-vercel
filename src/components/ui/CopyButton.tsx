import React from "react";
import { CopyIcon, CheckIcon } from "lucide-react";
import { ActionButton } from "./ActionButton";

interface LucideCopyButtonProps {
  text: string;
  className?: string;
  onCopy?: () => void;
}

export function LucideCopyButton({ text, onCopy }: LucideCopyButtonProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    // Prevent event bubbling to parent elements
    e.stopPropagation();

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      onCopy?.();
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <ActionButton
      onClick={handleCopy}
      variant="ghost"
      size="sm"
      className="!py-0 !pl-2 !pr-0"
      icon={
        copied ? (
          <CheckIcon className="h-4 w-4 text-gray-500" />
        ) : (
          <CopyIcon className="h-4 w-4" />
        )
      }
      text=""
    />
  );
}
