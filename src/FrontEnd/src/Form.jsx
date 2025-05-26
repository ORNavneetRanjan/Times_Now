import React, { useState } from "react";

import { judgeImageWithGemini } from "./api/main.js";

const Form = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [aiResponse, setAiResponse] = useState("");
  const [enhancedImage, setEnhancedImage] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      return alert("Please select an image.");
    }

    try {
      // Convert file to Base64
      const toBase64 = (file) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result.split(",")[1]);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      const imageBase64 = await toBase64(selectedFile);

      // First Gemini call (raw image)
      const initialResponse = await judgeImageWithGemini({
        userDescription: `This is a raw image captured recently.
          I want to find that if this image making much value to any business
           for e.g. image without anything prominent, hazzy. 
           Like I am making a project to identify such images for times network
            media channel to identify images with some values that can help extract some information.`,
        result: { imageBase64 },
      });
      console.log("Initial Gemini judgment:", initialResponse);

      let flaskResult = null;
      if (/blurry|hazy|low/i.test(initialResponse)) {
        const formData = new FormData();
        formData.append("image", selectedFile);

        const response = await fetch(
          "http://localhost:5000/api/check-haziness",
          {
            method: "POST",
            body: formData,
          }
        );

        flaskResult = await response.json();
        console.log("Flask response:", flaskResult);

        // Second Gemini call with enhanced info
        const finalResponse = await judgeImageWithGemini({
          userDescription: `Enhanced image details: blurriness_score=${flaskResult.blurriness_score}, status=${flaskResult.status}. Please reassess its business value.`,
          result: flaskResult,
        });
        console.log("Final Gemini judgment:", finalResponse);
        setAiResponse(finalResponse);
        setEnhancedImage(flaskResult.enhanced_image);
      } else {
        setAiResponse(initialResponse);
      }
    } catch (err) {
      console.error("Upload/processing error:", err);
      alert("Something went wrong.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4 text-center">File Upload</h2>

        <label
          htmlFor="fileInput"
          className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center cursor-pointer hover:border-blue-500"
        >
          <input
            id="fileInput"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          {preview ? (
            <img
              src={preview}
              alt="Preview"
              className="mx-auto max-h-48 rounded"
            />
          ) : (
            <>
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16V4m0 0L3 8m4-4l4 4M3 16h18"
                />
              </svg>
              <p className="mt-2 text-sm text-gray-500">
                Click or drag image to this area to upload
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Only image formats accepted
              </p>
            </>
          )}
        </label>

        <div className="mt-4 flex justify-between">
          <button className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100">
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={handleUpload}
          >
            Continue
          </button>
        </div>

        {aiResponse && (
          <div className="mt-6">
            <h3 className="text-md font-semibold">AI Judgment:</h3>
            <p className="text-gray-700 mt-2">{aiResponse}</p>
          </div>
        )}

        {enhancedImage && (
          <div className="mt-4">
            <h3 className="text-md font-semibold">Enhanced Image:</h3>
            <img
              src={enhancedImage}
              alt="Enhanced"
              className="mt-2 rounded max-h-64"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Form;
