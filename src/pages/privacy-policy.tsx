import React from "react";
import PageLayout from "../components/PageLayout/PageLayout";
import MetaHead from "../components/MetaHead";

const PrivacyPolicyPage: React.FC = () => {
  return (
    <PageLayout>
      <MetaHead 
        title="Privacy Policy - Health Supply & Mobility Inc" 
        description="Privacy Policy"
      />
      <div className="min-h-screen bg-gray-50 pt-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 lg:p-12">
            <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
            <div className="space-y-4">
              <p>HS Mobility are committed to protecting your privacy, and support a general policy of openness about how we collect, use and disclose your Personal Information (as defined below) in accordance with relevant data protection laws.</p>
              <p>The purpose of this Privacy Policy is to inform you about HS Mobility practices relating to the collection, use and disclosure of Personal Information that may be provided through access to or use of our websites, services or products (if applicable), or that may otherwise be collected by us. By using any of HS Mobility websites, mobile applications or other digital platforms that link to this Privacy Policy ("Website"), you consent to the collection, use and disclosure of your Personal Information in accordance with this Privacy Policy.</p>
              <p>This Privacy Policy also explains how you can contact us if you have a question about, want to access, correct or delete any Personal Information that HS Mobility may be holding about you. As one of our users or someone else with whom we do business, you understand and agree that we collect, use and disclose your Personal Information in accordance with this Privacy Policy. We strongly recommend that you take the time to read this Privacy Policy and retain it for future reference.</p>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default PrivacyPolicyPage;
