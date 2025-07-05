import React from 'react';
import { Download, Trash2, Printer, Share2, FileText } from 'lucide-react';

interface ActionButtonsProps {
  onExport?: () => void;
  onDelete?: () => void;
  onPrint?: () => void;
  onShare?: () => void;
  onPDF?: () => void;
  showDelete?: boolean;
  showPrint?: boolean;
  showShare?: boolean;
  showPDF?: boolean;
  className?: string;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  onExport,
  onDelete,
  onPrint,
  onShare,
  onPDF,
  showDelete = true,
  showPrint = true,
  showShare = true,
  showPDF = true,
  className = ''
}) => {
  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  const handleShare = async () => {
    if (onShare) {
      onShare();
    } else if (navigator.share) {
      try {
        await navigator.share({
          title: 'Property Management Data',
          text: 'Check out this property management data',
          url: window.location.href
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy URL to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handlePDF = () => {
    if (onPDF) {
      onPDF();
    } else {
      // Generate PDF from current page
      window.print();
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {onExport && (
        <button
          onClick={onExport}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="Export Data"
        >
          <Download size={16} />
        </button>
      )}
      
      {showPDF && (
        <button
          onClick={handlePDF}
          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
          title="Generate PDF"
        >
          <FileText size={16} />
        </button>
      )}
      
      {showPrint && (
        <button
          onClick={handlePrint}
          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
          title="Print"
        >
          <Printer size={16} />
        </button>
      )}
      
      {showShare && (
        <button
          onClick={handleShare}
          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
          title="Share"
        >
          <Share2 size={16} />
        </button>
      )}
      
      {showDelete && onDelete && (
        <button
          onClick={onDelete}
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Delete"
        >
          <Trash2 size={16} />
        </button>
      )}
    </div>
  );
};

export default ActionButtons;