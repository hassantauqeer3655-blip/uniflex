import React from 'react';
import StaticLayout from '../components/StaticLayout';

export default function Terms() {
  return (
    <StaticLayout>
      <main className="max-w-4xl mx-auto py-24 px-4">
        <h1 className="text-5xl font-black uppercase tracking-tighter mb-12 text-white">Terms of Use</h1>
        <div className="space-y-12 text-zinc-400 leading-relaxed text-lg">
          <p className="text-zinc-500 italic">Last Updated: April 11, 2026</p>
          
          <section>
            <h2 className="text-2xl font-black text-white mb-6 uppercase tracking-tight">1. Acceptance of Terms</h2>
            <p>
              By accessing and using UNIFLEX, you agree to be bound by these Terms of Use. Our service is designed for modern home entertainment, providing high-quality streaming across all your connected digital devices. If you do not agree to these terms, please do not use the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-6 uppercase tracking-tight">2. Membership</h2>
            <p>
              Your UNIFLEX membership is managed through your primary account. To use the UNIFLEX service you must have Internet access and a UNIFLEX-ready device. 
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-6 uppercase tracking-tight">3. Account Use</h2>
            <p>
              Your account is for personal use within your household. You can manage your personal information and passwords in the Account Settings section of your profile.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-6 uppercase tracking-tight">4. UNIFLEX Service & Content</h2>
            <p>
              You must be at least 18 years of age to become a member. The UNIFLEX service and any content viewed through our service are for your personal and non-commercial use only. During your membership, we grant you a limited, non-exclusive, non-transferable right to access the UNIFLEX service and view UNIFLEX content.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-6 uppercase tracking-tight">5. Passwords and Account Access</h2>
            <p>
              The member who created the UNIFLEX account and whose Payment Method is charged (the "Account Owner") has control over the UNIFLEX account and the UNIFLEX-ready devices that are used to access our service. To maintain control over the account and prevent anyone from accessing the account, the Account Owner should maintain control over the UNIFLEX-ready devices.
            </p>
          </section>
        </div>
      </main>
    </StaticLayout>
  );
}
