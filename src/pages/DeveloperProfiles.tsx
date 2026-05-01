import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Upload, Loader2, Github, Linkedin, Mail, User, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { supabaseService } from '../services/supabaseService';

const foundersData = [
  {
    id: 'tauqeer',
    name: 'Muhammad Tauqeer Hassan',
    role: 'CEO & Founder',
    specialty: 'Strategic Vision & Infrastructure',
    bio: 'Leading the development of UNIFLEX and pioneering the future of cinematic streaming.',
    github: 'https://github.com',
    linkedin: 'https://linkedin.com',
    email: 'hassantauqeer3655@gmail.com'
  },
  {
    id: 'faizan',
    name: 'Faizan Hassan',
    role: 'Chief Technology Officer',
    specialty: 'Low-Latency Streaming Systems',
    bio: 'Expert in high-speed backend systems and database optimization.',
    github: 'https://github.com',
    linkedin: 'https://linkedin.com',
    email: 'bss25000392@ue.edu.pk'
  },
  {
    id: 'waheed',
    name: 'Abdul Waheed',
    role: 'Lead Creative Director',
    specialty: 'Brutalist UI/UX Design',
    bio: 'Designer shaping the user interface and design of UNIFLEX.',
    github: 'https://github.com',
    linkedin: 'https://linkedin.com',
    email: 'bss25000380@ue.edu.pk'
  }
];

export default function DeveloperProfiles() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.email === 'hassantauqeer3655@gmail.com';
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [founderPhotos, setFounderPhotos] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFounderId, setSelectedFounderId] = useState<string | null>(null);

  useEffect(() => {
    const fetchPhotos = async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'founder_photos')
        .single();

      if (data) {
        setFounderPhotos(JSON.parse(data.value));
      }
    };

    fetchPhotos();

    // Real-time subscription
    const channel = supabase
      .channel('founder_photos_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'site_settings',
          filter: 'key=eq.founder_photos'
        },
        (payload) => {
          if (payload.new && (payload.new as any).value) {
            setFounderPhotos(JSON.parse((payload.new as any).value));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleUploadClick = (id: string) => {
    setSelectedFounderId(id);
    fileInputRef.current?.click();
  };

  const handleRemovePhoto = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this photo?')) return;
    
    setUploadingId(id);
    try {
      const newPhotos = { ...founderPhotos };
      delete newPhotos[id];

      const { error } = await supabase
        .from('site_settings')
        .upsert({
          key: 'founder_photos',
          value: JSON.stringify(newPhotos),
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      setFounderPhotos(newPhotos);
    } catch (error) {
      console.error("Remove failed:", error);
    } finally {
      setUploadingId(null);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedFounderId) return;

    setUploadingId(selectedFounderId);
    try {
      const publicUrl = await supabaseService.uploadFile('posters', `founders/${selectedFounderId}_${Date.now()}`, file);

      const newPhotos = {
        ...founderPhotos,
        [selectedFounderId]: publicUrl
      };

      const { error } = await supabase
        .from('site_settings')
        .upsert({
          key: 'founder_photos',
          value: JSON.stringify(newPhotos),
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploadingId(null);
      setSelectedFounderId(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <h1 className="text-5xl md:text-7xl font-black mb-4 tracking-tighter uppercase">
            Who Built <span className="bg-gradient-to-r from-primary-purple to-primary-magenta bg-clip-text text-transparent">UNIFLEX</span>?
          </h1>
          <p className="text-gray-500 text-xl max-w-2xl mx-auto">
            The team behind the evolution of digital entertainment.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-12">
          {foundersData.map((founder, index) => (
            <motion.div
              key={founder.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2, duration: 0.6 }}
              className="relative group"
            >
              <div className="absolute -inset-1 bg-gradient-to-b from-primary-purple to-primary-magenta rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
              
              <div className="relative bg-card-dark/40 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 flex flex-col items-center text-center h-full hover:border-white/20 transition-all duration-500">
                
                {/* Profile Frame */}
                <div className="relative mb-8">
                  <div className="w-40 h-40 rounded-full p-1 bg-gradient-to-tr from-primary-purple via-transparent to-primary-magenta shadow-[0_0_30px_rgba(139,92,246,0.3)]">
                    <div className="w-full h-full rounded-full overflow-hidden bg-bg-light border border-white/10 relative flex items-center justify-center">
                      {founderPhotos[founder.id] ? (
                        <img 
                          src={founderPhotos[founder.id]} 
                          alt={founder.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-20 h-20 text-gray-700" />
                      )}

                      {/* Admin Upload Overlay */}
                      {isAdmin && (
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                          <button 
                            onClick={() => handleUploadClick(founder.id)}
                            disabled={uploadingId === founder.id}
                            className="flex flex-col items-center justify-center gap-1 hover:text-primary-purple transition-colors"
                          >
                            {uploadingId === founder.id ? (
                              <Loader2 className="w-6 h-6 animate-spin text-primary-purple" />
                            ) : (
                              <>
                                <Upload className="w-6 h-6" />
                                <span className="text-[8px] font-black uppercase tracking-widest text-center">Update<br/>Photo</span>
                              </>
                            )}
                          </button>
                          
                          {founderPhotos[founder.id] && (
                            <button 
                              onClick={() => handleRemovePhoto(founder.id)}
                              disabled={uploadingId === founder.id}
                              className="text-red-500 hover:text-red-400 transition-colors flex flex-col items-center gap-1"
                            >
                              <Trash2 className="w-5 h-5" />
                              <span className="text-[8px] font-black uppercase tracking-widest">Remove</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <h2 className="text-2xl font-black mb-1 tracking-tight">{founder.name}</h2>
                <p className="text-primary-purple font-bold text-sm uppercase tracking-widest mb-4">
                  {founder.role}
                </p>
                <p className="text-gray-500 text-xs font-medium uppercase tracking-widest mb-6">
                  {founder.specialty}
                </p>
                <p className="text-gray-400 leading-relaxed mb-8 text-sm">
                  {founder.bio}
                </p>

                <div className="mt-auto flex gap-4">
                  <button className="p-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 transition-colors">
                    <Github className="w-5 h-5" />
                  </button>
                  <button className="p-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 transition-colors">
                    <Linkedin className="w-5 h-5" />
                  </button>
                  <button className="p-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 transition-colors">
                    <Mail className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Hidden File Input */}
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-32 text-center"
        >
          <div className="inline-block p-1 rounded-full bg-gradient-to-r from-primary-purple to-primary-magenta mb-8">
            <div className="px-8 py-3 rounded-full bg-bg-dark font-black uppercase tracking-[0.2em] text-sm">
              Built for Entertainment
            </div>
          </div>
          <p className="text-gray-500 max-w-xl mx-auto italic">
            "We didn't just build a streaming app. We built a platform for cinematic excellence."
          </p>
        </motion.div>
      </div>
    </PageLayout>
  );
}
