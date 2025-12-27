import { useEffect, useState, useRef } from "react";
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
  const hasMoreHistory = useSelector(
    (state) => state.messages.hasMoreHistory ?? true
  );
  const isLoadingHistory = useSelector(
    (state) => state.messages.isLoading ?? false
  );
  const dispatch = useDispatch();
  const [historyPreviews, setHistoryPreviews] = useState({});
  const sidebarScrollRef = useRef(null);
  const isLoadingMoreRef = useRef(false);

  // Clear previews when history is cleared (e.g., on logout)
  useEffect(() => {
    if (!history || history.length === 0) {
      setHistoryPreviews({});
    }
  }, [history]);

  // Debug: Log history state
  useEffect(() => {
    console.log("Sidebar render - History state:", history);
    console.log("Sidebar render - History length:", history?.length);
    console.log("Sidebar render - History is array:", Array.isArray(history));
    if (history && history.length > 0) {
      console.log("Sidebar render - First history item:", history[0]);
    }
  }, [history]);

  // Load initial history on component mount (first 20 items)
  useEffect(() => {
    const loadHistoryData = async () => {
      try {
        console.log("Loading initial history...");
        const result = await dispatch(
          loadHistory({ limit: 20, skip: 0, append: false })
        ).unwrap();
        console.log("History loaded successfully:", result);
      } catch (error) {
        console.error("Error loading history:", error);
        console.error("Error details:", error.message, error.stack);
      }
    };
    loadHistoryData();
  }, [dispatch]);

  // Handle infinite scroll - load more when user scrolls near bottom
  useEffect(() => {
    const scrollContainer = sidebarScrollRef.current;
    if (!scrollContainer) return;

    // Throttle function to prevent too many scroll events
    let scrollTimeout;
    const handleScroll = () => {
      // Clear existing timeout
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }

      // Throttle scroll events
      scrollTimeout = setTimeout(() => {
        const { scrollTop, scrollHeight, clientHeight } = scrollContainer;

        // Calculate distance from bottom
        const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

        // Load more when user is within 200px of bottom (more generous threshold)
        const isNearBottom = distanceFromBottom < 200;

        if (
          isNearBottom &&
          hasMoreHistory &&
          !isLoadingHistory &&
          !isLoadingMoreRef.current
        ) {
          isLoadingMoreRef.current = true;
          console.log("Loading more history...", {
            currentCount: history.length,
            distanceFromBottom,
            scrollTop,
            scrollHeight,
            clientHeight,
          });

          dispatch(
            loadHistory({
              limit: 20,
              skip: history.length,
              append: true,
            })
          )
            .then(() => {
              isLoadingMoreRef.current = false;
            })
            .catch((error) => {
              console.error("Error loading more history:", error);
              isLoadingMoreRef.current = false;
            });
        }
      }, 150); // Throttle to 150ms
    };

    scrollContainer.addEventListener("scroll", handleScroll, { passive: true });

    // Also check on mount and when history changes if we need to load more
    const checkIfNeedsMore = () => {
      const { scrollHeight, clientHeight } = scrollContainer;
      // If content doesn't fill the container and we have more history, load more
      if (
        scrollHeight <= clientHeight + 50 && // Small buffer
        hasMoreHistory &&
        !isLoadingHistory &&
        !isLoadingMoreRef.current &&
        history.length > 0
      ) {
        console.log("Content doesn't fill container, loading more...", {
          scrollHeight,
          clientHeight,
          historyLength: history.length,
        });
        isLoadingMoreRef.current = true;
        dispatch(
          loadHistory({
            limit: 20,
            skip: history.length,
            append: true,
          })
        )
          .then(() => {
            isLoadingMoreRef.current = false;
          })
          .catch((error) => {
            console.error("Error loading more history:", error);
            isLoadingMoreRef.current = false;
          });
      }
    };

    // Check after a short delay to ensure DOM is ready
    const checkTimeout = setTimeout(checkIfNeedsMore, 300);

    return () => {
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
      if (checkTimeout) {
        clearTimeout(checkTimeout);
      }
      scrollContainer.removeEventListener("scroll", handleScroll);
    };
  }, [history.length, hasMoreHistory, isLoadingHistory, dispatch, history]);

  // Fetch previews for new history items only
  useEffect(() => {
    const fetchPreviews = async () => {
      // Find history items that need previews
      const previewsToFetch = history.filter((hist) => {
        const historyId = hist._id || hist.id;
        return historyId && !historyPreviews[historyId];
      });

      // Fetch previews for new items
      if (previewsToFetch.length > 0) {
        const previewPromises = previewsToFetch.map(async (hist) => {
          const historyId = hist._id || hist.id;
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
                  return { historyId, preview: content.slice(0, 32) };
                }
              }
            }
          } catch (error) {
            console.error("Error loading history preview:", error);
          }
          return null;
        });

        const results = await Promise.all(previewPromises);

        // Update previews with fetched results
        const updates = {};
        results.forEach((result) => {
          if (result && result.historyId) {
            updates[result.historyId] = result.preview;
          }
        });

        if (Object.keys(updates).length > 0) {
          setHistoryPreviews((prev) => ({ ...prev, ...updates }));
        }
      }
    };

    if (history.length > 0) {
      fetchPreviews();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history]); // historyPreviews intentionally excluded to avoid infinite loop

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
        // Reload history list to show the new entry (reset to first page)
        await dispatch(
          loadHistory({ limit: 20, skip: 0, append: false })
        ).unwrap();
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
      className={`sticky top-0 text-blue-400 border border-gray-200 h-screen pt-3 p-2 w-64 flex flex-col overflow-hidden`}
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
      <ul
        ref={sidebarScrollRef}
        className="space-y-2 flex flex-col overflow-y-auto flex-1 min-h-0 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {!history || history.length === 0 ? (
          <li className="text-sm text-gray-500 p-2">No chat history yet</li>
        ) : (
          history
            .map((hist, index) => {
              const historyId = hist._id || hist.id || `hist-${index}`;
              // Get preview from state (fetched separately)
              const preview = historyPreviews[historyId];

              // Only render items that have previews (filter out items without previews)
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
        {isLoadingHistory && history.length > 0 && (
          <li className="text-sm text-gray-400 p-2 text-center">
            Loading more...
          </li>
        )}
        {!hasMoreHistory && history.length > 0 && (
          <li className="text-sm text-gray-400 p-2 text-center">
            No more history
          </li>
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
