"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export interface FaqItem {
  question: string;
  answer: string;
}

interface FaqAccordionProps {
  items: FaqItem[];
  title?: string;
  subtitle?: string;
}

export function FaqAccordion({
  items,
  title = "Frequently Asked Questions",
  subtitle = "Common questions and helpful answers about using IgWorld.",
}: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="my-12 max-w-3xl mx-auto px-4 sm:px-6">
      <div className="text-center mb-8 space-y-1.5">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-md mx-auto">
            {subtitle}
          </p>
        )}
      </div>

      <div className="space-y-2">
        {items.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className="product-card overflow-hidden transition-all"
            >
              <button
                type="button"
                onClick={() => toggle(index)}
                className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e1306c]/40 cursor-pointer select-none"
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${index}`}
                id={`faq-question-${index}`}
              >
                <span className="font-semibold text-sm sm:text-[15px] text-[var(--text-primary)]">
                  {item.question}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-[var(--text-muted)] transition-transform duration-200 shrink-0 stroke-[1.8] ${isOpen ? "rotate-180 text-[var(--text-primary)]" : ""
                    }`}
                />
              </button>

              {isOpen && (
                <div
                  id={`faq-answer-${index}`}
                  role="region"
                  aria-labelledby={`faq-question-${index}`}
                  className="px-5 pb-4 pt-1 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed border-t border-[var(--border-subtle)]"
                >
                  {item.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
