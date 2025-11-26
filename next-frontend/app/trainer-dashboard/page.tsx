"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faVideo,
  faEdit,
  faCalendar,
  faClock,
  faUsers,
  faCheckSquare,
} from "@fortawesome/free-solid-svg-icons";
import { api, User, Lesson, Student } from "@/lib/api";

export default function TrainerDashboard() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [myStudents, setMyStudents] = useState<Student[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newLesson, setNewLesson] = useState({
    title: "",
    description: "",
    type: "individual" as "individual" | "group",
    scheduledAt: "",
    durationMinutes: 60,
    participantIds: [] as string[],
  });
  const router = useRouter();

  useEffect(() => {
    fetchLessons();
    fetchMyStudents();
  }, []);

  const fetchLessons = async () => {
    try {
      const data = await api.getLessons();
      setLessons(data);
    } catch (err) {
      setError("Failed to load lessons");
      console.error(err);
    }
  };

  const fetchMyStudents = async () => {
    try {
      const data = await api.getMyStudents();
      setMyStudents(data);
    } catch (err) {
      console.error("Error fetching students:", err);
      setMyStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const createLesson = async () => {
    try {
      const response = await fetch("http://localhost:3001/lessons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(newLesson),
      });

      if (response.ok) {
        await fetchLessons();
        setShowCreateModal(false);
        setNewLesson({
          title: "",
          description: "",
          type: "individual",
          scheduledAt: "",
          durationMinutes: 60,
          participantIds: [],
        });
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to create lesson");
      }
    } catch (err) {
      setError("Network error");
      console.error(err);
    }
  };

  const startLesson = async (lessonId: string) => {
    try {
      await api.startLesson(lessonId);
      // Redirect to virtual classroom
      router.push(`/virtual-classroom/${lessonId}`);
    } catch (err) {
      setError("Failed to start lesson");
      console.error(err);
    }
  };

  const toggleStudentSelection = (studentId: string) => {
    setNewLesson((prev) => ({
      ...prev,
      participantIds: prev.participantIds.includes(studentId)
        ? prev.participantIds.filter((id) => id !== studentId)
        : [...prev.participantIds, studentId],
    }));
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

  const getStudentDisplayName = (student: Student) => {
    if (student.firstName && student.lastName) {
      return `${student.firstName} ${student.lastName}`;
    }
    return student.username;
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
                icon={faUsers}
                className="text-indigo-600 text-xl mr-3"
              />
              <h1 className="text-xl font-semibold text-gray-900">
                Trainer Dashboard
              </h1>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              disabled={myStudents.length === 0}
              className={`flex items-center px-4 py-2 rounded-lg font-medium text-white ${
                myStudents.length === 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700"
              } transition-colors`}
            >
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              Create Lesson
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
              <FontAwesomeIcon icon={faCheckSquare} />
            </button>
          </div>
        )}

        {/* Students Summary */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <FontAwesomeIcon
                  icon={faUsers}
                  className="mr-2 text-indigo-600"
                />
                Your Students ({myStudents.length})
              </h2>
            </div>
            <div className="p-6">
              {myStudents.length === 0 ? (
                <div className="text-center py-8">
                  <FontAwesomeIcon
                    icon={faUsers}
                    className="text-3xl text-gray-400 mb-4"
                  />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No students assigned yet
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Students will appear here once they select you as their
                    trainer.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {myStudents.map((student) => (
                    <div
                      key={student.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                          <FontAwesomeIcon
                            icon={faUsers}
                            className="text-indigo-600"
                          />
                        </div>
                        <div className="ml-4">
                          <h4 className="text-sm font-medium text-gray-900">
                            {getStudentDisplayName(student)}
                          </h4>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Lessons Section */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Your Lessons
          </h2>

          {lessons.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-100">
              <FontAwesomeIcon
                icon={faCalendar}
                className="text-3xl text-gray-400 mb-4"
              />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No lessons created yet
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Create your first lesson to get started with teaching.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                disabled={myStudents.length === 0}
                className={`px-4 py-2 rounded-lg font-medium text-white ${
                  myStudents.length === 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700"
                } transition-colors`}
              >
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                Create Lesson
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

                    <div className="flex gap-2">
                      {lesson.status === "scheduled" && (
                        <button
                          onClick={() => startLesson(lesson.id)}
                          className="flex-1 py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center"
                        >
                          <FontAwesomeIcon icon={faVideo} className="mr-2" />
                          Start Lesson
                        </button>
                      )}

                      {lesson.status === "in_progress" && (
                        <button
                          onClick={() =>
                            router.push(`/virtual-classroom/${lesson.id}`)
                          }
                          className="flex-1 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center"
                        >
                          <FontAwesomeIcon icon={faVideo} className="mr-2" />
                          Join Classroom
                        </button>
                      )}

                      {(lesson.status === "completed" ||
                        lesson.status === "cancelled") && (
                        <button
                          disabled
                          className="flex-1 py-2 px-4 bg-gray-100 text-gray-500 rounded-lg font-medium cursor-not-allowed"
                        >
                          {lesson.status === "completed"
                            ? "Completed"
                            : "Cancelled"}
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

      {/* Create Lesson Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                Create New Lesson
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={newLesson.title}
                    onChange={(e) =>
                      setNewLesson({ ...newLesson, title: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter lesson title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newLesson.description}
                    onChange={(e) =>
                      setNewLesson({
                        ...newLesson,
                        description: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter lesson description"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lesson Type
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="type"
                        value="individual"
                        checked={newLesson.type === "individual"}
                        onChange={(e) =>
                          setNewLesson({
                            ...newLesson,
                            type: e.target.value as "individual" | "group",
                          })
                        }
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="ml-2 text-gray-700">Individual</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="type"
                        value="group"
                        checked={newLesson.type === "group"}
                        onChange={(e) =>
                          setNewLesson({
                            ...newLesson,
                            type: e.target.value as "individual" | "group",
                          })
                        }
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="ml-2 text-gray-700">Group</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Scheduled Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={newLesson.scheduledAt}
                    onChange={(e) =>
                      setNewLesson({
                        ...newLesson,
                        scheduledAt: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    min="15"
                    max="180"
                    value={newLesson.durationMinutes}
                    onChange={(e) =>
                      setNewLesson({
                        ...newLesson,
                        durationMinutes: parseInt(e.target.value) || 60,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                {newLesson.type === "group" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Students
                    </label>
                    <div className="border border-gray-300 rounded-lg p-4 max-h-40 overflow-y-auto">
                      {myStudents.length === 0 ? (
                        <p className="text-gray-500 text-sm">
                          No students available. Students will appear here once
                          they select you as their trainer.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {myStudents.map((student) => (
                            <label
                              key={student.id}
                              className="flex items-center p-2 hover:bg-gray-50 rounded"
                            >
                              <input
                                type="checkbox"
                                checked={newLesson.participantIds.includes(
                                  student.id
                                )}
                                onChange={() =>
                                  toggleStudentSelection(student.id)
                                }
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 rounded"
                              />
                              <span className="ml-3 text-gray-700">
                                {getStudentDisplayName(student)}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createLesson}
                disabled={
                  !newLesson.title.trim() ||
                  !newLesson.scheduledAt ||
                  (newLesson.type === "group" &&
                    newLesson.participantIds.length === 0)
                }
                className={`px-4 py-2 rounded-lg font-medium text-white ${
                  !newLesson.title.trim() ||
                  !newLesson.scheduledAt ||
                  (newLesson.type === "group" &&
                    newLesson.participantIds.length === 0)
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700"
                } transition-colors`}
              >
                Create Lesson
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
