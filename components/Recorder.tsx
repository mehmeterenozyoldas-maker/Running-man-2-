import React, { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';

interface RecorderProps {
  isRecording: boolean;
}

export const Recorder: React.FC<RecorderProps> = ({ isRecording }) => {
  const { gl } = useThree();
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  useEffect(() => {
    if (isRecording) {
      chunks.current = [];
      const canvas = gl.domElement;
      
      // Capture stream at 60fps
      const stream = canvas.captureStream(60);
      
      // Determine supported mime type
      let options = { mimeType: 'video/webm;codecs=vp9' };
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options = { mimeType: 'video/webm;codecs=vp8' };
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
          options = { mimeType: 'video/webm' };
        }
      }

      try {
        const recorder = new MediaRecorder(stream, options);
        mediaRecorder.current = recorder;

        recorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            chunks.current.push(event.data);
          }
        };

        recorder.onstop = () => {
          if (chunks.current.length > 0) {
            const blob = new Blob(chunks.current, { type: options.mimeType });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `neon-gift-${Date.now()}.webm`;
            document.body.appendChild(a);
            a.click();
            
            // Cleanup
            setTimeout(() => {
              document.body.removeChild(a);
              window.URL.revokeObjectURL(url);
            }, 100);
          }
        };

        recorder.start();
        console.log("Recording started...");
      } catch (e) {
        console.error("Failed to start recording:", e);
      }
    } else {
      if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
        mediaRecorder.current.stop();
        console.log("Recording stopped...");
      }
    }
  }, [isRecording, gl]);

  return null;
};
