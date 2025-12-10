import { useState, useRef } from "react"; 
import "./Home.css";
import UploadZone from "../../components/UploadZone/UploadZone";
import ProcessingModal from "../../components/ProcessingModal/ProcessingModel";
import SuccessModal from "../../components/SuccessModal/SuccessModal";
import HowToGetFile from "../../components/HowToGetFile/HowToGetFile";
import PrivacyBanner from "../../components/PrivacyBanner/PrivacyBanner";
import Footer from "../../components/Footer/Footer";
import { HelpCircle } from "lucide-react"; 
import { parseConversations } from "../../processing";
import { useNavigate } from "react-router-dom";


export default function Home() {
  const [, setFile] = useState<File | null>(null);
  const [showProcessing, setShowProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  const helpSectionRef = useRef<HTMLDivElement>(null);

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
      // downloadJSON(result, "rewind-output.json");

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
  <>
    <div className="home-container hero-glow">
      <div className="home-banner-wrapper">
        <PrivacyBanner />
      </div>

      <section className="hero-section">
        <h1 className="hero-title">
          ChatGPT <span className="highlight">Rewind ’25</span>
        </h1>
        <p className="hero-subtitle">
          Your year in ChatGPT, analyzed beautifully.
        </p>
      </section>

      <section className="upload-section">
        <UploadZone onFileSelected={handleFileUpload} />
        <button onClick={scrollToHelp} className="help-link-btn">
          <HelpCircle size={16} />
          <span>Where do I find my conversations.json?</span>
        </button>
      </section>

      <section className="help-section" ref={helpSectionRef}>
        <HowToGetFile />
      </section>

      <Footer />
    </div>

    {showProcessing && <ProcessingModal />}
    {showSuccess && (
  <SuccessModal 
    onDashboard={() => navigate("/dashboard")}
    onWrapped={() => navigate("/wrapped")}
  />
)}
  </>
);
}