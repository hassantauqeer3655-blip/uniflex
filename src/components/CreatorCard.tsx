import React, { useState } from 'react';
import { Edit2, Github, Linkedin, Mail } from 'lucide-react';
import { motion } from 'motion/react';
import { Creator } from '../types';
import { useAuth } from '../context/AuthContext';
import EditProfileModal from './EditProfileModal';

interface CreatorCardProps {
  creator: Creator;
  index: number;
  onUpdate: (updatedCreator: Creator) => void;
}

const AUTHORIZED_EMAILS = [
  'hassantauqeer3655@gmail.com',
  'bss25000392@ue.edu.pk',
  'bss25000380@ue.edu.pk'
];

export default function CreatorCard({ creator, index, onUpdate }: CreatorCardProps) {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isAdmin = user?.email === 'hassantauqeer3655@gmail.com';
  const isAuthorized = isAdmin || (user?.email && 
    AUTHORIZED_EMAILS.includes(user.email) && 
    user.email === creator.email);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.2 }}
        className="group relative"
      >
        {/* Edit Button Overlay */}
        {isAuthorized && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="absolute top-4 right-4 z-20 p-3 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white hover:bg-primary-purple hover:border-primary-purple transition-all shadow-xl opacity-0 group-hover:opacity-100"
          >
            <Edit2 className="h-4 w-4" />
          </button>
        )}

        <div className="relative aspect-square rounded-[2.5rem] overflow-hidden mb-8 border border-white/10 group-hover:border-primary-purple transition-all duration-500">
          <img 
            src={creator.imageURL} 
            alt={creator.name}
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
        </div>

        <div className="text-center space-y-2">
          <h3 className="text-xl font-black uppercase tracking-tight group-hover:text-primary-purple transition-colors">
            {creator.name}
          </h3>
          <p className="text-primary-magenta font-bold text-xs uppercase tracking-[0.2em]">
            {creator.role}
          </p>
          <p className="text-gray-500 text-sm italic">
            {creator.bio}
          </p>
          
          <div className="flex items-center justify-center gap-6 pt-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
            {creator.github && (
              <a href={creator.github} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-white transition-colors">
                <Github className="h-5 w-5" />
              </a>
            )}
            {creator.linkedin && (
              <a href={creator.linkedin} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-blue-400 transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            )}
            <a href={`mailto:${creator.email}`} className="text-gray-500 hover:text-primary-purple transition-colors">
              <Mail className="h-5 w-5" />
            </a>
          </div>
        </div>
      </motion.div>

      <EditProfileModal 
        creator={creator}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpdate={onUpdate}
      />
    </>
  );
}
