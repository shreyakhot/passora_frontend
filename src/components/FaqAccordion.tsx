import React from "react";
import { Plus } from "lucide-react";

export interface FaqItem {
  question: string;
  answer: string;
  answerHtml?: string;
}

interface FaqAccordionProps {
  faqs: FaqItem[];
  title?: string;
}

export default function FaqAccordion({ faqs, title }: FaqAccordionProps) {
  if (!faqs || faqs.length === 0) return null;

  return (
    <div className="mt-14 border-t border-ink-200 pt-12" id="faq" aria-label="Frequently Asked Questions">
      <div className="mb-8">
        <span className="eyebrow">FAQ</span>
        <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-ink-950 sm:text-4xl">
          Frequently asked questions
        </h2>
        <p className="mt-2 text-base text-ink-600">
          Everything you need to know about {title || "passport photo"} requirements and specifications.
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, index) => (
          <details
            key={index}
            className="group overflow-hidden rounded-2xl border border-ink-200 bg-white transition-colors open:border-brand-200 open:bg-brand-50/40 [&_summary::-webkit-details-marker]:hidden"
            open={index === 0}
          >
            <summary className="flex cursor-pointer select-none items-center justify-between gap-4 p-5 text-left font-display text-base font-bold text-ink-950 focus-ring sm:text-lg">
              <span className="leading-snug">{faq.question}</span>
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink-100 text-ink-700 transition-all duration-200 group-open:rotate-45 group-open:bg-brand-600 group-open:text-white"
                aria-hidden="true"
              >
                <Plus className="h-4 w-4" />
              </span>
            </summary>
            <div className="px-5 pb-5 text-sm leading-relaxed text-ink-700 sm:text-base">
              {faq.answerHtml ? (
                <div
                  className="[&_a]:font-semibold [&_a]:text-brand-700 [&_a]:underline [&_a:hover]:text-brand-800 [&_li]:my-1 [&_p]:my-1.5 [&_ul]:list-disc [&_ul]:pl-5"
                  dangerouslySetInnerHTML={{ __html: faq.answerHtml }}
                />
              ) : (
                <p className="my-1.5">{faq.answer}</p>
              )}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
