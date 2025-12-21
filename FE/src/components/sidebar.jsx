import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BsCheck2Square } from "react-icons/bs";
import logo from "../assets/logo.png";
import { useDispatch, useSelector } from "react-redux";
import {
  clearMessages,
  clearInputText,
  saveHistory,
  loadHistory,
  loadMessages,
  setCurrentHistoryId,
} from "../state/messagesSlice";
import { messagesAPI } from "../services/api";

const Sidebar = () => {
  const messages = useSelector((state) => state.messages.messages ?? []);
  const history = useSelector((state) => state.messages.history ?? []);
  const dispatch = useDispatch();
  const [historyPreviews, setHistoryPreviews] = useState({});

  // Debug: Log history state
  useEffect(() => {
    console.log("Sidebar render - History state:", history);
    console.log("Sidebar render - History length:", history?.length);
    console.log("Sidebar render - History is array:", Array.isArray(history));
    if (history && history.length > 0) {
      console.log("Sidebar render - First history item:", history[0]);
    }
  }, [history]);

  // Load history on component mount
  useEffect(() => {
    const loadHistoryData = async () => {
      try {
        console.log("Loading history...");
        const result = await dispatch(loadHistory()).unwrap();
        console.log("History loaded successfully:", result);
        console.log("History type:", typeof result);
        console.log("History is array:", Array.isArray(result));
        console.log("History length:", result?.length);
      } catch (error) {
        console.error("Error loading history:", error);
        console.error("Error details:", error.message, error.stack);
      }
    };
    loadHistoryData();
  }, [dispatch]);

  // Fetch previews for each history item
  useEffect(() => {
    const fetchPreviews = async () => {
      const previews = {};
      for (const hist of history) {
        const historyId = hist._id || hist.id;
        if (historyId && !previews[historyId]) {
          try {
            // Get more messages to find the first user message
            const response = await messagesAPI.getMessages(historyId, 10);
            if (response.messages && response.messages.length > 0) {
              // Find the first user message (not assistant)
              const firstUserMessage = response.messages.find(
                (msg) => msg.role === "user"
              );
              if (firstUserMessage && firstUserMessage.content) {
                const content = firstUserMessage.content.trim();
                if (content) {
                  previews[historyId] = content.slice(0, 32);
                }
              }
            }
            // If no preview found, leave it undefined so we can use date fallback
          } catch (error) {
            console.error("Error loading history preview:", error);
            // Leave undefined so date fallback is used
          }
        }
      }
      setHistoryPreviews(previews);
    };

    if (history.length > 0) {
      fetchPreviews();
    }
  }, [history]);

  const handleClick = async () => {
    // Only save history if there are messages
    if (messages && messages.length > 0) {
      try {
        // Save current conversation as history
        await dispatch(
          saveHistory({
            user_id: "", // Will be set by backend from token
            messages: messages.map((msg) => ({
              role: msg.role,
              content: msg.content,
            })),
          })
        ).unwrap();
        // Reload history list to show the new entry
        await dispatch(loadHistory()).unwrap();
      } catch (error) {
        console.error("Error saving history:", error);
      }
    }

    // Always clear messages and input to start a new chat
    dispatch(clearInputText());
    dispatch(clearMessages());
    dispatch(setCurrentHistoryId(null));
  };

  const handleHistoryClick = async (historyId) => {
    // Load messages for this history
    dispatch(setCurrentHistoryId(historyId));
    dispatch(loadMessages(historyId));
  };

  return (
    <div
      className={`sticky top-0 text-blue-400 border border-gray-200 h-screen pt-3 p-2 w-64 flex flex-col`}
    >
      <div className=" flex justify-between items-center mb-4 shrink-0">
        <div>
          <Link to="/">
            <img src={logo} alt="img" className="mr-2 w-8" />
          </Link>
        </div>
        <div>
          <button
            onClick={handleClick}
            className=" text-blue-400 tracking-tight pb-2 pr-2 flex items-center cursor-pointer"
          >
            <BsCheck2Square className="mr-1" />
            <span> New Chat</span>
          </button>
        </div>
      </div>
      <h3 className="shrink-0 pb-2 font-bold">Your chat</h3>
      <ul className="space-y-2 flex flex-col overflow-y-auto flex-1 min-h-0">
        {!history || history.length === 0 ? (
          <li className="text-sm text-gray-500 p-2">No chat history yet</li>
        ) : (
          history
            .map((hist, index) => {
              const historyId = hist._id || hist.id || `hist-${index}`;
              // Get preview from state (fetched separately)
              const preview = historyPreviews[historyId];

              // Only render if we have a preview
              if (!preview) {
                return null;
              }

              return (
                <li
                  key={historyId}
                  onClick={() => handleHistoryClick(historyId)}
                  className="hover:bg-gray-100 rounded cursor-pointer flex items-center shrink-0 p-2"
                >
                  <Link to="/" className="flex items-center w-full">
                    <span className="text-sm">
                      {preview}
                      {preview.length > 32 ? "..." : ""}
                    </span>
                  </Link>
                </li>
              );
            })
            .filter(Boolean)
        )}
      </ul>
      {/* <ul className="space-y-2 flex flex-col justify-between h-11/12">
        <li className="hover:bg-gray-100 p-2 rounded cursor-pointer flex items-center">
          <Link to="/" className="flex items-center w-full">
            <span className="">{`${partChat}...`}</span>
          </Link>
        </li>
      </ul> */}
    </div>
  );
};

export default Sidebar;
