import React, { useState, useRef } from 'react';
import './style.css';
interface TranscriptResponse {
  metadata: {
    transaction_key: string;
    request_id: string;
    sha256: string;
    created: string;
    duration: number;
    channels: number;
    models: string[];
    model_info: {
      [key: string]: {
        name: string;
        version: string;
        arch: string;
      };
    };
  };
  results: {
    channels: {
      alternatives: {
        transcript: string;
        confidence: number;
        words: {
          word: string;
          start: number;
          end: number;
          confidence: number;
          punctuated_word: string;
        }[];
        paragraphs: {
          transcript: string;
          paragraphs: {
            sentences: {
              text: string;
              start: number;
              end: number;
            }[];
            num_words: number;
            start: number;
            end: number;
          }[];
        };
      }[];
    }[];
  };
}

function extractTranscript(response: TranscriptResponse): string {
  if (response.results.channels.length > 0 && response.results.channels[0].alternatives.length > 0) {
    return response.results.channels[0].alternatives[0].transcript;
  }
  return '';
}
const RecordPage: React.FC = () => {
  const [recording, setRecording] = useState<boolean>(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [showRecordingIndicator, setShowRecordingIndicator] = useState<boolean>(false);
  const [transcriptionProcessing, setTranscriptionProcessing] = useState<boolean>(false);

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioStream = useRef<MediaStream | null>(null);

  const startRecording = () => {
    setShowRecordingIndicator(true);
    setRecordedChunks([]);
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
    setShowRecordingIndicator(false);
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

  const createDownloadURL = () => {
    if (recordedChunks.length > 0) {
      const blob = new Blob(recordedChunks, { type: 'audio/mp3' });
      const audioURL = URL.createObjectURL(blob);
      const downloadURL = audioURL.replace(/^data:audio\/[^;]+/, 'data:attachment/mp3');
      return downloadURL;
    }
    return '#';
  };

  const uploadAudio = async () => {
    if (recordedChunks.length > 0) {
      setTranscriptionProcessing(true); // Set processing state to true
      const file = new File(recordedChunks, 'recorded_audio.mp3', { type: 'audio/mp3' });
      const formData = new FormData();
      formData.append('audio', file);
      try {
        const response = await fetch('/api/authenticate', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Failed to transcribe file');
        }

        const result = await response.json(); 
        console.log('File transcription successful:', result.result.results);
        const transcript = extractTranscript(result.result as TranscriptResponse);
        if (transcript) {
          alert(transcript);
        } else {
          alert('Transcript not found');
        }
      } catch (error: any) {
        console.error('Error transcribing file:', error.message);
      } finally {
        setTranscriptionProcessing(false); // Reset processing state
      }
    }
  };

  return (
    <div>
      <div className="navbar">
        {recording ? (
          <button onClick={stopRecording} disabled={!recording}>
            Stop Recording
          </button>
        ) : (
          <button onClick={startRecording} disabled={recording || transcriptionProcessing}> {/* Disable button during processing */}
            {transcriptionProcessing ? 'Processing...' : 'Start Recording'} {/* Show processing message if transcription is in progress */}
          </button>
        )}
        <a href={createDownloadURL()} download="recorded_audio.mp3">Download Audio</a>
        <button onClick={uploadAudio} disabled={!recordedChunks.length || transcriptionProcessing}> {/* Disable button during processing */}
          {transcriptionProcessing ? 'Processing...' : 'Generate Transcription'} {/* Show processing message if transcription is in progress */}
        </button>
      </div>
      {showRecordingIndicator && <div className="recording-indicator" />}
    </div>
  );
};

export default RecordPage;
