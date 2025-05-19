import React, { useState } from "react";

const Form = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);

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
    if (!selectedFile) return alert("Please select an image.");

    const formData = new FormData();
    formData.append("image", selectedFile);

    const response = await fetch("http://localhost:5000/api/check-haziness", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();
    console.log(result);
    alert(`Image is: ${result.status}, Blurriness: ${result.blurriness_score}`);
    // Optional: display enhanced image using result.enhanced_image
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4 text-center">File Upload</h2>

        <label
          htmlFor="fileInput"
          className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center cursor-pointer
           hover:border-blue-500"
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
      </div>
    </div>
  );
};

export default Form;
