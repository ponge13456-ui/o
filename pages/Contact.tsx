
import React from 'react';

const Contact: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-6 py-24 text-center">
      <h1 className="text-4xl gold-text mb-8 logo-font">Get in Touch</h1>
      <p className="text-gray-300 mb-12">Have questions about your application or technical issues? Our support team is here to help.</p>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-[#2d1b4d] p-8 rounded-2xl border border-[#4b0082]">
          <h3 className="gold-text font-bold mb-2 uppercase tracking-widest">Support Email</h3>
          <p className="text-xl">support@eaglehub.com</p>
        </div>
        <div className="bg-[#2d1b4d] p-8 rounded-2xl border border-[#4b0082]">
          <h3 className="gold-text font-bold mb-2 uppercase tracking-widest">Social Media</h3>
          <p className="text-xl">@eagle190ts</p>
        </div>
      </div>

      <div className="mt-16 p-8 bg-white/5 rounded-2xl border border-dashed gold-border">
        <h3 className="font-bold mb-4">Official Headquaters</h3>
        <p className="text-gray-400">Eagle Plaza, Suite 400<br/>Business District, Metropolis</p>
      </div>
    </div>
  );
};

export default Contact;
