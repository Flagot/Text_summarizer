import React, { useRef, useEffect } from "react";
import Navbar from "../components/navbar";
import {
  addMessage,
  setInputText,
  clearInputText,
  saveMessage,
  setCurrentHistoryId,
} from "../state/messagesSlice";
import { useDispatch, useSelector } from "react-redux";

function Home() {
  const messages = useSelector((state) => state.messages.messages ?? []);
  const inputText = useSelector((state) => state.messages.inputText ?? "");
  const currentHistoryId = useSelector(
    (state) => state.messages.currentHistoryId
  );
  const dispatch = useDispatch();
  const chatContainerRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    container.scrollTop = container.scrollHeight;
  }, [messages]);
  useEffect(() => {
    const el = chatContainerRef.current;
    if (!el) return;

    const isAtBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 50;

    if (isAtBottom) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmed = inputText.trim();
    if (!trimmed) return;

    // Create user message with unique temp ID
    const userMessage = {
      id: `temp-user-${Date.now()}`,
      role: "user",
      content: trimmed,
    };

    // Add to local state immediately
    dispatch(addMessage(userMessage));
    dispatch(clearInputText());

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    // Save user message to backend
    // The backend will automatically generate and return both user and assistant messages
    try {
      const response = await dispatch(
        saveMessage({
          history_id: currentHistoryId || null,
          role: "user",
          content: trimmed,
        })
      ).unwrap();

      // Update currentHistoryId if this is the first message
      const historyId =
        response.history_id || response.user_message?.history_id;
      if (!currentHistoryId && historyId) {
        dispatch(setCurrentHistoryId(historyId));
      }

      // The backend returns both messages, which are automatically
      // added to Redux state via saveMessage.fulfilled reducer
      console.log("Messages received from backend:", response);
    } catch (error) {
      console.error("Error saving message:", error);
    }
  };

  const handleTextareaChange = (e) => {
    dispatch(setInputText(e.target.value));

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        150
      )}px`;
    }
  };

  // Debug: Log messages for rendering
  console.log("Rendering messages:", messages);
  console.log("Messages count:", messages.length);
  console.log(
    "Assistant messages:",
    messages.filter((m) => m.role === "assistant")
  );

  return (
    <div className="flex flex-col h-screen bg-white">
      <Navbar />

      {/* Chat Container */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Messages */}
        <div
          className="flex-1 overflow-y-auto px-4 py-6"
          ref={chatContainerRef}
        >
          {messages.length === 0 ? (
            <div className="flex  justify-center h-full">
              <p className="text-lg text-gray-500 mt-32">
                What can I help you summarize today?
              </p>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-4 ">
              {messages.map((message, index) => {
                // Ensure message has required properties
                const messageId = message.id || `msg-${index}`;
                const messageContent = message.content || "";
                const messageRole = message.role || "assistant";

                console.log(`Rendering message ${index}:`, {
                  id: messageId,
                  role: messageRole,
                  content: messageContent?.slice(0, 30),
                });

                return (
                  <div
                    key={messageId}
                    className={`flex ${
                      messageRole === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-3 ${
                        messageRole === "user"
                          ? "bg-blue-100 text-black"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      <div className="whitespace-pre-wrap ">
                        {messageContent}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 bg-white p-4">
          <form
            onSubmit={handleSubmit}
            className="max-w-4xl mx-auto flex gap-3 items-end"
          >
            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={handleTextareaChange}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              className="flex-1 resize-none border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500 max-h-[200px] overflow-y-auto"
              placeholder="Type or paste your text here… (Enter to send, Shift+Enter for new line)"
              rows={1}
            />

            <button
              type="submit"
              disabled={!inputText.trim()}
              className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg shadow hover:bg-blue-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Home;
