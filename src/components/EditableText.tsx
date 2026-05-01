import React, { useState } from 'react';
import { Edit3, Check, X, Loader2 } from 'lucide-react';
import { useAdmin } from '../hooks/useAdmin';
import { useSettings } from '../context/SettingsContext';
import { SiteSettings } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface EditableTextProps {
  settingKey: keyof SiteSettings;
  className?: string;
  multiline?: boolean;
  fallback?: string;
  children?: React.ReactNode;
}

export default function EditableText({ settingKey, className, multiline = false, fallback = '', children }: EditableTextProps) {
  const { isAdmin } = useAdmin();
  const { settings, updateSetting } = useSettings();
  const [isEditing, setIsEditing] = useState(false);
  const displayValue = settings[settingKey] || (children ? undefined : fallback);
  const [value, setValue] = useState(settings[settingKey] || fallback);
  const [isSaving, setIsSaving] = useState(false);

  // Sync with global settings when not editing
  React.useEffect(() => {
    if (!isEditing) {
      setValue(settings[settingKey] || fallback);
    }
  }, [settings, settingKey, isEditing, fallback]);

  const handleSave = async () => {
    if (value === settings[settingKey]) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await updateSetting(settingKey, value);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save setting:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setValue(settings[settingKey] || '');
    setIsEditing(false);
  };

  if (!isAdmin) {
    return <span className={className}>{settings[settingKey]}</span>;
  }

  return (
    <div className={cn("group relative inline-block w-full", className)}>
      <AnimatePresence mode="wait">
        {isEditing ? (
          <motion.div
            key="editing"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="flex flex-col gap-2 w-full"
          >
            {multiline ? (
              <textarea
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full bg-white/5 backdrop-blur-md border border-primary-purple/50 rounded-xl p-4 text-inherit outline-none focus:ring-1 focus:ring-primary-purple min-h-[100px] resize-y"
                autoFocus
              />
            ) : (
              <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full bg-white/5 backdrop-blur-md border border-primary-purple/50 rounded-xl px-4 py-2 text-inherit outline-none focus:ring-1 focus:ring-primary-purple"
                autoFocus
              />
            )}
            <div className="flex justify-end gap-2">
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 transition-colors"
                title="Cancel"
              >
                <X className="h-4 w-4" />
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="p-2 rounded-lg bg-primary-purple hover:bg-primary-magenta text-white transition-colors shadow-lg shadow-primary-purple/20"
                title="Save"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="display"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn("flex items-center gap-2 group/text", className)}
          >
            <span>{displayValue !== undefined ? displayValue : children}</span>
            <button
              onClick={() => setIsEditing(true)}
              className="opacity-0 group-hover/text:opacity-100 p-1.5 rounded-lg bg-white/5 hover:bg-primary-purple/20 text-primary-purple transition-all"
              title="Edit Content"
            >
              <Edit3 className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
