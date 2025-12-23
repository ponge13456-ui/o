
import React from 'react';

const Privacy: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-6 py-24">
      <h1 className="text-4xl gold-text mb-12 logo-font">Privacy Policy</h1>
      <div className="space-y-8 text-gray-300 leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-white mb-4">1. Information Collection</h2>
          <p>We collect basic information such as your phone number and username to facilitate the spin wheel and application features. This data is stored securely and never shared with third parties without your consent.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-white mb-4">2. Use of Data</h2>
          <p>Your data is used solely to provide promotional benefits, track your rewards, and process influencer/seller applications. We may contact you via your provided phone number regarding your application status.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-white mb-4">3. Security</h2>
          <p>Eagle Hub employs industry-standard encryption to protect your information. As this is currently an in-memory application, persistence is limited to your local browser storage.</p>
        </section>
      </div>
    </div>
  );
};

export default Privacy;
