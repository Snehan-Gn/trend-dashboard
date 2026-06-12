import { useState } from "react";
import { API_URL } from "../config";

function NoteForm({ keywordId, onNoteSaved }) {
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);

  function handleSave() {
    if (!text.trim()) return;
    setSaving(true);
    fetch(`${API_URL}/api/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keyword_id: keywordId, content: text }),
    })
      .then((res) => res.json())
      .then(() => {
        setText("");
        setSaving(false);
        onNoteSaved();
      })
      .catch(() => setSaving(false));
  }

  return (
    <div className="note-form">
      <textarea
        className="note-textarea"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add a note about this trend..."
        rows={3}
      />
      <button
        className="btn btn-primary"
        onClick={handleSave}
        disabled={saving || !text.trim()}
        style={{ marginTop: "16px" }}
      >
        {saving ? "Saving…" : "Save note"}
      </button>
    </div>
  );
}

export default NoteForm;
