import React from 'react';
import { motion } from 'motion/react';
import PageLayout from './PageLayout';

interface StaticLayoutProps {
  children: React.ReactNode;
}

export default function StaticLayout({ children }: StaticLayoutProps) {
  return (
    <PageLayout showBackButton={true} showNavbar={true}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {children}
      </motion.div>
    </PageLayout>
  );
}
