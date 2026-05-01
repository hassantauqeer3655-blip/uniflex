import React, { useState, useRef } from 'react';
import { X, Check, Trash2, Loader2, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PROFESSIONAL_AVATARS } from '../constants';
import { useAuth } from '../context/AuthContext';
import { supabaseService } from '../services/supabaseService';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAdding: boolean;
  editingProfileId: string | null;
  initialName?: string;
  initialAvatar?: string;
  onSave: (name: string, avatar: string) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export default function ProfileModal({
  isOpen,
  onClose,
  isAdding,
  editingProfileId,
  initialName = '',
  initialAvatar = PROFESSIONAL_AVATARS[0].url,
  onSave,
  onDelete
}: ProfileModalProps) {
  const [name, setName] = useState(initialName);
  const [avatar, setAvatar] = useState(initialAvatar);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('File size too large. Max 2MB.');
        return;
      }
      setSelectedFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!name.trim() || loading || isUploading) return;
    setLoading(true);
    try {
      let finalAvatar = avatar;
      
      // Upload custom avatar if selected
      if (selectedFile && user) {
        setIsUploading(true);
        try {
          const path = `profiles/${user.id}/${Date.now()}_avatar.png`;
          finalAvatar = await supabaseService.uploadFile('avatars', path, selectedFile);
        } catch (uploadError) {
          console.error("Upload error:", uploadError);
          throw new Error("Failed to upload custom avatar. Please try again or use a predefined one.");
        } finally {
          setIsUploading(false);
        }
      }

      await onSave(name, finalAvatar);
      onClose();
      setSelectedFile(null);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!editingProfileId || !onDelete || loading || isUploading) return;
    if (window.confirm('Are you sure you want to delete this profile?')) {
      setLoading(true);
      try {
        await onDelete(editingProfileId);
        onClose();
      } catch (err) {
        console.error(err);
        alert(err instanceof Error ? err.message : 'Failed to delete profile');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-[#141414] p-8 rounded-3xl max-w-md w-full border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden"
          >
            {/* Background Glow */}
            <div className="absolute -top-24 -right-24 h-48 w-48 bg-primary-purple/10 blur-[80px] rounded-full" />
            
            <div className="flex justify-between items-center mb-8 relative z-10">
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter">
                {isAdding ? 'Add Profile' : 'Edit Profile'}
              </h2>
              <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                disabled={loading || isUploading}
              >
                <X className="w-6 h-6" />
              </motion.button>
            </div>

            <div className="space-y-8 relative z-10">
              <div className="flex justify-center">
                <div className="relative group">
                  <div className="absolute -inset-8 bg-gradient-to-r from-primary-purple/20 to-primary-magenta/20 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition duration-700" />
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary-purple to-primary-magenta rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-500" />
                  <div className="relative">
                    <img 
                      src={avatar} 
                      alt="Preview" 
                      className="w-32 h-32 md:w-40 md:h-40 rounded-3xl border-4 border-white/10 shadow-2xl object-cover backdrop-blur-md bg-white/5"
                    />
                    {isUploading && (
                      <div className="absolute inset-0 bg-black/60 rounded-3xl flex flex-col items-center justify-center gap-2 backdrop-blur-sm">
                        <Loader2 className="w-8 h-8 text-primary-purple animate-spin" />
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">Uploading...</span>
                      </div>
                    )}
                    <button 
                      onClick={() => !isUploading && fileInputRef.current?.click()}
                      className={`absolute bottom-2 right-2 p-3 bg-primary-purple rounded-xl text-white shadow-lg shadow-primary-purple/40 hover:scale-110 active:scale-95 transition-all ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <Upload className="w-5 h-5" />
                    </button>
                    <input 
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      capture="user"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative aspect-square rounded-xl overflow-hidden border-2 border-dashed flex flex-col items-center justify-center gap-1 transition-all ${
                    selectedFile 
                      ? 'border-primary-purple bg-primary-purple/10 scale-105' 
                      : 'border-white/20 hover:border-primary-purple hover:bg-primary-purple/5'
                  }`}
                  disabled={isUploading}
                >
                  <Upload className={`w-6 h-6 ${selectedFile ? 'text-primary-purple' : 'text-gray-400'}`} />
                  <span className="text-[8px] font-black uppercase tracking-widest text-gray-500">Custom</span>
                  {selectedFile && (
                    <div className="absolute top-1 right-1">
                      <div className="w-2 h-2 bg-primary-purple rounded-full animate-pulse" />
                    </div>
                  )}
                </motion.button>
                
                {PROFESSIONAL_AVATARS.map((av) => (
                  <motion.button
                    key={av.id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setAvatar(av.url);
                      setSelectedFile(null);
                    }}
                    disabled={isUploading}
                    className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-300 backdrop-blur-sm bg-white/5 ${
                      avatar === av.url && !selectedFile
                        ? 'border-primary-purple scale-105 shadow-[0_0_15px_rgba(139,92,246,0.3)]' 
                        : 'border-transparent opacity-40 hover:opacity-100 hover:scale-105'
                    }`}
                  >
                    <img src={av.url} alt="Avatar option" className="w-full h-full object-cover" />
                    {avatar === av.url && !selectedFile && (
                      <div className="absolute inset-0 bg-primary-purple/10 flex items-center justify-center">
                        <Check className="w-6 h-6 text-white" />
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 ml-1">Profile Identity</label>
                <input 
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter profile name"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold placeholder:text-gray-600 focus:outline-none focus:border-primary-purple focus:bg-white/10 transition-all backdrop-blur-md"
                  autoFocus
                  disabled={loading || success || isUploading}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSave}
                  disabled={!name.trim() || loading || success || isUploading}
                  className={`flex-1 font-black uppercase tracking-widest py-4 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl ${
                    success 
                      ? 'bg-green-500 text-white' 
                      : (loading || isUploading)
                        ? 'bg-white/10 text-gray-500'
                        : 'bg-white text-black hover:bg-primary-purple hover:text-white'
                  }`}
                >
                  {(loading || isUploading) ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : success ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Check className="w-5 h-5" />
                  )}
                  {isUploading ? 'Uploading...' : success ? 'Success!' : isAdding ? 'Initialize' : 'Update'}
                </motion.button>
                
                {!isAdding && editingProfileId && (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleDelete}
                    disabled={loading || isUploading}
                    className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white p-4 rounded-2xl transition-all active:scale-95 border border-red-500/20 disabled:opacity-50"
                    title="Delete Profile"
                  >
                    <Trash2 className="w-6 h-6" />
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
