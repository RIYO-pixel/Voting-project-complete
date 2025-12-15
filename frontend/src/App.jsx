import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// --- COMPONENTS ---
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// --- PAGES ---
import OfficerLogin from '@/pages/OfficerLogin';
import AdminDashboard from '@/pages/AdminDashboard';
import CreateCredential from '@/pages/CreateCredential'; 
import CandidateCheck from '@/pages/CandidateCheck';
import VerificationSuccess from '@/pages/VerificationSuccess';
import VerificationFailed from '@/pages/VerificationFailed';
import CameraSignUp from '@/pages/CameraSignUp';
import AdminLogin from '@/pages/AdminLogin'; 
import VoterUploading from '@/pages/VoterUploading';
import VoterList from '@/pages/VoterList';
import VoteConfirmation from '@/pages/VoteConfirmation';
import VotingSuccess from '@/pages/VotingSuccess'; 
import VotingFailed from '@/pages/VotingFailed';   
import BiometricVerification from '@/pages/BiometricVerification';
// 1. IMPORT THE NEW PAGE
import OfficerList from '@/pages/OfficerList'; 

import { AuthProvider } from '@/Context/AuthContext'; 

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-gray-100 font-sans">
          
          <Header />

          <main className="flex-1 flex justify-center items-center p-6">
            <Routes>
              {/* Login Page (Home) */}
              <Route path="/" element={<OfficerLogin />} />

              {/* Admin Login */}
              <Route path="/admin-login" element={<AdminLogin />} />

              {/* Admin Dashboard */}
              <Route path="/admin-dashboard" element={<AdminDashboard />} />

              {/* Create Credential Page */}
              <Route path="/admin/create-credential" element={<CreateCredential />} />

              {/* Voter Uploading Page */}
              <Route path="/admin/enter-voter" element={<VoterUploading />} />

              {/* 2. ADD THE NEW ROUTE HERE */}
              {/* This matches the path in your AdminDashboard configuration */}
              <Route path="/admin/credential-list" element={<OfficerList />} />
              <Route path="/admin/voter-list" element={<VoterList />} />

              {/* Candidate Checking Flow */}
              <Route path="/check-candidate" element={<CandidateCheck />} />
              <Route path="/verification-success" element={<VerificationSuccess />} />
              <Route path="/verification-failed" element={<VerificationFailed />} />
              <Route path="/vote-confirmation" element={<VoteConfirmation />} />

              {/* Voting Outcome Pages */}
              <Route path="/voting-success" element={<VotingSuccess />} />
              <Route path="/voting-failed" element={<VotingFailed />} />
              
              {/* IMPORTANT: This path must match what you used in CandidateCheck.js */}
          <Route path="/voter/verification" element={<BiometricVerification />} />

              {/* Camera Sign-Up Page */}
              <Route path="/admin/camera-signup" element={<CameraSignUp />} />
            </Routes>
          </main>

          <Footer />
          
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;