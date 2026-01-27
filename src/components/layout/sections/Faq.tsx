'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/src/components/ui/accordion/accordion'

const faqs = [
  {
    question: 'How frequently is the sales data updated?',
    answer:
      'Actuals are synced monthly from the ERP system. Forecasts (Board OP3, OP6 LE, etc.) are updated after every regional finance review meeting.',
  },
  {
    question:
      'What do the different forecast versions (OP3, OP6, LE) represent?',
    answer:
      'OP represents the Operating Plan (Budget). OP3 is the board-approved plan established at the start of the year. LE stands for Latest Estimate; OP6 and OP9 are updated re-forecasts based on half-year and Q3 performance respectively.',
  },
  {
    question: 'How is the YTD (Year-to-Date) growth calculated?',
    answer:
      'YTD growth is calculated by comparing the cumulative Actuals of the current fiscal year against the selected Target Measure (usually Board OP3 or Prior Year) for the same period.',
  },
  {
    question: 'Can I see a breakdown of sales by region or brand?',
    answer:
      'Yes, the "Brand Comparison" chart below the main KPIs allows you to compare performance across different brands or regions. For a full row-by-row breakdown, visit the Details page.',
  },
  {
    question: 'How are "Actuals" and "Forecast" values consolidated?',
    answer:
      'Data is consolidated using a standardized currency conversion rate set at the beginning of the fiscal year to ensure consistent comparison between regions without the volatility of daily exchange rates.',
  },
]

export default function FAQSection() {
  return (
    <section id="faq" className="container mx-auto py-12 md:py-24">
      <div className="mx-auto max-w-3xl px-4">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-gray-50">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Everything you need to know about our sales reporting and
            forecasting process.
          </p>
        </div>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-base font-semibold">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 dark:text-gray-400">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
