"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChess,
  faChessKnight,
  faCrown,
  faGraduationCap,
} from "@fortawesome/free-solid-svg-icons";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to auth page by default
    router.push("/auth");
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDYwIDYwIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIG9wYWNpdHk9Ii4wNiI+PHBhdGggZD0iTTAgMGg2MHY2MEgweiIvPjwvZz48ZyBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iLjUiPjxwYXRoIGQ9Ik0yMCAyMGg0djRoLTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-5"></div>

      <div className="w-full max-w-4xl mx-auto text-center">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="p-8 md:p-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-100 rounded-2xl mb-6">
              <FontAwesomeIcon
                icon={faChessKnight}
                className="text-4xl text-indigo-600"
              />
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Welcome to <span className="text-indigo-600">Chess Stars</span>
            </h1>

            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              The premier platform for chess coaching and training. Connect with
              expert trainers and improve your game.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 max-w-4xl mx-auto">
              <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-xl border border-indigo-100">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <FontAwesomeIcon
                    icon={faGraduationCap}
                    className="text-indigo-600 text-xl"
                  />
                </div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">
                  Expert Training
                </h3>
                <p className="text-gray-600 text-sm">
                  Learn from professional chess coaches with years of experience
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-xl border border-purple-100">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <FontAwesomeIcon
                    icon={faChess}
                    className="text-purple-600 text-xl"
                  />
                </div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">
                  Interactive Sessions
                </h3>
                <p className="text-gray-600 text-sm">
                  Real-time video lessons with interactive chessboards
                </p>
              </div>

              <div className="bg-gradient-to-br from-cyan-50 to-white p-6 rounded-xl border border-cyan-100">
                <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <FontAwesomeIcon
                    icon={faCrown}
                    className="text-cyan-600 text-xl"
                  />
                </div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">
                  Skill Development
                </h3>
                <p className="text-gray-600 text-sm">
                  Track your progress and improve your chess rating
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => router.push("/auth")}
                className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:from-indigo-700 hover:to-purple-700 transform hover:-translate-y-0.5 transition-all duration-200"
              >
                Get Started
              </button>

              <button
                onClick={() => router.push("/auth")}
                className="px-8 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Chess Stars. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
