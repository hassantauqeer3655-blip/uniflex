import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  Code2, 
  Database, 
  Layout, 
  Film
} from 'lucide-react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';
import { Creator } from '../types';
import CreatorCard from '../components/CreatorCard';
import { FOOTER_CONFIG } from '../config/footerConfig';
import EditableText from '../components/EditableText';
import PageLayout from '../components/PageLayout';

const techStack = [
  { name: 'React.js', icon: <Code2 className="h-6 w-6" />, color: 'text-blue-400' },
  { name: 'Supabase', icon: <Database className="h-6 w-6" />, color: 'text-emerald-500' },
  { name: 'Tailwind CSS', icon: <Layout className="h-6 w-6" />, color: 'text-cyan-400' },
  { name: 'TMDB API', icon: <Film className="h-6 w-6" />, color: 'text-primary-purple' },
];

export default function About() {
  const navigate = useNavigate();
  const [creators, setCreators] = useState<Creator[]>([]);

  useEffect(() => {
    const fetchCreators = async () => {
      const { data, error } = await supabase
        .from('creators')
        .select('*');

      if (data && data.length > 0) {
        const fetchedCreators = data.map(c => ({ 
          id: c.id, 
          name: c.name,
          email: c.email,
          imageURL: c.image_url,
          role: c.role,
          github: c.github_url,
          linkedin: c.linkedin_url,
          bio: c.bio || 'Developer and film enthusiast.'
        } as Creator));
        setCreators(fetchedCreators);
      } else {
        // Fallback to static config if Supabase is empty
        const fallbackCreators = FOOTER_CONFIG.creators.map((c, idx) => ({
          id: `static-${idx}`,
          name: c.name,
          email: c.email,
          imageURL: c.image,
          role: c.role,
          github: c.github,
          linkedin: c.linkedin,
          bio: 'Developer and film enthusiast.'
        } as Creator));
        setCreators(fallbackCreators);
      }
    };

    fetchCreators();

    // Real-time subscription
    const channel = supabase
      .channel('creators_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'creators'
        },
        () => {
          fetchCreators();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleCreatorUpdate = (updatedCreator: Creator) => {
    setCreators(prev => prev.map(c => c.id === updatedCreator.id ? updatedCreator : c));
  };

  return (
    <PageLayout showBackButton={true}>
      <div className="pb-20">
        {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter uppercase leading-none">
              <EditableText settingKey="dashboardHeading" />
            </h1>
            <div className="text-gray-500 text-xl md:text-2xl max-w-3xl mx-auto font-medium uppercase tracking-widest">
              <EditableText settingKey="dashboardSubheading" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* The Story */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative p-12 rounded-[3rem] bg-white/5 backdrop-blur-2xl border border-white/10 overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary-purple/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <h2 className="text-3xl font-black mb-8 uppercase tracking-tighter">The UNIFLEX Story</h2>
            <div className="text-gray-400 text-lg leading-relaxed mb-6">
              <EditableText settingKey="aboutMission" multiline />
            </div>
            <p className="text-gray-400 text-lg leading-relaxed">
              Our platform leverages cutting-edge web technologies to provide a seamless, lag-free experience across all devices. From our custom-built movie player to our intelligent recommendation engine, every line of code is written with one goal in mind: your absolute immersion.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-center text-sm font-black uppercase tracking-[0.5em] text-primary-purple mb-12">Powered By</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {techStack.map((tech, index) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 flex flex-col items-center gap-4 hover:border-primary-purple/50 hover:shadow-[0_0_30px_rgba(153,69,255,0.2)] transition-all duration-300"
              >
                <div className={cn("p-4 rounded-2xl bg-white/5", tech.color)}>
                  {tech.icon}
                </div>
                <span className="font-black uppercase tracking-widest text-xs">{tech.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* The Creators */}
      <section className="py-20 px-6 pb-40">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-center text-4xl md:text-6xl font-black mb-20 uppercase tracking-tighter">Our Team</h2>
          <div className="grid md:grid-cols-3 gap-12">
            {creators.map((creator, index) => (
              <CreatorCard 
                key={creator.id} 
                creator={creator} 
                index={index} 
                onUpdate={handleCreatorUpdate}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <footer className="py-32 border-t border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary-purple/5 blur-[100px] -z-10" />
        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-12"
          >
            <div className="inline-block p-[2px] rounded-full bg-gradient-to-r from-primary-purple via-primary-magenta to-primary-purple animate-gradient-x">
              <div className="px-12 py-4 rounded-full bg-black font-black uppercase tracking-[0.3em] text-sm hover:bg-transparent transition-colors cursor-default">
                Designed for Entertainment
              </div>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-400 max-w-2xl mx-auto text-lg italic leading-relaxed">
                "We didn't just build a streaming app. We built a platform for cinematic excellence, where every pixel is a testament to our passion for digital entertainment."
              </p>
              <div className="h-1 w-20 bg-gradient-to-r from-primary-purple to-primary-magenta mx-auto rounded-full" />
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/')}
              className="px-10 py-4 bg-white text-black font-black uppercase tracking-widest rounded-full hover:bg-primary-purple hover:text-white transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)]"
            >
              Return Home
            </motion.button>
          </motion.div>
        </div>
      </footer>
      </div>
    </PageLayout>
  );
}
