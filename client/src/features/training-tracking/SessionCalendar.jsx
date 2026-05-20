"use client";
import React from "react";
import { Calendar } from "@/components/ui/calendar";
import { format, isToday, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, XCircle } from "lucide-react";
import { useState } from "react";
import Pagination from "@/components/common/CustomPagination";

export const SessionCalendar = ({ sessions = [], training }) => {
  const [date, setDate] = React.useState(new Date());
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);

  // Get sessions for the selected date
  const getSessionsForDate = (date) => {
    return sessions.filter(
      (session) =>
        format(parseISO(session.date), "yyyy-MM-dd") ===
        format(date, "yyyy-MM-dd")
    );
  };

  // Get all unique dates with sessions for calendar highlighting
  const sessionDates = sessions.map((session) => parseISO(session.date));

  // Get paginated sessions for the selected date
  const sessionsForDate = getSessionsForDate(date);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedSessions = sessionsForDate.slice(startIndex, endIndex);

  return (
    <div className="flex flex-col w-full gap-6">
      {/* Calendar and Sessions in a row */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Calendar Section - More Colorful */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-xl shadow-sm border border-tacir-lightgray p-4">
            <h3 className="text-lg font-semibold text-tacir-darkblue mb-4">
              Training Calendar
            </h3>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-lg"
              modifiers={{
                hasSessions: sessionDates,
                today: isToday(date),
                selected: date,
              }}
              modifiersStyles={{
                hasSessions: {
                  border: "2px solid #303E8C",
                  backgroundColor: "#303E8C20",
                },
                today: {
                  border: "2px solid #F29F05",
                  fontWeight: "bold",
                },
                selected: {
                  backgroundColor: "#303E8C",
                  color: "white",
                },
              }}
              styles={{
                day: {
                  borderRadius: "6px",
                  transition: "all 0.2s",
                },
                caption: {
                  color: "#2D3773",
                  fontWeight: "600",
                },
                nav_button: {
                  color: "#2D3773",
                },
              }}
            />
            <div className="mt-4 flex flex-wrap gap-2">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-tacir-blue mr-2"></div>
                <span className="text-sm text-tacir-darkgray">
                  Has Sessions
                </span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-tacir-yellow mr-2"></div>
                <span className="text-sm text-tacir-darkgray">Today</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sessions List Section */}
        <div className="lg:w-2/3">
          <div className="bg-white rounded-xl shadow-sm border border-tacir-lightgray p-6">
            <div className="mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-semibold text-tacir-darkblue">
                    Sessions for {format(date, "MMMM d, yyyy")}
                  </h3>
                  <p className="text-sm text-tacir-darkgray">
                    {training?.title} •{" "}
                    {training?.startDate &&
                      format(parseISO(training.startDate), "MMM yyyy")}{" "}
                    to{" "}
                    {training?.endDate &&
                      format(parseISO(training.endDate), "MMM yyyy")}
                  </p>
                </div>
                {isToday(date) && (
                  <Badge className="bg-tacir-yellow text-white">Today</Badge>
                )}
              </div>
            </div>

            {paginatedSessions.length > 0 ? (
              <div className="space-y-4">
                {paginatedSessions.map((session) => (
                  <div
                    key={session._id}
                    className="border rounded-xl p-4 border-tacir-lightgray hover:shadow-md transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium text-tacir-darkblue">
                            {session.participantName || "Session"}
                          </h4>
                          {session.attendance === "present" ? (
                            <Badge className="gap-1 bg-tacir-green text-white">
                              <CheckCircle className="w-3 h-3" /> Present
                            </Badge>
                          ) : session.attendance === "absent" ? (
                            <Badge className="gap-1 bg-tacir-pink text-white">
                              <XCircle className="w-3 h-3" /> Absent
                            </Badge>
                          ) : (
                            <Badge className="gap-1 bg-tacir-yellow text-white">
                              <Clock className="w-3 h-3" /> Pending
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-4">
                          <div className="flex items-center text-sm text-tacir-darkgray">
                            <Clock className="w-4 h-4 mr-2 text-tacir-blue" />
                            {session.startTime} - {session.endTime}
                          </div>
                          {session.meetLink && (
                            <a
                              href={session.meetLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center text-sm text-tacir-blue hover:underline"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="mr-2"
                              >
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                              </svg>
                              Join Session
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                    {session.presenceConfirmedAt && (
                      <div className="mt-3 flex items-center text-sm text-tacir-darkgray">
                        <CheckCircle className="w-4 h-4 mr-2 text-tacir-green" />
                        Confirmed at:{" "}
                        {format(
                          parseISO(session.presenceConfirmedAt),
                          "MMM d, yyyy h:mm a"
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="border rounded-xl p-8 text-center border-tacir-lightgray">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#7B797A"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mx-auto mb-4"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <p className="text-tacir-darkgray text-lg font-medium">
                  No sessions scheduled for this date
                </p>
                <p className="text-tacir-darkgray text-sm mt-1">
                  Select another date to view sessions
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pagination - Full Width */}
      {sessionsForDate.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-tacir-lightgray p-4">
          <Pagination
            page={page}
            limit={limit}
            total={sessionsForDate.length}
            entityName="sessions"
            onPageChange={setPage}
            onLimitChange={(newLimit) => {
              setLimit(newLimit);
              setPage(1);
            }}
          />
        </div>
      )}
    </div>
  );
};
