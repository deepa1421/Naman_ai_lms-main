import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { API } from "../lib/api";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function AIPersonalTutor() {
  const [searchParams] = useSearchParams();
  const user_id = searchParams.get("user_id") || "test123";

  const [mode, setMode] = useState<
    "chat" | "module" | "assessment" | "result" | "progress"
  >("chat");

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [modules, setModules] = useState<any[]>([]);

  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [assessmentId, setAssessmentId] = useState("");

  const [result, setResult] = useState<any>(null);
  const [progress, setProgress] = useState<any[]>([]);
  const [recommendation, setRecommendation] = useState("");

  // 🔹 Load chat history
  useEffect(() => {
    fetch(`${API}/ai-tutor/history/${user_id}`)
      .then((res) => res.json())
      .then((data) => data?.history && setMessages(data.history))
      .catch(console.error);
  }, [user_id]);

  // 🔹 Load modules
  useEffect(() => {
    fetch(`${API}/ai-tutor/modules/${user_id}`)
      .then((res) => res.json())
      .then((data) => data?.modules && setModules(data.modules))
      .catch(console.error);
  }, [user_id]);

  // 🔹 Load progress
  useEffect(() => {
    fetch(`${API}/assessment/progress/${user_id}`)
      .then((res) => res.json())
      .then(setProgress)
      .catch(console.error);
  }, [user_id]);

  // 🔹 Load recommendation
  useEffect(() => {
    fetch(`${API}/assessment/recommend/${user_id}`)
      .then((res) => {
        if (!res.ok) throw new Error("No recommendation API");
        return res.json();
      })
      .then((data) => setRecommendation(data.recommendation || ""))
      .catch(() => setRecommendation(""));
  }, [user_id, progress]);

  // 🔹 Chat
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);

    try {
      const res = await fetch(`${API}/ai-tutor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id, question: input }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.answer },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ Error occurred" },
      ]);
    }

    setInput("");
  };

  // 🔹 Generate Module
  const generateModule = async () => {
    if (!input.trim()) return;

    try {
      const res = await fetch(`${API}/ai-tutor/generate-module`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id, topic: input }),
      });

      const data = await res.json();

      let parsed;
      try {
        parsed = JSON.parse(
          (data.content || data.module || "").replace(/```json|```/g, "")
        );
      } catch {
        parsed = {
          title: "Module",
          level: "Beginner",
          topics: [],
        };
      }

      setModules((prev) => [...prev, parsed]);
      setInput("");
    } catch (err) {
      console.error(err);
    }
  };

  // 🔹 Start Assessment
  const startAssessment = async (topic: string) => {
    try {
      const res = await fetch(`${API}/assessment/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id, topic }),
      });

      const data = await res.json();

      setQuestions(data.questions || []);
      setAnswers([]);
      setAssessmentId(data._id);
      setMode("assessment");
    } catch (err) {
      console.error(err);
    }
  };

  // 🔹 Submit Assessment
  const submitAssessment = async () => {
    try {
      const res = await fetch(`${API}/assessment/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assessment_id: assessmentId, answers }),
      });

      const data = await res.json();

      setResult(data);
      setMode("result");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="grid grid-cols-3 gap-4 p-4">
      {/* LEFT PANEL */}
      <div className="col-span-2 bg-white shadow-xl rounded-2xl p-4 flex flex-col">
        <h2 className="text-xl font-bold mb-4">AI Tutor</h2>

        {/* NAV */}
        <div className="flex gap-3 mb-4 flex-wrap">
          <button onClick={() => setMode("chat")} className="btn-blue">
            💬 Chat
          </button>
          <button onClick={() => setMode("module")} className="btn-purple">
            📘 Modules
          </button>
          <button onClick={() => setMode("assessment")} className="btn-orange">
            📝 Assessment
          </button>
          <button onClick={() => setMode("progress")} className="btn-green">
            📊 Progress
          </button>
        </div>

        {/* CHAT */}
        {mode === "chat" && (
          <>
            <div className="flex-1 overflow-y-auto space-y-3 mb-4">
              {messages.map((msg, i) => (
                <div key={i} className="p-3 bg-gray-100 rounded">
                  {msg.content}
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                className="flex-1 border p-2"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <button onClick={sendMessage} className="btn-blue">
                Send
              </button>
            </div>
          </>
        )}

        {/* MODULE GENERATION */}
        {mode === "module" && (
          <>
            <input
              className="border p-2 mb-2"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter topic"
            />
            <button onClick={generateModule} className="btn-purple">
              Generate Module
            </button>
          </>
        )}

        {/* ASSESSMENT */}
        {mode === "assessment" && questions.length > 0 && (
          <div>
            {questions.map((q, i) => (
              <div key={i}>
                <p>{q}</p>
                <input
                  className="border p-2 w-full"
                  onChange={(e) => {
                    const updated = [...answers];
                    updated[i] = e.target.value;
                    setAnswers(updated);
                  }}
                />
              </div>
            ))}
            <button onClick={submitAssessment} className="btn-blue mt-3">
              Submit
            </button>
          </div>
        )}

        {/* RESULT */}
        {mode === "result" && result && (
          <div>
            <p>Score: {result?.score}</p>
            <p>Level: {result?.level}</p>
          </div>
        )}

        {/* PROGRESS */}
        {mode === "progress" && (
          <div>
            {progress.map((p, i) => (
              <div key={i}>
                {p.topic} - {p.score}
              </div>
            ))}
            {recommendation && <p>{recommendation}</p>}
          </div>
        )}
      </div>

      {/* RIGHT PANEL */}
      <div className="bg-white shadow-xl rounded-2xl p-4">
        <h2 className="font-bold mb-3">Modules</h2>

        {modules.map((mod, i) => (
          <div key={i} className="p-3 bg-gray-100 mb-3 rounded">
            <h3>{typeof mod === "string" ? mod : mod?.title}</h3>

            <button
              onClick={() =>
                startAssessment(typeof mod === "string" ? mod : mod?.title)
              }
              className="mt-2 bg-green-600 text-white px-3 py-1 rounded"
            >
              Take Assessment
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}