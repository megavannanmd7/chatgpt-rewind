import { useState, useRef } from "react"; // 1. Import useRef
import "./Home.css";

import UploadZone from "../../components/UploadZone/UploadZone";
import ProcessingModal from "../../components/ProcessingModal/ProcessingModel";
import SuccessModal from "../../components/SuccessModal/SuccessModal";
import HowToGetFile from "../../components/HowToGetFile/HowToGetFile";
import PrivacyBanner from "../../components/PrivacyBanner/PrivacyBanner";
import Footer from "../../components/Footer/Footer";
import { HelpCircle } from "lucide-react"; // Optional: Add an icon
import { parseConversations } from "../../processing";
// import { downloadJSON } from "../../processing/downloadJson";
import { useNavigate } from "react-router-dom";


export default function Home() {
  const [, setFile] = useState<File | null>(null);
  const [showProcessing, setShowProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();


  // 2. Create a ref for the help section
  const helpSectionRef = useRef<HTMLDivElement>(null);

  // 3. Create the scroll function
  const scrollToHelp = () => {
    helpSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleFileUpload = (uploadedFile: File) => {
  setFile(uploadedFile);
  setShowProcessing(true);

  const reader = new FileReader();
  

  reader.onload = () => {
    try {
      const raw = reader.result as string;
      const jsonData = JSON.parse(raw);

      // Run processor
      const result = parseConversations(jsonData);
      sessionStorage.setItem("rewindStats", JSON.stringify(result));


      // Save output locally (for testing)
    //   downloadJSON(result, "rewind-output.json");

      // After everything is done, show success
      setShowProcessing(false);
      setShowSuccess(true);

    } catch (err) {
      console.error("Failed to parse uploaded JSON:", err);
      setShowProcessing(false);
      alert("Invalid JSON file. Please upload conversations.json");
    }
  };

  reader.readAsText(uploadedFile);
};


  return (
    <div className="home-container">
      <PrivacyBanner />

      <section className="hero-section">
        <h1 className="hero-title">
          ChatGPT <span className="highlight">Rewind ’25</span>
        </h1>
        <p className="hero-subtitle">
          Your year in ChatGPT — analyzed beautifully.
        </p>
      </section>

      <section className="upload-section">
        <UploadZone onFileSelected={handleFileUpload} />
        
        {/* 4. Add the Link Here */}
        <button onClick={scrollToHelp} className="help-link-btn">
          <HelpCircle size={16} />
          <span>Where do I find my conversations.json?</span>
        </button>
      </section>

      {/* 5. Attach the ref to the help section */}
      <section className="help-section" ref={helpSectionRef}>
        <HowToGetFile />
      </section>

      {showProcessing && <ProcessingModal />}
      {showSuccess && (
        <SuccessModal onDashboard={() => navigate("/dashboard")} />

      )}
      <Footer />
    </div>
  );
}