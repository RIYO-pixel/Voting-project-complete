import React, { useRef, useState, useEffect } from 'react';
import { FaCheck, FaCamera, FaArrowLeft, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

function CameraSignUp() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [photos, setPhotos] = useState([]);
  const [streaming, setStreaming] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { userId } = useParams();

  const {epicNo} = location.state || {};  
  const { candidate } = location.state || {};

  useEffect(() => {
    if (!candidate && !userId) {
      // navigate("/check-candidate");
    }
  }, []);

  // ---------------- START CAMERA ----------------
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          setStreaming(true);
        };
      }
    } catch (error) {
      toast.error("Camera permission denied");
      console.error(error);
    }
  };

  // ---------------- TAKE PHOTO ----------------
  const takePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    if (video.videoWidth === 0 || video.videoHeight === 0) {
      console.log("Video not ready");
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = canvas.toDataURL("image/jpeg");

    setPhotos(prev => [...prev, imageData]);
    toast.success(`Captured photo ${photos.length + 1}`);
  };

  // ---------------- STOP CAMERA ----------------
  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(t => t.stop());
    }
    setStreaming(false);
  };

  // ---------------- RESET ----------------
  const resetPhotos = () => setPhotos([]);

  // ---------------- SEND DATA ----------------
 const sendFaceData = async () => {

  console.log("Sending face data for EPIC No:", epicNo);
 const BASE_URL = import.meta.env.VITE_PORT;
  if (photos.length < 5) {
    toast.warning("Capture all 5 face angles");
    return;
  }

  if (!epicNo) {
    toast.error("EPIC number missing. Please retry verification.");
    return;
  }

  setLoading(true);
  stopCamera();

  try {
    const payload = {
      epicNo: epicNo,
      face_data: photos, // already base64 strings
    };

    const response = await axios.post(
      `${BASE_URL}/api/admin/register-face`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
        timeout: 30000,
      }
    );

    const data = response.data;

    // 🔴 Backend logical failure
    if (!data || data.status !== "success") {
      throw new Error(data?.message || "Face registration failed");
    }

    // ✅ SUCCESS
    toast.success("Biometric registered successfully!");
    navigate("/verification-success", { state: { candidate } });

  } catch (error) {
    console.error("Face registration error:", error);

    // 🟡 Backend responded with error
    if (error.response) {
      const message =
        error.response.data?.message ||
        error.response.data?.error ||
        "Verification failed";

      toast.error(message);
    }
    // 🟠 Request sent but no response
    else if (error.request) {
      toast.error("Server not reachable. Please try again.");
    }
    // 🔴 Frontend / Axios error
    else {
      toast.error(error.message || "Unexpected error occurred");
    }

    setLoading(false);
  }
};


  // ---------------- STEPPER ----------------
  const renderStepper = () => (
    <div className="flex justify-center gap-3 my-6">
      {[1, 2, 3, 4, 5].map((step, index) => {
        const isCompleted = index < photos.length;
        const isActive = index === photos.length;

        return (
          <div
            key={step}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all
              ${isCompleted ? "bg-green-600 text-white border-green-600" : ""}
              ${isActive ? "bg-white text-blue-900 border-blue-900 ring-2 ring-blue-200" : ""}
              ${!isCompleted && !isActive ? "bg-gray-100 text-gray-400 border-gray-300" : ""}
            `}
          >
            {isCompleted ? <FaCheck /> : step}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="w-full max-w-3xl mx-auto my-8 px-4">
      <ToastContainer />

      <div className="bg-white rounded-lg shadow-2xl overflow-hidden border border-gray-200">
        <div className="h-1 bg-gradient-to-r from-orange-500 to-green-600"></div>

        <div className="p-5 border-b bg-gray-50 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Emblem_of_India.svg/1200px-Emblem_of_India.svg.png"
              className="h-12"
            />
            <div>
              <p className="text-[10px] font-bold text-gray-500 tracking-widest uppercase">
                Election Commission of India
              </p>
              <h2 className="text-lg font-bold text-blue-900">Biometric Registration</h2>
            </div>
          </div>

        </div>

        {candidate && (
          <div className="bg-blue-50 px-6 py-2 border-b text-center text-blue-800 text-sm">
            Registration for: <b>{candidate.name}</b> ({candidate.epicNo})
          </div>
        )}

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* LEFT SIDE */}
          <div className="flex flex-col items-center">
            <div className="relative w-full max-w-[300px] aspect-[4/3] bg-black rounded-lg overflow-hidden border-4 border-gray-900">

              {/* CAMERA FRAME */}
              <div className="absolute top-1 left-1 w-4 h-4 border-t-2 border-l-2 border-white"></div>
              <div className="absolute top-1 right-1 w-4 h-4 border-t-2 border-r-2 border-white"></div>
              <div className="absolute bottom-1 left-1 w-4 h-4 border-b-2 border-l-2 border-white"></div>
              <div className="absolute bottom-1 right-1 w-4 h-4 border-b-2 border-r-2 border-white"></div>

              {!streaming && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                  <FaCamera size={34} />
                  <p className="text-[11px] mt-1 font-semibold">Camera Offline</p>
                </div>
              )}

              {/* FIXED — ALWAYS VISIBLE */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                width={320}
                height={240}
                className="absolute inset-0 w-full h-full object-cover transition-opacity"
                style={{ opacity: streaming ? 1 : 0.2 }}
              />

              <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* BUTTONS */}
            <div className="mt-4 flex gap-3 w-full max-w-[300px]">
              {!streaming ? (
                <button
                  onClick={startCamera}
                  className="flex-1 bg-blue-900 text-white py-2 rounded font-bold hover:bg-blue-800"
                >
                  <FaCamera className="inline mr-1" />
                  Activate Camera
                </button>
              ) : (
                <>
                  <button
                    onClick={takePhoto}
                    disabled={photos.length >= 5}
                    className="flex-1 bg-white border-2 border-blue-900 text-blue-900 py-2 rounded font-bold"
                  >
                    Capture
                  </button>

                  <button
                    onClick={stopCamera}
                    className="px-4 bg-red-200 text-red-800 rounded"
                  >
                    <FaTimes />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="flex flex-col">
            <div className="bg-blue-50 border-l-4 border-blue-700 p-3 rounded">
              <p className="text-xs text-blue-800">
                Capture <b>5 distinct angles</b> (Front, left, right, up, down)
              </p>
            </div>

            <p className="text-xs text-center mt-4 mb-1 text-gray-500 font-bold uppercase">
              Capture Progress
            </p>

            {renderStepper()}

            {/* PHOTO PREVIEW */}
            <div className="grid grid-cols-5 gap-2 mt-3">
              {photos.map((photo, index) => (
                <div
                  key={index}
                  className="aspect-square rounded border overflow-hidden relative"
                >
                  <img src={photo} className="w-full h-full object-cover" />
                  <div className="absolute top-1 right-1 bg-green-500 text-white text-[8px] rounded-full p-1">
                    <FaCheck />
                  </div>
                </div>
              ))}

              {[...Array(5 - photos.length)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-square border-2 border-dashed flex items-center justify-center text-gray-300"
                >
                  {photos.length + i + 1}
                </div>
              ))}
            </div>

            <button
              disabled={photos.length < 5}
              onClick={sendFaceData}
              className="mt-6 w-full bg-green-600 text-white py-3 rounded font-bold uppercase disabled:bg-gray-300"
            >
              {loading ? "Verifying..." : "Verify Biometrics"}
            </button>

            {photos.length > 0 && (
              <button
                onClick={resetPhotos}
                className="mt-2 text-xs text-red-600 font-bold underline"
              >
                Reset All Photos
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CameraSignUp;
