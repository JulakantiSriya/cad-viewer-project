import { useLocation } from "react-router-dom";
import ModelViewer from "./ModelViewer";

export default function ModelPage() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const fileUrl = decodeURIComponent(params.get("fileUrl"));

  console.log("File URL:", fileUrl);

  return (
    <div>
      <h1>3D Model Viewer</h1>
      {fileUrl ? (
        <ModelViewer modelUrl="http://localhost:3001/uploads/Cube_3d_printing_sample.stl" />
      ) : (
        <p>No file selected</p>
      )}
    </div>
  );
}
