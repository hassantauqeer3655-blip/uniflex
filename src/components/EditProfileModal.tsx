import React, { useState, useRef } from 'react';
import { X, Upload, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Creator } from '../types';
import { uploadCreatorImage, updateCreatorProfile } from '../lib/supabaseHelpers';
import { cn } from '../lib/utils';

interface EditProfileModalProps {
  creator: Creator;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedCreator: Creator) => void;
}

export default function EditProfileModal({ creator, isOpen, onClose, onUpdate }: EditProfileModalProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(creator.imageURL);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<Partial<Creator>>({
    name: creator.name,
    role: creator.role,
    bio: creator.bio,
    github: creator.github,
    linkedin: creator.linkedin
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('File size must be less than 2MB');
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const handleSave = async () => {
    setIsUploading(true);
    setError(null);
    try {
      let finalImageUrl = creator.imageURL;

      if (selectedFile) {
        finalImageUrl = await uploadCreatorImage(selectedFile, creator.id);
      }

      const updatedData = {
        ...formData,
        imageURL: finalImageUrl,
        image: finalImageUrl, // For compatibility with Footer.tsx
      };

      await updateCreatorProfile(creator.id, updatedData);
      
      onUpdate({ ...creator, ...updatedData });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Update failed:', err);
      setError('Failed to update profile. Please check your permissions.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md overflow-hidden rounded-3xl bg-card-dark border border-white/10 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 p-6">
              <h3 className="text-xl font-black uppercase tracking-tighter text-white">Edit Creator Profile</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-8 space-y-6">
              {/* Avatar Preview & Upload */}
              <div className="flex flex-col items-center space-y-4">
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <div className="h-32 w-32 rounded-full overflow-hidden border-2 border-primary-purple shadow-[0_0_20px_rgba(153,69,255,0.3)] group-hover:border-primary-magenta transition-all">
                    <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                    <Upload className="h-8 w-8 text-white" />
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    className="hidden" 
                    accept="image/*"
                  />
                </div>
                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Click to change artwork</p>
              </div>

              {/* Editable Fields */}
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 block mb-1">Creator Name</label>
                  <input 
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary-purple/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 block mb-1">Role / Specialization</label>
                  <input 
                    type="text"
                    value={formData.role || ''}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary-purple/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 block mb-1">Biography</label>
                  <textarea 
                    value={formData.bio || ''}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary-purple/50 transition-colors h-24 resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 block mb-1">GitHub URL</label>
                    <input 
                      type="text"
                      value={formData.github || ''}
                      onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary-purple/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 block mb-1">LinkedIn URL</label>
                    <input 
                      type="text"
                      value={formData.linkedin || ''}
                      onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary-purple/50 transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 block mb-1">Creator ID (Email)</label>
                  <div className="w-full bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3 text-xs text-zinc-600 italic">
                    {creator.email} (Email serves as permanent identifier)
                  </div>
                </div>
              </div>

              {/* Status Messages */}
              {error && (
                <div className="flex items-center gap-2 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              
              {success && (
                <div className="flex items-center gap-2 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>Profile updated successfully!</span>
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={handleSave}
                disabled={isUploading || success}
                className={cn(
                  "w-full py-4 rounded-xl font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-2 shadow-lg",
                  isUploading 
                    ? "bg-gray-800 text-gray-500 cursor-not-allowed" 
                    : "bg-gradient-to-r from-primary-purple to-primary-magenta text-white hover:shadow-[0_0_20px_rgba(153,69,255,0.4)] active:scale-95"
                )}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
