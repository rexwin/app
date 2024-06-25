import React, { useState } from 'react';
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';
export default function VideoUpload() {
    const [videoFile, setVideoFile] = useState(null);
    const [processedVideoUrl, setProcessedVideoUrl] = useState(null);
    const [message, setMessage] = useState("");
    const ffmpeg = createFFmpeg({ log: true });

    const loadFFmpeg = async () => {
        setMessage("正在加载 FFmpeg...");
        try {
            await ffmpeg.load();
        } catch (error) {
            console.error("FFmpeg 加载失败:", error);
            setMessage("FFmpeg 加载失败，请重试。");
        }
    };
// 新的函数，用于获取服务器上的照片文件并写入虚拟文件系统
    const loadPhotoFromServer = async () => {
        try {
            const response = await fetch('./watermark_logo.png'); // 替换为实际的服务器地址和照片路径
            const photoData = await response.arrayBuffer();
            console.log("服务器上的照片文件大小。"+photoData.byteLength);
            ffmpeg.FS('writeFile', 'photo.png', new Uint8Array(photoData));
            console.log("服务器上的照片文件已写入虚拟文件系统中。");
        } catch (error) {
            console.error("加载照片文件失败:", error);
        }
    };
    const handleFileChange = (event) => {
        setVideoFile(event.target.files[0]);
    };
    const handleProcessVideo = async () => {
        if (!videoFile) {
            setMessage("请先选择一个视频文件。");
            return;
        }
        setMessage("正在加载 FFmpeg...");
        await loadFFmpeg();

        try {
            await loadPhotoFromServer(); // 调用新的函数加载照片文件
            ffmpeg.FS('writeFile', 'input.mp4', await fetchFile(videoFile));
            setMessage("正在压缩视频...");
            console.log("开始压缩视频...");
            // 压缩视频
       await ffmpeg.run('-i', 'input.mp4', '-vcodec', 'libx264', '-crf', '28', '-preset', 'fast', 'compressed.mp4');
            setMessage("正在添加水印...");
            console.log("开始添加水印...");
           await ffmpeg.run('-i', 'compressed.mp4', '-i', 'photo.png', '-filter_complex', 'overlay=(main_w-overlay_w)/2:(main_h-overlay_h)/2', 'output.mp4');
          //  await ffmpeg.run('-i', 'input.mp4', '-i', 'photo.png', '-filter_complex', '[1:v]scale=100:100[watermark];[0:v][watermark]overlay=(main_w-overlay_w)/2:(main_h-overlay_h)/2', '-codec:a', 'copy', 'output.mp4');
         //   await ffmpeg.run('-i', 'input.mp4', '-i', 'photo.png', '-filter_complex', '[1:v]format=rgba,colorchannelmixer=aa=0 [scaled_watermark];[0:v][scaled_watermark]overlay=(main_w-overlay_w)/2:(main_h-overlay_h)/2', '-codec:a', 'copy', 'output.mp4');

            console.log("输出文件列表:", ffmpeg.FS('readdir', '/'));
            const data = ffmpeg.FS('readFile', 'output.mp4');
            const videoBlob = new Blob([data.buffer], { type: 'video/mp4' });
            const videoUrl = URL.createObjectURL(videoBlob);
            console.log("生成的Blob URL:", videoUrl);
            setProcessedVideoUrl(videoUrl);

            setMessage("视频处理完成，可以预览。");
        } catch (error) {
            console.error("视频处理失败:", error);
            setMessage("视频处理失败，请重试。");
        }
    };

    return (
        <div>
            <h1>上传并处理视频</h1>
            <input type="file" accept="video/*" onChange={handleFileChange} />
            <button onClick={handleProcessVideo}>压缩并添加水印</button>
            {processedVideoUrl && (
                <div>
                    <h2>处理后的视频预览</h2>
                    <video src={processedVideoUrl} controls width="600"></video>
                </div>
            )}
            <p>{message}</p>
        </div>
    );
}
