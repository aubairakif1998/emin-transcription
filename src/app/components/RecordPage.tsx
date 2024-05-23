import React, { useState, useRef } from 'react';
import './style.css'
import { createClient }   from "@deepgram/sdk" ; 

const RecordPage: React.FC = () => {
  const [recording, setRecording] = useState<boolean>(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [audioPlayerSrc, setAudioPlayerSrc] = useState<string>('');
  const [showRecordingIndicator, setShowRecordingIndicator] = useState<boolean>(false);

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioStream = useRef<MediaStream | null>(null);

  const startRecording = () => {
    setShowRecordingIndicator(true); // Show recording indicator
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        audioStream.current = stream;
        mediaRecorder.current = new MediaRecorder(stream);

        mediaRecorder.current.addEventListener('dataavailable', handleDataAvailable);
        mediaRecorder.current.start();

        setRecording(true);
      })
      .catch((error) => {
        console.error('Error accessing microphone:', error);
      });
  };

  const stopRecording = () => {
    setShowRecordingIndicator(false); // Hide recording indicator
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
    }
    if (audioStream.current) {
      audioStream.current.getTracks().forEach((track) => track.stop());
    }

    setRecording(false);
  };

  const handleDataAvailable = (event: BlobEvent) => {
    if (event.data.size > 0) {
      setRecordedChunks((prevChunks) => [...prevChunks, event.data]);
    }
  };

  const playRecordedAudio = () => {
    if (recordedChunks.length > 0) {
      const blob = new Blob(recordedChunks, { type: 'audio/mp3' });
      const audioURL = URL.createObjectURL(blob);
      setAudioPlayerSrc(audioURL);
    }
  };

  const createDownloadURL = () => {
    if (recordedChunks.length > 0) {
      const blob = new Blob(recordedChunks, { type: 'audio/mp3' });
      const audioURL = URL.createObjectURL(blob);
      const downloadURL = audioURL.replace(/^data:audio\/[^;]+/, 'data:attachment/mp3');
      return downloadURL;
    }
    return '#'; // Return a fallback URL or handle this case as needed
  };
  

  // index.js (node example)

  const uploadAudio = async () => {
    if (recordedChunks.length > 0) {
      const file = new File(recordedChunks, 'recorded_audio.mp3', { type: 'audio/mp3' });
      const formData = new FormData();
      formData.append('audio', file);
      const deepgram = createClient("747779c1611091dea34cca02650e5ee66a58585e");
  
      try {
        const { results } = await deepgram.transcription.preRecorded({
          buffer: recordedChunks,
          mimetype: 'audio/mp3',
        }, {
          model: "nova-2",
          smart_format: true,
        });
  
        console.dir(results, { depth: null });
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <div>
      <h1>Record Page</h1>
      <button onClick={startRecording} disabled={recording}>
        Start Recording
      </button>
      <button onClick={stopRecording} disabled={!recording}>
        Stop Recording
      </button>
      <button onClick={playRecordedAudio} disabled={!recordedChunks.length}>
        Play Recorded Audio
      </button>
      <audio controls src={audioPlayerSrc} />
      <a href={createDownloadURL()} download="recorded_audio.mp3">Download Audio</a>
      <button onClick={uploadAudio} disabled={!recordedChunks.length}>
        Upload Audio
      </button>
      {showRecordingIndicator && <div className="recording-indicator" />} {/* Display recording indicator */}
    </div>
  );
};

export default RecordPage;
