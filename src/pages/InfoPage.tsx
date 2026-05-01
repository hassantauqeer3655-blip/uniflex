import React from 'react';
import { useParams, Link } from 'react-router-dom';
import StaticLayout from '../components/StaticLayout';
import { motion } from 'motion/react';
import { Activity, Briefcase, TrendingUp, Globe, ShieldCheck, Mail, ExternalLink, Zap } from 'lucide-react';
import EditableText from '../components/EditableText';
import { useAdmin } from '../hooks/useAdmin';

const INFO_CONTENT: Record<string, { title: string, icon: any, content: string, subContent?: string }> = {
  'jobs': {
    title: 'Jobs',
    icon: Briefcase,
    content: 'Building the future of streaming entertainment.',
    subContent: 'Join our global team of engineers, designers, and visionaries. We are currently hiring for roles in streaming technology, UI/UX design, and cloud infrastructure.'
  },
  'investor-relations': {
    title: 'Investor Relations',
    icon: TrendingUp,
    content: 'Building the future of streaming entertainment.',
    subContent: 'UNIFLEX is at the forefront of digital entertainment. Explore our quarterly earnings, annual reports, and investor presentations to see how we are scaling the next generation of entertainment.'
  },
  'corporate-information': {
    title: 'Corporate Information',
    icon: Globe,
    content: 'Building the Future of Digital Consciousness.',
    subContent: 'Headquartered Home, UNIFLEX operates across 190 countries, delivering high-quality content to millions of connected devices.'
  },
  'speed-test': {
    title: 'Speed Test',
    icon: Zap,
    content: 'Check your connection to Home.',
    subContent: 'To ensure a 10,000/10 visual experience, we recommend a minimum of 25 Mbps for Ultra HD streaming. Your current connection is being optimized for the best viewing experience.'
  },
  'legal-notices': {
    title: 'Legal Notices',
    icon: ShieldCheck,
    content: 'Standard 2026 Compliance.',
    subContent: 'All content on UNIFLEX is protected by international copyright laws. Unauthorized reproduction or distribution is strictly prohibited everywhere.'
  },
  'contact-us': {
    title: 'Contact Us',
    icon: Mail,
    content: 'Primary Contact: hassantauqeer3655@gmail.com',
    subContent: 'Need immediate assistance? Our support team is available 24/7. You can also submit a ticket through our Help Center for complex inquiries.'
  }
};

export default function InfoPage() {
  const { slug } = useParams();
  
  const pageData = slug ? INFO_CONTENT[slug] : null;
  const title = pageData?.title || (slug 
    ? slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    : 'Information');

  const Icon = pageData?.icon || Activity;

  return (
    <StaticLayout>
      <div className="max-w-4xl mx-auto px-6 py-24 text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mb-12"
        >
          <div className="w-20 h-20 bg-primary-purple/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-primary-purple/20">
            <Icon className="h-10 w-10 text-primary-purple" />
          </div>
          <h1 className="text-5xl font-black mb-4 tracking-tighter uppercase text-white">{title}</h1>
          <div className="h-1 w-24 bg-gradient-to-r from-primary-purple to-primary-magenta mx-auto rounded-full" />
        </motion.div>

        <div className="bg-white/5 p-12 rounded-[2.5rem] border border-white/10 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-purple/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="text-white text-2xl font-bold leading-relaxed mb-8 relative z-10">
            {slug ? (
              <EditableText 
                settingKey={`info_${slug}_content` as any} 
                fallback={pageData?.content || `We are currently updating our ${title} page to provide you with the most accurate and up-to-date information.`}
                className="w-full justify-center"
              />
            ) : pageData?.content}
          </div>
          
          <div className="text-zinc-400 text-lg leading-relaxed mb-12 relative z-10">
            {slug ? (
              <EditableText 
                settingKey={`info_${slug}_subContent` as any} 
                multiline
                fallback={pageData?.subContent || "Please check back soon or contact our support team if you have immediate questions."}
                className="w-full justify-center text-center"
              />
            ) : pageData?.subContent}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
            <Link 
              to="/help" 
              onClick={() => console.log("Help Center Link Clicked")}
              className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl text-sm font-black uppercase tracking-widest transition-all"
            >
              Visit Help Center
            </Link>
            {slug === 'contact-us' && (
              <a 
                href="mailto:hassantauqeer3655@gmail.com"
                onClick={() => console.log("Support Email Clicked")}
                className="px-8 py-4 bg-primary-purple hover:bg-primary-magenta text-white rounded-2xl text-sm font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)]"
              >
                Submit a Ticket
              </a>
            )}
          </div>
        </div>
      </div>
    </StaticLayout>
  );
}
