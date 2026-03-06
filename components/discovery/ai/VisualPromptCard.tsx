'use client';

interface VisualPromptCardProps {
  prompt: string;
  onClick: (prompt: string) => void;
}

export default function VisualPromptCard({ prompt, onClick }: VisualPromptCardProps) {
  return (
    <button
      onClick={() => onClick(prompt)}
      className="flex-shrink-0 w-64 p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all text-left group"
    >
      <p className="text-sm text-gray-700 group-hover:text-blue-700 transition-colors">
        {prompt}
      </p>
    </button>
  );
}
