"use client";

import { useState } from "react";
import { Box, Typography, Paper, Stack, Collapse } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

const FAQS = [
  {
    q: "Can I cancel anytime?",
    a: "Yes. Cancel from this page and you won't be charged again. You keep your plan until the end of the period you've paid for, then your store moves to Free. Changed your mind? Choose “Keep my plan” any time before that date.",
  },
  {
    q: "How do upgrades work?",
    a: "Upgrades start straight away. Unused days on your current plan are credited, so you only pay the difference for the days left, and your renewal date stays the same. Switching from monthly to yearly starts a new yearly period today, minus your credit.",
  },
  {
    q: "How do downgrades work?",
    a: "Nothing is charged when you downgrade. You keep your current plan until your renewal date, and the new plan starts then at its own price. You can cancel a scheduled downgrade before it happens.",
  },
  {
    q: "What happens if a renewal payment fails?",
    a: "We email you straight away and try again once a day for a few days. If every attempt fails, your store moves to the Free plan. Your products and data are never deleted.",
  },
  {
    q: "What happens to my products if I move to a smaller plan?",
    a: "Products you've already listed stay live. You just can't add new ones until you're under the new plan's listing limit.",
  },
  {
    q: "Which payment methods can I use?",
    a: "Visa, Mastercard and Verve cards, MTN Mobile Money, Vodafone Cash and AirtelTigo Money, all in Ghana Cedis. Cards are processed by Paystack; we only keep a token to charge renewals, never your card number.",
  },
];

export default function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <Box component="section" id="faq" sx={{ pb: 12 }}>
      {/* Heading */}
      <Box sx={{ mb: 4.5 }}>
        <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: "0.18em", display: "block", mb: 1.25 }}>
          Questions
        </Typography>
        <Typography sx={{ fontFamily: "var(--font-figtree), system-ui, sans-serif", fontSize: 34, fontWeight: 700, letterSpacing: "-1px" }} color="text.primary">
          Frequently asked
        </Typography>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.5 }}>
        {FAQS.map((faq, i) => {
          const isOpen = open === i;
          return (
            <Paper
              key={i}
              variant="outlined"
              onClick={() => setOpen(isOpen ? null : i)}
              sx={{
                p: "22px 24px",
                borderRadius: "14px",
                cursor: "pointer",
                borderColor: isOpen ? "text.primary" : "divider",
                transition: "border-color 0.2s",
                "&:hover": { borderColor: "text.secondary" },
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1.5}>
                <Typography
                  variant="body2"
                  fontWeight={600}
                  color={isOpen ? "text.primary" : "text.secondary"}
                  sx={{ lineHeight: 1.5, transition: "color 0.2s" }}
                >
                  {faq.q}
                </Typography>
                <Box
                  sx={{
                    width: 22, height: 22, borderRadius: "6px", flexShrink: 0,
                    border: "1px solid", borderColor: isOpen ? "text.primary" : "divider",
                    bgcolor: isOpen ? "text.primary" : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.2s",
                  }}
                >
                  {isOpen
                    ? <RemoveIcon sx={{ fontSize: 13, color: "background.paper" }} />
                    : <AddIcon    sx={{ fontSize: 13, color: "text.secondary" }} />
                  }
                </Box>
              </Stack>

              <Collapse in={isOpen}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontWeight: 300, lineHeight: 1.7, mt: 1.75 }}
                >
                  {faq.a}
                </Typography>
              </Collapse>
            </Paper>
          );
        })}
      </Box>
    </Box>
  );
}