import React from 'react';
import { FaRobot } from 'react-icons/fa';

interface AIAssistantButtonProps {
  onClick: () => void;
}

const AIAssistantButton: React.FC<AIAssistantButtonProps> = ({ onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="bg-white/10 hover:bg-white/20 transition-colors px-6 py-3 rounded-full flex items-center font-semibold text-sm opacity-100"
    >
      <FaRobot className="mr-2" /> AI要約・質問
    </button>
  );
};

export default AIAssistantButton; 