import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClock,
  faCalendarDay,
  faQuestionCircle,
} from "@fortawesome/free-solid-svg-icons";
import loadingIcon from "./occupi-gradient.png"; // Import the neon green loading icon image
import {
  fetchTodayRecommendations,
  fetchNext7DaysRecommendations,
  RecommendationsResponse,
  Next7DaysResponse,
} from "../../RecommendationService"; // Import service

interface RecommendationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RecommendationsModal = ({
  isOpen,
  onClose,
}: RecommendationsModalProps) => {
  const [recommendations, setRecommendations] = useState<
    RecommendationsResponse | Next7DaysResponse | null
  >(null); // Store recommendations
  const [loading, setLoading] = useState(false); // Track loading state
  const [hasFetched, setHasFetched] = useState(false); // Track if data is already fetched

  // States for typing effect for both titles and days
  const [typedMessageToday, setTypedMessageToday] = useState(""); // "Today" title
  const [typedMessageNext7Days, setTypedMessageNext7Days] = useState(""); // "Next 7 Days" title
  const [typedDaysContent, setTypedDaysContent] = useState<JSX.Element[]>([]); // Store typed-out days

  // Typing index for both titles
  const [typingIndexToday, setTypingIndexToday] = useState(0);
  const [typingIndexNext7Days, setTypingIndexNext7Days] = useState(0);

  const [showCursor, setShowCursor] = useState(true); // State to show or hide the cursor

  // Track the active tab (either "today" or "next7days")
  const [activeTab, setActiveTab] = useState<"today" | "next7days">("today");

  // Messages to type out
  const messageToday =
    "These are the recommended times to go to the office today:";
  const messageNext7Days =
    "These days are the recommended days to go to the office for the next 7 days:";

  // Simulate typing effect for the "Today" message
  useEffect(() => {
    if (
      !loading &&
      activeTab === "today" &&
      typingIndexToday < messageToday.length
    ) {
      const timeout = setTimeout(() => {
        setTypedMessageToday((prev) => prev + messageToday[typingIndexToday]);
        setTypingIndexToday((prev) => prev + 1);
      }, 100); // Adjust the delay to control typing speed
      return () => clearTimeout(timeout); // Cleanup timeout
    }
  }, [loading, activeTab, typingIndexToday]);

  // Simulate typing effect for the "Next 7 Days" message
  useEffect(() => {
    if (
      !loading &&
      activeTab === "next7days" &&
      typingIndexNext7Days < messageNext7Days.length
    ) {
      const timeout = setTimeout(() => {
        setTypedMessageNext7Days(
          (prev) => prev + messageNext7Days[typingIndexNext7Days]
        );
        setTypingIndexNext7Days((prev) => prev + 1);
      }, 100); // Adjust the delay to control typing speed
      return () => clearTimeout(timeout); // Cleanup timeout
    }
  }, [loading, activeTab, typingIndexNext7Days]);

  // Cursor blinking effect
  useEffect(() => {
    const blinkCursor = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500); // Toggle cursor every 500ms
    return () => clearInterval(blinkCursor); // Cleanup interval on unmount
  }, []);

  // Fetch recommendations based on the active tab
  useEffect(() => {
    if (isOpen && !hasFetched) {
      const fetchData = async () => {
        setLoading(true);
        try {
          let response;

          if (activeTab === "today") {
            response = await fetchTodayRecommendations();
          } else {
            response = await fetchNext7DaysRecommendations();
          }

          setRecommendations(response);
          setHasFetched(true); // Mark data as fetched
        } catch (error) {
          console.error("Error fetching recommendations:", error);
        } finally {
          setLoading(false); // Stop loading when data is fetched
        }
      };

      fetchData();
    }
  }, [isOpen, hasFetched, activeTab]);

  // Typing effect for hours in the "Today" tab (after the message is fully typed out)
  const [typedHours, setTypedHours] = useState<JSX.Element[]>([]);
  useEffect(() => {
    if (!loading && recommendations && typedMessageToday === messageToday) {
      if ((recommendations as RecommendationsResponse).Best_Times) {
        (recommendations as RecommendationsResponse).Best_Times.forEach(
          (item, index) => {
            setTimeout(() => {
              setTypedHours((prev) => [
                ...prev,
                <div key={index} className="flex items-center space-x-2">
                  <FontAwesomeIcon icon={faClock} className="text-gray-400" />
                  <span>{item.Hour}:00</span>
                </div>,
              ]);
            }, 250 * (index + 1)); // Delay each hour display by 250ms
          }
        );
      }
    }
  }, [loading, recommendations, typedMessageToday]);

  // Typing effect for days in the "Next 7 Days" tab (after the message is fully typed out)
  useEffect(() => {
    if (
      !loading &&
      recommendations &&
      typedMessageNext7Days === messageNext7Days
    ) {
      if ((recommendations as Next7DaysResponse).Recommended_Days) {
        (recommendations as Next7DaysResponse).Recommended_Days.forEach(
          (day, index) => {
            const date = new Date(day.Date);
            const dayOfWeek = new Intl.DateTimeFormat("en-US", {
              weekday: "long",
            }).format(date); // Get day of the week
            const formattedDate = date.toLocaleDateString("en-US"); // Format date in MM/DD/YYYY or other format if preferred

            const dayContent = (
              <div key={index} className="flex flex-col mb-4">
                <div className="flex items-center space-x-2">
                  <FontAwesomeIcon
                    icon={faCalendarDay}
                    className="text-gray-400"
                  />
                  <span>
                    <strong>Day:</strong> {dayOfWeek}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>
                    <strong>Date:</strong> {formattedDate}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>
                    <strong>Predicted Level:</strong> {day.Predicted_Class}
                  </span>
                </div>
              </div>
            );

            setTimeout(() => {
              setTypedDaysContent((prev) => [...prev, dayContent]);
            }, 500 * (index + 1)); // Delay each day's content by 500ms
          }
        );
      }
    }
  }, [loading, recommendations, typedMessageNext7Days]);

  // Handle tab switching
  const handleTabSwitch = (tab: "today" | "next7days") => {
    setActiveTab(tab); // Update the active tab
    setHasFetched(false); // Reset fetched status to refetch data on tab switch
    setTypedMessageToday(""); // Clear typed message for today
    setTypedMessageNext7Days(""); // Clear next 7 days message
    setTypedHours([]); // Clear hours display
    setTypedDaysContent([]); // Clear days content
    if (tab === "today") {
      setTypingIndexToday(0); // Reset typing index for today
    } else {
      setTypingIndexNext7Days(0); // Reset typing index for next 7 days
    }
  };

  if (!isOpen) return null; // Don't render the modal if it's not open

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-black text-white rounded-lg shadow-lg p-6 w-full max-w-lg relative">
        <div className="relative flex items-center">
          <h2 className="text-xl font-semibold mb-4">Recommendations</h2>

          {/* Tooltip Trigger (FontAwesome Icon) */}
          <div className="ml-2 mb-2.5 relative group">
            <FontAwesomeIcon
              icon={faQuestionCircle}
              className="text-gray-400 cursor-pointer text-lg"
            />

            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-700 text-white text-sm px-3 py-1 rounded-md">
              This shows the best times and days to go to the office.
            </div>
          </div>
        </div>

        <button
          className="absolute top-4 right-4 w-10 h-10 text-2xl text-gray-400 hover:bg-red-500 hover:text-white rounded-full flex justify-center items-center focus:outline-none transition-all duration-300 pb-1"
          onClick={onClose}>
          &times;
        </button>

        {/* Tab navigation with pill shape and smooth transition */}
        <div className="bg-gray-800 p-1 rounded-full flex justify-between space-x-2 mb-6 w-11/12 mx-auto">
          <button
            className={`px-4 py-2 w-1/2 rounded-full transition-all duration-300 ${
              activeTab === "today"
                ? "bg-[#b6ff00] hover:bg-[#a6ee00] text-black font-semibold"
                : "bg-black text-white hover:bg-[#b6ff00] hover:text-black font-semibold"
            }`}
            onClick={() => handleTabSwitch("today")}>
            Recommendend Hours
          </button>
          <button
            className={`px-4 py-2 w-1/2 rounded-full transition-all duration-300 ${
              activeTab === "next7days"
                ? "bg-[#b6ff00] hover:bg-[#a6ee00] text-black font-semibold"
                : "bg-black text-white hover:bg-[#b6ff00] hover:text-black font-semibold"
            }`}
            onClick={() => handleTabSwitch("next7days")}>
            Recommended Days
          </button>
        </div>
        {/* Show loading icon while data is being fetched */}
        {loading ? (
          <div className="flex justify-center items-center">
            <img
              src={loadingIcon}
              alt="Loading"
              className="animate-spin w-16 h-16"
            />
          </div>
        ) : (
          <>
            {/* Content container with sliding transition */}
            <div className="relative overflow-hidden min-h-32">
              <div
                className="flex transition-transform duration-500"
                style={{
                  transform:
                    activeTab === "today"
                      ? "translateX(0%)"
                      : "translateX(-100%)",
                }}>
                <div className="w-full flex-shrink-0">
                  <h4 className="text-xl font-semibold mb-4">
                    {typedMessageToday}
                    {showCursor && <span className="ml-1">_</span>}{" "}
                    {/* Blinking cursor */}
                  </h4>
                  <div className="space-y-2">{typedHours}</div>{" "}
                  {/* Display the typed hours */}
                </div>

                <div className="w-full flex-shrink-0">
                  <h4 className="text-xl font-semibold mb-4">
                    {typedMessageNext7Days}
                    {showCursor && <span className="ml-1">_</span>}{" "}
                    {/* Blinking cursor */}
                  </h4>
                  <div className="space-y-4">{typedDaysContent}</div>{" "}
                  {/* Display the typed days */}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RecommendationsModal;
