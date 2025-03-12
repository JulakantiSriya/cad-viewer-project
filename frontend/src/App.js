import React, { useState } from "react";
import ModelViewer from "./ModelViewer";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [file, setFile] = useState(null);
  const [modelUrl, setModelUrl] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("No file selected.", { autoClose: 3000 }); // Close after 3s
      return;
    }

    const formData = new FormData();
    formData.append("model", file);

    try {
      const response = await axios.post(
        "http://localhost:3100/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      console.log("Upload Response:", response.data);
      setModelUrl(response.data.filePath);

      if (response.data.message === "File already exists") {
        toast.warning(
          "A file with this name already exists. Opening existing file.",
          {
            autoClose: 3000, // Close after 3s
          }
        );
      } else {
        toast.success("File uploaded successfully.", { autoClose: 3000 });
      }

      // Reset file input
      setFile(null);
      document.querySelector("input[type='file']").value = "";
    } catch (error) {
      console.error("Upload Error:", error);
      toast.error("Error uploading file. Please try again.", {
        autoClose: 3000,
      });
    }
  };

  return (
    <div>
      <ToastContainer />
      <h1 style={{ textAlign: "center" }}>CAD Viewer by Sriya Julakanti</h1>
      <input
        style={{ marginBottom: 20 }}
        type="file"
        onChange={handleFileChange}
      />
      <button onClick={handleUpload}>Upload</button>
      {modelUrl && <ModelViewer modelUrl={modelUrl} />}
    </div>
  );
}

export default App;
