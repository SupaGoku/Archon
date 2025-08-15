import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '../ui/Button';
import { motion } from 'framer-motion';

export const ButtonPlayground: React.FC = () => {
  const [buttonConfig, setButtonConfig] = useState({
    color: 'primary' as const,
    size: 'md' as const,
    variant: 'solid' as const,
    text: 'Click Me'
  });
  
  const [copiedCode, setCopiedCode] = useState(false);

  const generateCode = () => {
    return `<Button
  color="${buttonConfig.color}"
  size="${buttonConfig.size}"
  variant="${buttonConfig.variant}"
>
  ${buttonConfig.text}
</Button>`;
  };

  const copyCode = () => {
    navigator.clipboard.writeText(generateCode());
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Button Playground</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Customize the button appearance
        </p>
      </div>

      {/* Preview Area */}
      <div className="flex justify-center items-center min-h-[200px] p-8 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <Button
          color={buttonConfig.color}
          size={buttonConfig.size}
          variant={buttonConfig.variant}
        >
          {buttonConfig.text}
        </Button>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Color */}
        <div>
          <label className="block text-sm font-medium mb-2">Color</label>
          <select
            value={buttonConfig.color}
            onChange={(e) => setButtonConfig(prev => ({ ...prev, color: e.target.value as any }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
          >
            <option value="default">Default</option>
            <option value="primary">Primary</option>
            <option value="secondary">Secondary</option>
            <option value="success">Success</option>
            <option value="danger">Danger</option>
            <option value="warning">Warning</option>
          </select>
        </div>

        {/* Size */}
        <div>
          <label className="block text-sm font-medium mb-2">Size</label>
          <select
            value={buttonConfig.size}
            onChange={(e) => setButtonConfig(prev => ({ ...prev, size: e.target.value as any }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
          >
            <option value="sm">Small</option>
            <option value="md">Medium</option>
            <option value="lg">Large</option>
            <option value="xl">Extra Large</option>
          </select>
        </div>

        {/* Variant */}
        <div>
          <label className="block text-sm font-medium mb-2">Variant</label>
          <select
            value={buttonConfig.variant}
            onChange={(e) => setButtonConfig(prev => ({ ...prev, variant: e.target.value as any }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
          >
            <option value="solid">Solid</option>
            <option value="outline">Outline</option>
            <option value="ghost">Ghost</option>
          </select>
        </div>

        {/* Text */}
        <div>
          <label className="block text-sm font-medium mb-2">Button Text</label>
          <input
            type="text"
            value={buttonConfig.text}
            onChange={(e) => setButtonConfig(prev => ({ ...prev, text: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
          />
        </div>
      </div>

      {/* Generated Code */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Generated Code</h3>
          <motion.button
            onClick={copyCode}
            className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 dark:bg-gray-800 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            whileTap={{ scale: 0.95 }}
          >
            {copiedCode ? (
              <>
                <Check className="w-4 h-4 text-green-500" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy
              </>
            )}
          </motion.button>
        </div>
        <pre className="p-4 bg-gray-900 text-gray-100 rounded-lg overflow-x-auto">
          <code>{generateCode()}</code>
        </pre>
      </div>
    </div>
  );
};