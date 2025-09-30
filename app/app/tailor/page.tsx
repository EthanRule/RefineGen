"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/footer/Footer";
import LoadingCard from "../components/ui/LoadingCard";
import ControlPanel from "./components/ControlPanel";
import ResumeView from "./components/ResumeView";

export default function Tailor() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-800">
        <Header props={{ status, session }} />
        <main className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <LoadingCard />
            <p className="text-white mt-4">Checking authentication...</p>
          </div>
        </main>
        <Footer props={{ status, session }} />
      </div>
    );
  }

  // Redirect if not authenticated
  if (status === "unauthenticated") {
    return null;
  }

  // Show the tailor page for authenticated users
  return (
    <div className="min-h-screen bg-gray-800">
      <Header props={{ status, session }} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Content Area */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[80vh]">
            <ControlPanel />
            <ResumeView />
          </div>
        </div>
      </main>
      <Footer props={{ status, session }} />
    </div>
  );
}
