import { DeepgramError, createClient } from "@deepgram/sdk";
import { NextResponse, type NextRequest } from "next/server";
const fs = require("fs");
import path from "path";
export const revalidate = 0;
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: 'dvijp5kdq',
  api_key: '727736532384778',
  api_secret: 'GLnfyDuNVkOHcA_ImCh_DfogZ0k'
});
export async function GET(request: NextRequest) {
  // exit early so we don't request 70000000 keys while in devmode
  if (process.env.DEEPGRAM_ENV === "development") {
    return NextResponse.json({
      key: process.env.DEEPGRAM_API_KEY ?? "",
    });
  }

  // gotta use the request object to invalidate the cache every request :vomit:
  const url = request.url;
  const deepgram = createClient(process.env.DEEPGRAM_API_KEY ?? "");

  let { result: projectsResult, error: projectsError } =
    await deepgram.manage.getProjects();

  if (projectsError) {
    return NextResponse.json(projectsError);
  }

  const project = projectsResult?.projects[0];

  if (!project) {
    return NextResponse.json(
      new DeepgramError(
        "Cannot find a Deepgram project. Please create a project first."
      )
    );
  }

  let { result: newKeyResult, error: newKeyError } =
    await deepgram.manage.createProjectKey(project.project_id, {
      comment: "Temporary API key",
      scopes: ["usage:write"],
      tags: ["next.js"],
      time_to_live_in_seconds: 60,
    });

  if (newKeyError) {
    return NextResponse.json(newKeyError);
  }

  const response = NextResponse.json({ ...newKeyResult, url });
  response.headers.set("Surrogate-Control", "no-store");
  response.headers.set(
    "Cache-Control",
    "s-maxage=0, no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  response.headers.set("Expires", "0");

  return response;
}


// export async function POST(req: NextRequest, res: NextResponse) {
//   try {
//     const formData = await req.formData();
//     const file = formData.get('audio') as File; 
//     if (!file) {
//       return NextResponse.json({ error: 'No file provided' });
//     } 
//     const arrayBuffer = await file.arrayBuffer();
//     const buffer = Buffer.from(arrayBuffer);
//     const publicDir = path.join(process.cwd(), 'public');
//     const filePath = path.join(publicDir, `recorded_audio_${Date.now()}.mp3`);
//     fs.writeFileSync(filePath, buffer);

//     const deepgram = createClient(process.env.DEEPGRAM_API_KEY ?? '');

//     // STEP 3: Call the transcribeFile method with the audio payload and options
//     const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
//       // path to the audio file
//       fs.readFileSync(filePath),
//       // STEP 4: Configure Deepgram options for audio analysis
//       {
//         model: 'nova-2',
//         language:'de',
//         smart_format: true,
//       }
//     );

//     if (error) throw error;

//     // Print the results
//     if (result) {
//       console.dir(result, { depth: null });
//       const files = fs.readdirSync(publicDir);
//       files.forEach((file: string) => {
//         console.log('running')
//         if (/^recorded_audio_/.test(file)) {
//           fs.unlinkSync(path.join(publicDir, file));
//         }
//       });
//       return NextResponse.json({ message: 'Transcription completed successfully', result });
//     } 
//   } catch (error) {

//     return NextResponse.json({ error: (error as Error).message });
//   } 
// } 

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('audio') as File;
    if (!file) {
      return NextResponse.json({ error: 'No file provided' });
    } 
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload file to Cloudinary
    const uploadResult : any = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: 'auto' },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
      uploadStream.end(buffer);
    });

    const fileUrl = uploadResult.secure_url;
    console.log(fileUrl)
    if (!fileUrl) {
      return NextResponse.json({ error: 'Failed to upload to Cloudinary' });
    }

    // Transcribe the uploaded file using Deepgram
    const deepgram = createClient(process.env.DEEPGRAM_API_KEY ?? '');
    const { result, error } = await deepgram.listen.prerecorded.transcribeUrl(
      {
        url: fileUrl,
      },
      {
        model: 'nova-2',
        language: 'de',
        smart_format: true,
      }
    );

    if (error) {
      return NextResponse.json({ error });
    }

    return NextResponse.json({ message: 'Transcription completed successfully', result });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message });
  }
}



