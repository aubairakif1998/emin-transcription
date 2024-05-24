"use client";
import App from "./components/App";
import RecordPage from "./components/RecordPage";
const Home = () => {
  return (
    <>
      <div className="h-full overflow-hidden">

        <main className="mx-auto px-4 md:px-6 lg:px-8 h-[calc(100%-4rem)] -mb-[4rem]">
          <>  
            <RecordPage />
            <App />
          </>
        </main>
        <div className="fixed bottom-4 right-4 flex space-x-2">
        </div>
      </div>
    </>
  );
};

export default Home;
