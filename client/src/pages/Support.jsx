import { useState, useEffect } from "react";
import Button from "../components/Button";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Support() {
  const { user } = useAuth();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Pre-fill user data if logged in
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const response = await api.post("/support", {
        name,
        email,
        subject,
        message,
      });
      setSuccess(response.data.message || "Your inquiry has been submitted!");
      setSubject("");
      setMessage("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit support inquiry.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="max-w-2xl mx-auto px-4 py-16">
      <div className="text-center mb-10">
        <p className="text-fg-muted text-xs uppercase tracking-[0.2em] mb-2">
          Contact
        </p>
        <h1 className="font-heading text-2xl md:text-3xl uppercase tracking-tight text-fg">
          Customer Support
        </h1>
        <p className="text-fg-muted text-xs uppercase tracking-wider mt-3 max-w-md mx-auto leading-relaxed">
          Have questions about a drop, order, or shipping? Hit us up below and we will get back to you shortly.
        </p>
      </div>

      <div className="border border-edge rounded-sm p-6 md:p-8 bg-surface/10">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <p className="text-error text-xs uppercase tracking-wider">{error}</p>
          )}
          {success && (
            <p className="text-success text-xs uppercase tracking-wider">{success}</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-fg-muted mb-2">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-transparent border border-edge rounded-sm py-2 px-3 text-xs text-fg focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-fg-muted mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-transparent border border-edge rounded-sm py-2 px-3 text-xs text-fg focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider text-fg-muted mb-2">
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              placeholder="E.G. ORDER INQUIRY / DROP FEEDBACK"
              className="w-full bg-transparent border border-edge rounded-sm py-2 px-3 text-xs text-fg focus:outline-none focus:border-accent placeholder:text-fg-muted/30"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider text-fg-muted mb-2">
              Message
            </label>
            <textarea
              rows="6"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              placeholder="WRITE YOUR INQUIRY DETAILS HERE..."
              className="w-full bg-transparent border border-edge rounded-sm p-3 text-xs text-fg focus:outline-none focus:border-accent placeholder:text-fg-muted/30"
            />
          </div>

          <Button type="submit" size="lg" className="w-full cursor-pointer" disabled={submitting}>
            {submitting ? "SUBMITTING..." : "SUBMIT TICKET"}
          </Button>
        </form>
      </div>
    </section>
  );
}
