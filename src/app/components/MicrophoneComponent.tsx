// import { useEffect, useState, useRef } from "react";

// declare global {
//   interface Window {
//     webkitSpeechRecognition: any;
//   }
// }

// export default function MicrophoneComponent() {
//   const [transcript, setTranscript] = useState("");
//   const recognitionRef = useRef<any>(null);

//   useEffect(() => {
//     // Start recording when the component mounts
//     startRecording();

//     // Stop recording and clean up when the component unmounts
//     return () => {
//       stopRecording();
//     };
//   }, []);

//   const startRecording = () => {
//     recognitionRef.current = new window.webkitSpeechRecognition();
//     recognitionRef.current.continuous = true;
//     recognitionRef.current.interimResults = true;

//     recognitionRef.current.onresult = (event: any) => {
//       const { transcript } = event.results[event.results.length - 1][0];
//       setTranscript(transcript);
//     };

//     recognitionRef.current.start();
//   };

//   const stopRecording = () => {
//     if (recognitionRef.current) {
//       recognitionRef.current.stop();
//     }
//   };

//   return (
//     <div className="flex items-center justify-center h-screen w-full">
//       <div className="w-full">
//         <div className="w-1/4 m-auto rounded-md border p-4 bg-white">
//           <div className="flex-1 flex w-full justify-between">
//             <div className="space-y-1">
//               <p className="text-sm font-medium leading-none text-black">
//                 Recording
//               </p>
//               <p className="text-sm text-muted-foreground text-black">
//                 Start speaking...
//               </p>
//             </div>
//             <div className="rounded-full w-4 h-4 bg-red-400 animate-pulse" />
//           </div>

//           {transcript && (
//             <div className="border rounded-md p-2 h-fullm mt-4">
//               <p className="mb-0 text-black">{transcript}</p>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
