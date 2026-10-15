"use client";

import { useState, useRef, type FormEvent } from "react";
import { CheckCircle, AlertCircle, Send } from "lucide-react";
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
    <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
      <h2 className="text-xl font-bold text-slate-900 mb-6">
        Send Us a Message
      </h2>

      {/* Status Announcements */}
      {submitStatus === "success" && (
        <div
          role="alert"
          aria-live="polite"
          className="mb-6 bg-lime-50 border border-lime-300 text-lime-950 rounded-xl p-4 text-sm flex items-start gap-3 font-medium"
        >
          <CheckCircle className="w-5 h-5 text-[#4D7C0F] shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <strong className="font-bold block">Message Sent!</strong>
            <span>{statusMessage}</span>
          </div>
        </div>
      )}

      {submitStatus === "error" && (
        <div
          role="alert"
          aria-live="assertive"
          className="mb-6 bg-red-50 border border-red-200 text-red-950 rounded-xl p-4 text-sm flex items-start gap-3 font-medium"
        >
          <AlertCircle className="w-5 h-5 text-red-700 shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <strong className="font-bold block">Submission Error</strong>
            <span>{statusMessage}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
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
            className="block text-xs sm:text-sm font-bold text-slate-900 mb-1.5"
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
            className={`w-full px-4 py-3 text-sm text-slate-900 bg-white border rounded-xl focus-ring transition-colors ${
              errors.name ? "border-red-600 ring-1 ring-red-600" : "border-slate-300"
            }`}
            placeholder="e.g. Eleanor Vance"
          />
          {errors.name && (
            <p id="contact-name-error" className="text-xs text-red-700 mt-1.5 font-medium flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{errors.name}</span>
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="contact-email"
            className="block text-xs sm:text-sm font-bold text-slate-900 mb-1.5"
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
            className={`w-full px-4 py-3 text-sm text-slate-900 bg-white border rounded-xl focus-ring transition-colors ${
              errors.email ? "border-red-600 ring-1 ring-red-600" : "border-slate-300"
            }`}
            placeholder="e.g. name@example.com"
          />
          {errors.email && (
            <p id="contact-email-error" className="text-xs text-red-700 mt-1.5 font-medium flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{errors.email}</span>
            </p>
          )}
        </div>

        {/* Subject Dropdown */}
        <div>
          <label
            htmlFor="contact-subject"
            className="block text-xs sm:text-sm font-bold text-slate-900 mb-1.5"
          >
            Subject / Inquiry Type <span className="text-red-700" aria-hidden="true">*</span>
          </label>
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
            className={`w-full px-4 py-3 text-sm text-slate-900 bg-white border rounded-xl focus-ring transition-colors ${
              errors.subject ? "border-red-600 ring-1 ring-red-600" : "border-slate-300"
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
          {errors.subject && (
            <p id="contact-subject-error" className="text-xs text-red-700 mt-1.5 font-medium flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{errors.subject}</span>
            </p>
          )}
        </div>

        {/* Order / Result ID (Optional) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="contact-result-id"
              className="block text-xs sm:text-sm font-bold text-slate-900"
            >
              Photo Result ID
            </label>
            <span className="text-xs text-slate-500 font-medium">(Optional)</span>
          </div>
          <input
            id="contact-result-id"
            type="text"
            name="resultId"
            value={resultId}
            onChange={(e) => setResultId(e.target.value)}
            className="w-full px-4 py-3 text-sm text-slate-900 bg-white border border-slate-300 rounded-xl focus-ring font-mono"
            placeholder="e.g. res_1727456789 or UUID"
          />
          <p className="text-xs text-slate-600 mt-1 font-medium">
            Found on your photo preview page or confirmation.
          </p>
        </div>

        {/* Message */}
        <div>
          <label
            htmlFor="contact-message"
            className="block text-xs sm:text-sm font-bold text-slate-900 mb-1.5"
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
            className={`w-full px-4 py-3 text-sm text-slate-900 bg-white border rounded-xl focus-ring transition-colors ${
              errors.message ? "border-red-600 ring-1 ring-red-600" : "border-slate-300"
            }`}
            placeholder="Please describe your question or issue in detail…"
          />
          {errors.message && (
            <p id="contact-message-error" className="text-xs text-red-700 mt-1.5 font-medium flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{errors.message}</span>
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full inline-flex items-center justify-center gap-2 bg-[#4D7C0F] hover:bg-[#3F650C] !text-white text-white font-bold text-base py-3.5 sm:py-4 rounded-xl transition-colors text-center shadow-xs focus-ring disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin shrink-0" aria-hidden="true" />
              <span>Sending Message…</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" aria-hidden="true" />
              <span>Send Message</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
