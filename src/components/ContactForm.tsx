"use client";

import { useState, useRef, type FormEvent } from "react";
import { CheckCircle, AlertCircle, Send, ChevronDown, MessageSquare } from "lucide-react";
import { SUPPORT_EMAIL } from "@/lib/site";

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [resultId, setResultId] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );
  const [statusMessage, setStatusMessage] = useState("");

  const nameInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const subjectInputRef = useRef<HTMLSelectElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);

  function validateForm(): boolean {
    const newErrors: FormErrors = {};

    if (!name.trim() || name.trim().length < 2) {
      newErrors.name = "Please enter your full name (minimum 2 characters).";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      newErrors.email =
        "Please enter a valid email address (e.g. name@example.com).";
    }

    if (!subject.trim()) {
      newErrors.subject = "Please select the topic of your inquiry.";
    }

    if (!message.trim() || message.trim().length < 10) {
      newErrors.message = "Please enter a message of at least 10 characters.";
    }

    setErrors(newErrors);

    // Focus first invalid field
    if (newErrors.name) {
      nameInputRef.current?.focus();
    } else if (newErrors.email) {
      emailInputRef.current?.focus();
    } else if (newErrors.subject) {
      subjectInputRef.current?.focus();
    } else if (newErrors.message) {
      messageInputRef.current?.focus();
    }

    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitStatus("idle");
    setStatusMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          subject,
          resultId: resultId.trim() || undefined,
          message,
          honeypot,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Failed to submit message. Please try again."
        );
      }

      setSubmitStatus("success");
      setStatusMessage(
        data.message ||
          "Thank you! Your message has been received. We will respond within 24 business hours."
      );
      // Reset form
      setName("");
      setEmail("");
      setSubject("");
      setResultId("");
      setMessage("");
      setErrors({});
    } catch (err: unknown) {
      setSubmitStatus("error");
      const msg =
        err instanceof Error
          ? err.message
          : `An unexpected error occurred. Please try again or email us directly at ${SUPPORT_EMAIL}.`;
      setStatusMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="surface p-6 shadow-lift sm:p-8">
      <div className="flex items-center gap-3">
        <span className="icon-tile" aria-hidden="true">
          <MessageSquare className="h-5 w-5" />
        </span>
        <h2 className="text-xl font-extrabold text-ink-950 sm:text-2xl">
          Send Us a Message
        </h2>
      </div>

      {/* Status Announcements */}
      {submitStatus === "success" && (
        <div
          role="alert"
          aria-live="polite"
          className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-950 animate-fade-in"
        >
          <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" aria-hidden="true" />
          <div>
            <strong className="block font-bold">Message Sent!</strong>
            <span>{statusMessage}</span>
          </div>
        </div>
      )}

      {submitStatus === "error" && (
        <div
          role="alert"
          aria-live="assertive"
          className="mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-950 animate-fade-in"
        >
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-700" aria-hidden="true" />
          <div>
            <strong className="block font-bold">Submission Error</strong>
            <span>{statusMessage}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
        {/* Honeypot field (hidden from assistive tech & visual users) */}
        <div className="sr-only" aria-hidden="true">
          <label htmlFor="form-hp-field">Leave this field empty</label>
          <input
            id="form-hp-field"
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
          />
        </div>

        {/* Name */}
        <div>
          <label
            htmlFor="contact-name"
            className="mb-1.5 block text-sm font-semibold text-ink-950"
          >
            Your Full Name <span className="text-red-700" aria-hidden="true">*</span>
          </label>
          <input
            ref={nameInputRef}
            id="contact-name"
            type="text"
            name="name"
            required
            autoComplete="name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
            }}
            aria-invalid={errors.name ? "true" : "false"}
            aria-describedby={errors.name ? "contact-name-error" : undefined}
            className={`field ${
              errors.name ? "border-red-600 ring-1 ring-red-600" : ""
            }`}
            placeholder="e.g. Eleanor Vance"
          />
          {errors.name && (
            <p id="contact-name-error" className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-700">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>{errors.name}</span>
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="contact-email"
            className="mb-1.5 block text-sm font-semibold text-ink-950"
          >
            Email Address <span className="text-red-700" aria-hidden="true">*</span>
          </label>
          <input
            ref={emailInputRef}
            id="contact-email"
            type="email"
            name="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
            }}
            aria-invalid={errors.email ? "true" : "false"}
            aria-describedby={errors.email ? "contact-email-error" : undefined}
            className={`field ${
              errors.email ? "border-red-600 ring-1 ring-red-600" : ""
            }`}
            placeholder="e.g. name@example.com"
          />
          {errors.email && (
            <p id="contact-email-error" className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-700">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>{errors.email}</span>
            </p>
          )}
        </div>

        {/* Subject Dropdown */}
        <div>
          <label
            htmlFor="contact-subject"
            className="mb-1.5 block text-sm font-semibold text-ink-950"
          >
            Subject / Inquiry Type <span className="text-red-700" aria-hidden="true">*</span>
          </label>
          <div className="relative">
            <select
              ref={subjectInputRef}
              id="contact-subject"
              name="subject"
              required
              value={subject}
              onChange={(e) => {
                setSubject(e.target.value);
                if (errors.subject) setErrors((prev) => ({ ...prev, subject: undefined }));
              }}
              aria-invalid={errors.subject ? "true" : "false"}
              aria-describedby={errors.subject ? "contact-subject-error" : undefined}
              className={`field cursor-pointer appearance-none pr-11 ${
                errors.subject ? "border-red-600 ring-1 ring-red-600" : ""
              }`}
            >
              <option value="">-- Please Select Topic --</option>
              <option value="Photo Compliance & Rules">Photo Compliance &amp; Dimensions Question</option>
              <option value="Download or Result Issue">Download or Session Result Issue</option>
              <option value="Refund Request">Refund Request (Acceptance Guarantee)</option>
              <option value="Technical or Website Bug">Technical or Website Issue</option>
              <option value="Data Privacy or Safeguards">Data Privacy &amp; Security Question</option>
              <option value="General Feedback">General Feedback</option>
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500"
              aria-hidden="true"
            />
          </div>
          {errors.subject && (
            <p id="contact-subject-error" className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-700">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>{errors.subject}</span>
            </p>
          )}
        </div>

        {/* Order / Result ID (Optional) */}
        <div>
          <div className="mb-1.5 flex items-center justify-between gap-3">
            <label
              htmlFor="contact-result-id"
              className="block text-sm font-semibold text-ink-950"
            >
              Photo Result ID
            </label>
            <span className="text-xs font-medium text-ink-500">(Optional)</span>
          </div>
          <input
            id="contact-result-id"
            type="text"
            name="resultId"
            value={resultId}
            onChange={(e) => setResultId(e.target.value)}
            className="field font-mono"
            placeholder="e.g. res_1727456789 or UUID"
          />
          <p className="mt-1.5 text-xs font-medium text-ink-500">
            Found on your photo preview page or confirmation.
          </p>
        </div>

        {/* Message */}
        <div>
          <label
            htmlFor="contact-message"
            className="mb-1.5 block text-sm font-semibold text-ink-950"
          >
            Your Message <span className="text-red-700" aria-hidden="true">*</span>
          </label>
          <textarea
            ref={messageInputRef}
            id="contact-message"
            name="message"
            required
            rows={5}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              if (errors.message) setErrors((prev) => ({ ...prev, message: undefined }));
            }}
            aria-invalid={errors.message ? "true" : "false"}
            aria-describedby={errors.message ? "contact-message-error" : undefined}
            className={`field min-h-32 resize-y leading-relaxed ${
              errors.message ? "border-red-600 ring-1 ring-red-600" : ""
            }`}
            placeholder="Please describe your question or issue in detail…"
          />
          {errors.message && (
            <p id="contact-message-error" className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-700">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>{errors.message}</span>
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-brand btn-lg w-full"
        >
          {isSubmitting ? (
            <>
              <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-white border-t-transparent" aria-hidden="true" />
              <span>Sending Message…</span>
            </>
          ) : (
            <>
              <Send className="h-4 w-4" aria-hidden="true" />
              <span>Send Message</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
