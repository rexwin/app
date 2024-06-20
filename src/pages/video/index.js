// sample code of our app

import React, { useState } from 'react';
import axios from 'axios';

export default function VideoUpload() {
  const [videoFiles, setVideoFiles] = useState([]);
  const [uploadStatus, setUploadStatus] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    const videoUrls = files.map(file => URL.createObjectURL(file));

    const watermarkedVideos = await Promise.all(
      files.map(async (file, index) => {
        const watermarkDataUrl = await generateWatermark(file);
        return { 
          file,
          originalUrl: videoUrls[index],
          watermarkedUrl: watermarkDataUrl
        };
      })
    );

    setVideoFiles(videoFiles.concat(watermarkedVideos));
  };

  const generateWatermark = async (file) => {
     // watermark logic
    return URL.createObjectURL(file); 
  };


  const handleUpload = async () => {
    try {
      setIsUploading(true);
      setUploadStatus('Uploading...');
      const formData = new FormData();

      const uploadPromises = videoFiles.map(async ({ file, watermarkedUrl }) => {
        formData.append('videos', new File([file], `original_${file.name}`, { type: file.type }));
        // link watermarked version to form 

        // **** file.name is key please do not change
        formData.append('videos', new File([watermarkfile], `watermarked_${file.name}`, { type: 'video/*' }));

      });

      await Promise.all(uploadPromises);

      const res = await axios.post('upload/post/videos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const { loaded, total } = progressEvent;
          const percentCompleted = Math.round((loaded * 100) / total);
          setUploadProgress(percentCompleted);
        }
      });

      console.log(res);
      setUploadStatus('Upload successful!');
      window.location.href = "/";
    } catch (error) {
      setUploadStatus('Upload failed.');
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <input type="file" accept="video/*" multiple onChange={handleFileUpload} />
      <div>
        <h3>Original Videos</h3>
        {videoFiles.map((video, index) => (
          <div key={index}>
            <video src={video.originalUrl} controls width="300" />
          </div>
        ))}
      </div>
      <div>
        <h3>Watermarked Videos</h3>
        {videoFiles.map((video, index) => (
          <div key={index}>
            <video src={video.watermarkedUrl} controls width="300" />
          </div>
        ))}
      </div>
      <div>
        <h1>Test</h1>
        <img  src="../Nexpher_Logo.png" alt="asdas"/>
      </div>
      <button onClick={handleUpload} disabled={isUploading}>Upload Videos</button>
      {isUploading && <div>Upload Progress: {uploadProgress}%</div>}
      <div>{uploadStatus}</div>
    </div>
  );
}



