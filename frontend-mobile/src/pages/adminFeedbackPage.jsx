import { useEffect, useState } from "react";
import { getAllFeedback } from "../services/api";

export default function AdminFeedbackPage() {
  const [feedback, setFeedback] = useState([]);

  useEffect(() => {
    getAllFeedback()
      .then((res) => {
        setFeedback(res.data);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  return (
    <div style={{ padding: "20px", color: "white" }}>
      <h2>All Feedback</h2>

      {feedback.map((item) => (
        <div
          key={item.id}
          style={{
            border: "1px solid #444",
            padding: "15px",
            marginBottom: "15px",
            borderRadius: "10px",
          }}
        >
          <p><b>User:</b> {item.authUserId}</p>
          <p><b>Category:</b> {item.category}</p>
          <p><b>Message:</b> {item.message}</p>
          <p><b>Date:</b> {item.createdAt}</p>
        </div>
      ))}
    </div>
  );
}