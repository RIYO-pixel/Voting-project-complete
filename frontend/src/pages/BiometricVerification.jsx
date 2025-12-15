import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaCamera, FaUserShield } from 'react-icons/fa';

function BiometricVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get candidate details passed from the previous Check page
  const { candidate } = location.state || {}; 

  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [cameraError, setCameraError] = useState(false);

  // Environment variables (Assumed based on your reference)
  const FLASK_URL = import.meta.env.VITE_PORT_FLASK; 

  // --- 1. START CAMERA ON MOUNT ---
  useEffect(() => {
    if (!candidate) {
      toast.error("No candidate selected. Redirecting...");
      setTimeout(() => navigate('/check-candidate'), 2000);
      return;
    }

    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        setCameraError(false);
      } catch (err) {
        console.error("Camera Error:", err);
        setCameraError(true);
        toast.error("Unable to access camera. Please check permissions.");
      }
    };

    startCamera();

    // Cleanup: Stop camera tracks when component unmounts
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
    // eslint-disable-next-line
  }, []);

  // --- 2. CAPTURE & VERIFY LOGIC ---
  const handleVerify = async () => {
    if (!videoRef.current) return;

    setIsVerifying(true);

    try {
      // A. Draw video frame to canvas
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

      // B. Convert to Base64 (remove data prefix)
      const base64Image = canvas.toDataURL("image/jpeg").split(",")[1];

      // C. Send to Python/Flask Backend for Face Match
      // Using candidate.epicNo (or candidate.id) as the unique identifier to match against
      const response = await axios.post(`${FLASK_URL}/face/verify`, {
        user_id: candidate.epicNo, // Ensure this matches how you registered faces
        image: base64Image
      });

      // D. Handle Result
      if (response.data.verified) {
        toast.success("Biometric Verification Successful!");
        
        // Stop Camera
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }

        // Redirect to Voting Page
        setTimeout(() => {
            navigate('/vote-confirmation', { state: { candidate } });
        }, 1000);

      } else {
        toast.error("Face Mismatch! Please try again.");
      }

    } catch (err) {
      console.error("Verification API Error:", err);
      // Fallback for demo purposes if backend isn't running
      toast.error("Verification Server Error. (Check Flask Console)");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <ToastContainer position="top-center" autoClose={3000} />

      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-2xl overflow-hidden border border-gray-200">
        
        {/* Top Strip */}
        <div className="h-2 bg-gradient-to-r from-orange-500 via-white to-green-600"></div>

        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex flex-col items-center">
           <img 
             src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Emblem_of_India.svg/1200px-Emblem_of_India.svg.png" 
             alt="Emblem" className="h-12 w-auto mb-2" 
           />
           <h2 className="text-2xl font-serif font-bold text-blue-900">Biometric Verification</h2>
           <p className="text-gray-500 text-sm uppercase tracking-widest">Election Commission of India</p>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
            
            {/* LEFT: CANDIDATE INFO */}
            <div className="flex flex-col justify-center space-y-6">
                <div className="bg-blue-50 border-l-4 border-blue-900 p-5 rounded-r-lg">
                    <h3 className="text-sm font-bold text-gray-500 uppercase mb-1">Verifying Voter</h3>
                    <p className="text-2xl font-bold text-blue-900">{candidate?.name || "Unknown"}</p>
                    <p className="text-md font-mono text-gray-700 mt-1">EPIC: {candidate?.epicNo}</p>
                </div>

                <div className="text-gray-600 text-sm space-y-2">
                    <p className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        Ask the voter to look directly at the camera.
                    </p>
                    <p className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        Ensure proper lighting on the face.
                    </p>
                    <p className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        Remove masks or sunglasses.
                    </p>
                </div>

                {/* Back Button */}
                <button 
                    onClick={() => navigate(-1)}
                    className="text-gray-400 hover:text-gray-600 text-sm font-bold flex items-center gap-2 w-fit mt-4"
                >
                    ← Back to Search
                </button>
            </div>

            {/* RIGHT: CAMERA FEED */}
            <div className="flex flex-col items-center">
                <div className="relative w-full max-w-sm aspect-[4/3] bg-black rounded-lg overflow-hidden shadow-inner border-4 border-gray-200">
                    
                    {/* Video Element */}
                    <video 
                        ref={videoRef}
                        autoPlay 
                        muted 
                        className={`w-full h-full object-cover transform scale-x-[-1] ${cameraError ? 'hidden' : ''}`} 
                    />

                    {/* Camera Error State */}
                    {cameraError && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
                            <FaCamera className="text-4xl mb-2" />
                            <p>Camera Not Available</p>
                        </div>
                    )}

                    {/* Scanning Animation Overlay */}
                    {!cameraError && !isVerifying && (
                        <div className="absolute inset-0 pointer-events-none">
                            <div className="w-full h-full border-2 border-blue-400 opacity-50 relative">
                                <div className="absolute top-0 left-0 w-full h-1 bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.8)] animate-scan"></div>
                            </div>
                            {/* Face Frame Markers */}
                            <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-white opacity-70"></div>
                            <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-white opacity-70"></div>
                            <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-white opacity-70"></div>
                            <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-white opacity-70"></div>
                        </div>
                    )}

                    {/* Loading Overlay */}
                    {isVerifying && (
                        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-10 backdrop-blur-sm">
                            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                            <p className="text-white font-bold tracking-widest text-sm animate-pulse">VERIFYING...</p>
                        </div>
                    )}
                </div>

                {/* Capture Button */}
                <button
                    onClick={handleVerify}
                    disabled={isVerifying || cameraError}
                    className={`mt-6 w-full max-w-sm py-4 rounded-lg font-bold text-white uppercase tracking-wider shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2
                        ${isVerifying || cameraError 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-blue-900 hover:bg-blue-800 hover:shadow-xl'
                        }`}
                >
                    <FaUserShield className="text-lg" />
                    {isVerifying ? 'Processing...' : 'Verify Identity'}
                </button>
            </div>

        </div>
      </div>
    </div>
  );
}

export default BiometricVerification;