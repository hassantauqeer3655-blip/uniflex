import React from 'react';
import StaticLayout from '../components/StaticLayout';

export default function Privacy() {
  return (
    <StaticLayout>
      <main className="max-w-4xl mx-auto py-24 px-4">
        <h1 className="text-5xl font-black uppercase tracking-tighter mb-12 text-white">Privacy Statement</h1>
        <div className="space-y-12 text-zinc-400 leading-relaxed text-lg">
          <p className="text-zinc-500 italic">Effective Date: April 11, 2026</p>

          <section>
            <h2 className="text-2xl font-black text-white mb-6 uppercase tracking-tight">Collection of Information</h2>
            <p>
              We receive and store information about you such as: information you provide to us (name, email), information we collect automatically (device IDs, streaming history, IP addresses), and information from other sources (marketing partners, public databases).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-6 uppercase tracking-tight">Use of Information</h2>
            <p>
              We use information to provide, analyze, administer, enhance and personalize our services and marketing efforts, to process your registration and your interactions, and to communicate with you on these and other topics. This includes our recommendation engines which rely on your interaction data to provide a tailored experience.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-6 uppercase tracking-tight">Disclosure of Information</h2>
            <p>
              We disclose your information for certain purposes and to third parties, such as service providers who perform services on our behalf. We do not sell your personal information to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-6 uppercase tracking-tight">Security</h2>
            <p>
              We use reasonable administrative, logical, physical and managerial measures to safeguard your personal information against loss, theft and unauthorized access, use and modification. These measures are designed to provide a level of security appropriate to the risks of processing your personal information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-6 uppercase tracking-tight">Your Choices</h2>
            <p>
              If you no longer want to receive certain communications from us via email or text message, simply access the communications settings in the "Account" section of our website. You can also request access to your personal information or correct/update out-of-date or inaccurate personal information we hold about you.
            </p>
          </section>
        </div>
      </main>
    </StaticLayout>
  );
}
