"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faVideo,
  faCalendar,
  faClock,
  faUsers,
  faUser,
  faChess,
  faComments,
} from "@fortawesome/free-solid-svg-icons";
import { api, User, Lesson } from "@/lib/api";

export default function StudentDashboard() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [availableLessons, setAvailableLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchUserAndLessons();
  }, []);

  const fetchUserAndLessons = async () => {
    try {
      const user = await api.getProfile();
      setCurrentUser(user);

      // Fetch student's assigned lessons
      const studentLessons = await api.getLessons();
      setLessons(studentLessons);

      // If student has a trainer, fetch trainer's active lessons
      if (user.trainerId) {
        const trainerLessons = await api.getTrainerActiveLessons(
          user.trainerId
        );
        setAvailableLessons(trainerLessons);
      }
    } catch (err) {
      setError("Failed to load user information");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const joinLesson = async (lessonId: string) => {
    try {
      await api.joinLesson(lessonId);
      // Redirect to virtual classroom
      router.push(`/virtual-classroom/${lessonId}`);
    } catch (err) {
      setError("Failed to join lesson");
      console.error(err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "in_progress":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTrainerDisplayName = (trainer: User) => {
    if (trainer.firstName && trainer.lastName) {
      return `${trainer.firstName} ${trainer.lastName}`;
    }
    return trainer.username;
  };

  const isLessonJoinable = (lesson: Lesson) => {
    return lesson.status === "scheduled" || lesson.status === "in_progress";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <FontAwesomeIcon
                icon={faChess}
                className="text-indigo-600 text-xl mr-3"
              />
              <h1 className="text-xl font-semibold text-gray-900">
                Student Dashboard
              </h1>
            </div>
            <button
              onClick={() => router.push("/student-profile")}
              className="flex items-center text-sm font-medium text-gray-700 hover:text-indigo-600"
            >
              <FontAwesomeIcon icon={faUser} className="mr-2" />
              My Profile
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex justify-between items-center">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700"
            >
              <FontAwesomeIcon icon={faComments} />
            </button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FontAwesomeIcon
                  icon={faUser}
                  className="text-blue-600 text-lg"
                />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Trainer</p>
                <p className="text-lg font-semibold text-gray-900">
                  {currentUser?.trainerId ? "Assigned" : "Not Assigned"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <FontAwesomeIcon
                  icon={faCalendar}
                  className="text-green-600 text-lg"
                />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Upcoming Lessons
                </p>
                <p className="text-lg font-semibold text-gray-900">
                  {lessons.filter((l) => l.status === "scheduled").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <FontAwesomeIcon
                  icon={faUsers}
                  className="text-purple-600 text-lg"
                />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Completed Lessons
                </p>
                <p className="text-lg font-semibold text-gray-900">
                  {lessons.filter((l) => l.status === "completed").length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Available Active Lessons */}
        {currentUser?.trainerId && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <FontAwesomeIcon
                  icon={faVideo}
                  className="text-green-500 mr-2"
                />
                Active Lessons You Can Join
              </h2>
              {availableLessons.length === 0 && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  No active lessons
                </span>
              )}
            </div>

            {availableLessons.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableLessons.map((lesson) => (
                  <div
                    key={`available-${lesson.id}`}
                    className="bg-white rounded-xl shadow-sm overflow-hidden border border-green-200 hover:shadow-md transition-all"
                  >
                    <div className="p-5 bg-green-50 border-b border-green-100">
                      <div className="flex justify-between items-start">
                        <h3 className="text-base font-semibold text-gray-900 line-clamp-1">
                          {lesson.title}
                        </h3>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 animate-pulse">
                          LIVE
                        </span>
                      </div>
                    </div>
                    <div className="p-5">
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {lesson.description}
                      </p>

                      <div className="space-y-3 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <FontAwesomeIcon
                            icon={faUser}
                            className="mr-2 text-gray-400"
                          />
                          <span className="truncate">
                            {getTrainerDisplayName(lesson.trainer)}
                          </span>
                        </div>

                        <div className="flex items-center text-sm text-gray-600">
                          <FontAwesomeIcon
                            icon={faCalendar}
                            className="mr-2 text-gray-400"
                          />
                          <span>{formatDateTime(lesson.scheduledAt)}</span>
                        </div>

                        <div className="flex items-center text-sm text-gray-600">
                          <FontAwesomeIcon
                            icon={faClock}
                            className="mr-2 text-gray-400"
                          />
                          <span>{lesson.durationMinutes} minutes</span>
                        </div>
                      </div>

                      <button
                        onClick={() => joinLesson(lesson.id)}
                        className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center"
                      >
                        <FontAwesomeIcon icon={faVideo} className="mr-2" />
                        Join Live Lesson
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-100">
                <FontAwesomeIcon
                  icon={faVideo}
                  className="text-3xl text-gray-400 mb-4"
                />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Active Lessons Available
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Your trainer hasn't started any lessons yet. Active lessons
                  will appear here when they become available.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Your Assigned Lessons */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Your Scheduled Lessons
          </h2>

          {lessons.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-100">
              <FontAwesomeIcon
                icon={faCalendar}
                className="text-3xl text-gray-400 mb-4"
              />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No lessons scheduled yet
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Make sure you have selected a trainer in your profile. Your
                trainer will create lessons for you.
              </p>
              <button
                onClick={() => router.push("/student-profile")}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center mx-auto"
              >
                <FontAwesomeIcon icon={faUser} className="mr-2" />
                Select Trainer
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-all"
                >
                  <div className="p-5 border-b border-gray-100">
                    <div className="flex justify-between items-start">
                      <h3 className="text-base font-semibold text-gray-900 line-clamp-1">
                        {lesson.title}
                      </h3>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          lesson.status
                        )}`}
                      >
                        {lesson.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {lesson.description}
                    </p>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <FontAwesomeIcon
                          icon={faUser}
                          className="mr-2 text-gray-400"
                        />
                        <span className="truncate">
                          {getTrainerDisplayName(lesson.trainer)}
                        </span>
                      </div>

                      <div className="flex items-center text-sm text-gray-600">
                        <FontAwesomeIcon
                          icon={faCalendar}
                          className="mr-2 text-gray-400"
                        />
                        <span>{formatDateTime(lesson.scheduledAt)}</span>
                      </div>

                      <div className="flex items-center text-sm text-gray-600">
                        <FontAwesomeIcon
                          icon={faClock}
                          className="mr-2 text-gray-400"
                        />
                        <span>{lesson.durationMinutes} minutes</span>
                      </div>

                      <div className="flex items-center text-sm text-gray-600">
                        <FontAwesomeIcon
                          icon={faUsers}
                          className="mr-2 text-gray-400"
                        />
                        <span>
                          {lesson.type === "individual"
                            ? "Individual"
                            : "Group"}
                          ({lesson.participants.length} participant
                          {lesson.participants.length !== 1 ? "s" : ""})
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {isLessonJoinable(lesson) && (
                        <button
                          onClick={() => joinLesson(lesson.id)}
                          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center ${
                            lesson.status === "in_progress"
                              ? "bg-green-600 hover:bg-green-700 text-white"
                              : "bg-indigo-600 hover:bg-indigo-700 text-white"
                          }`}
                        >
                          <FontAwesomeIcon icon={faVideo} className="mr-2" />
                          {lesson.status === "in_progress"
                            ? "Join Now"
                            : "Join"}
                        </button>
                      )}

                      {lesson.status === "completed" && (
                        <button
                          disabled
                          className="flex-1 py-2 px-4 bg-gray-100 text-gray-500 rounded-lg font-medium cursor-not-allowed"
                        >
                          Completed
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
