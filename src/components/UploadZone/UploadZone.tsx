import { useRef, useState } from "react";
import "./UploadZone.css";
import { Upload, FileJson } from "lucide-react";


interface UploadZoneProps {
  onFileSelected: (file: File) => void;
}

export default function UploadZone({ onFileSelected }: UploadZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const triggerInput = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelected(file);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const onDragLeave = () => setIsDragOver(false);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const file = e.dataTransfer.files?.[0];
    if (file) onFileSelected(file);
  };

  return (
    <div
      className={`uploadzone-container ${isDragOver ? "drag" : ""}`}
      onClick={triggerInput}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {/* Decorative animated corners */}
      <div className="corner tl" />
      <div className="corner tr" />
      <div className="corner bl" />
      <div className="corner br" />

      <div className="uploadzone-content">
        <div className={`upload-icon-wrapper ${isDragOver ? "active" : ""}`}>
          {isDragOver ? (
          <FileJson className="upload-icon json-icon" />
            ) : (
          <Upload className="upload-icon upload-main-icon" />
                )}
        </div>


        <p className="upload-title">
          {isDragOver ? (
            <span className="highlight">Drop your file here</span>
          ) : (
            <>
              Drop your <span className="highlight">conversations.json</span> or
              click to upload
            </>
          )}
        </p>

        <p className="upload-subtext">Your ChatGPT export file • Max 500MB</p>

        <div className="upload-badge">
          ✨ Instant analysis • No sign-up required
        </div>
      </div>

      <input
        type="file"
        accept=".json"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="file-input-hidden"
      />
    </div>
  );
}
