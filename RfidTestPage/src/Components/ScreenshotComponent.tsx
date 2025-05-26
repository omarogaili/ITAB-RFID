import React, { useRef, useState } from "react";
import html2canvas from "html2canvas";

const ScreenshotComponent: React.FC = () => {
  const captureRef = useRef<HTMLDivElement>(null);
  const [fileName, setFileName] = useState("");
  const takeScreenshot = async () => {
    if (!captureRef.current) return;
    const canvas = await html2canvas(captureRef.current);
    const image = canvas.toDataURL("image/png"); 
    const link = document.createElement("a");
    link.href = image;
    link.download = fileName ? `${fileName}.png` : "screenshot.png";
    link.click();
  };
  return (
    <div>
      <input
        type="text"
        placeholder="Ange bildnamn"
        value={fileName}
        onChange={(e) => setFileName(e.target.value)}
        className="border p-2 mb-2"
      />
      <div ref={captureRef} className="border p-4 bg-gray-200">
        <h2>Detta är området som tas en bild av</h2>
        <p>Endast detta innehåll sparas som en bild.</p>
      </div>
      <button onClick={takeScreenshot} className="bg-blue-500 text-white p-2 mt-2">
        Ta en bild
      </button>
    </div>
  );
};

export default ScreenshotComponent;
