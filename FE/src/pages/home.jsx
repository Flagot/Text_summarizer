import React, { useRef, useEffect } from "react";
import Navbar from "../components/navbar";
import {
  addMessage,
  setInputText,
  clearInputText,
} from "../state/messagesSlice";
import { useDispatch, useSelector } from "react-redux";

function Home() {
  const messages = useSelector((state) => state.messages.messages ?? []);
  const inputText = useSelector((state) => state.messages.inputText ?? "");
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

  const handleSubmit = (e) => {
    e.preventDefault();

    const trimmed = inputText.trim();
    if (!trimmed) return;

    const userMessage = {
      id: Date.now(),
      role: "user",
      content: trimmed,
    };

    dispatch(addMessage(userMessage));
    dispatch(clearInputText());

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    // Simulated AI response
    setTimeout(() => {
      dispatch(
        addMessage({
          id: Date.now() + 1,
          role: "assistant",
          content:
            "This is a placeholder response. Your AI-generated summary will appear here.",
        })
      );
    }, 500);
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
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-3 ${
                      message.role === "user"
                        ? "bg-blue-100 text-black"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    <div className="whitespace-pre-wrap ">
                      {message.content}
                    </div>
                  </div>
                </div>
              ))}
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
