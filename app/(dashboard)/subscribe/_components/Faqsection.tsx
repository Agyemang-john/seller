"use client";

import { useState } from "react";
import { Box, Typography, Paper, Stack, Collapse } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

const FAQS = [
  {
    q: "Can I cancel anytime?",
    a: "Yes. Cancel from your vendor dashboard at any time. You keep full access until the end of your current billing period, then your account moves to Free automatically. No cancellation fees.",
  },
  {
    q: "What happens if my payment fails?",
    a: "We retry the charge over 3 consecutive days and email you each time. If all retries fail, your account enters a grace period before downgrading to Free. Your products and data are never deleted.",
  },
  {
    q: "Can I upgrade mid-cycle?",
    a: "Absolutely. When you upgrade, the unused days on your current plan are credited toward the new one. You only pay the prorated difference for the remainder of the billing cycle.",
  },
  {
    q: "Is my card stored securely?",
    a: "We never store your card details on our servers. All card data is handled exclusively by Paystack, which is PCI-DSS Level 1 compliant. We only keep a reusable authorization token that Paystack issues.",
  },
  {
    q: "What payment methods do you accept?",
    a: "Visa and Mastercard cards, MTN Mobile Money, Vodafone Cash, AirtelTigo Money, and direct bank transfer. All payments are processed in Ghanaian Cedis (GHS).",
  },
  {
    q: "What happens to my products if I downgrade?",
    a: "Existing products beyond your new plan's limit are hidden from buyers but never deleted. Once you upgrade again, they all become visible immediately. You can also choose which products to keep active.",
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
        <Typography sx={{ fontFamily: "serif", fontSize: 34, fontWeight: 700, letterSpacing: "-1px" }} color="text.primary">
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