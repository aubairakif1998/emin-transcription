"use client"; 
import App from "./components/App"; 
import RecordPage from "./components/RecordPage"; 
const Home = () => { 
  return (
    <>
      <div className="h-full overflow-hidden">

        <main className="mx-auto px-4 md:px-6 lg:px-8 h-[calc(100%-4rem)] -mb-[4rem]">
          {/* {showApp ? <>  <RecordPage/>
          
          
          <App /> 
          </> : (
            <div className="transition-opacity duration-500 ease-in-out opacity-100">
              <h1 className="text-center text-2xl font-bold mt-10">
                Welcome to Emin Transcription
              </h1>
              <p className="text-center mt-4">
                Click the button below to start the application.
              </p>
            </div>
          )} */}
          <>  <RecordPage /> 
            <App />
          </>
        </main>
        <div className="fixed bottom-4 right-4 flex space-x-2">
          {/* {showApp ? <button
            className="px-4 py-2 bg-red-500 text-white rounded"
            onClick={() => setShowApp(false)}
          >
            Close App
          </button> : <button
            className="px-4 py-2 bg-blue-500 text-white rounded"
            onClick={() => setShowApp(true)}
          >
            Start App
          </button>} */}

        </div>
      </div>
    </>
  );
};

export default Home;
