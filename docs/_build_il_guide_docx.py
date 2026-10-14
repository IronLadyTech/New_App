"""One-off builder for IL Guide Word doc. Run: python docs/_build_il_guide_docx.py"""
from pathlib import Path

from docx import Document
from docx.shared import Pt
from docx.enum.text import WD_ALIGN_PARAGRAPH

OUT = Path(__file__).resolve().parent / "IL_Guide_Setup_and_Whisper_Guide.docx"


def add_heading(doc, text, level=1):
    doc.add_heading(text, level=level)


def add_para(doc, text, bold=False):
    p = doc.add_paragraph()
    run = p.add_run(text)
    run.bold = bold
    run.font.size = Pt(11)
    return p


def add_bullets(doc, items):
    for item in items:
        p = doc.add_paragraph(item, style="List Bullet")
        for run in p.runs:
            run.font.size = Pt(11)


def add_table(doc, headers, rows):
    table = doc.add_table(rows=1 + len(rows), cols=len(headers))
    table.style = "Table Grid"
    hdr = table.rows[0].cells
    for i, h in enumerate(headers):
        hdr[i].text = h
    for r, row in enumerate(rows):
        cells = table.rows[r + 1].cells
        for i, val in enumerate(row):
            cells[i].text = str(val)
    doc.add_paragraph()


def main():
    doc = Document()
    title = doc.add_heading("IL Guide — Setup & Whisper Guide", 0)
    title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    add_para(
        doc,
        "Iron Lady app · Leadership Essentials Program (LEP) · For CEM, operations, and developers",
    )
    add_para(doc, "October 2026", bold=False)

    add_heading(doc, "What IL Guide is", 1)
    add_para(
        doc,
        "IL Guide is the in-app mentor. A whisper is one short message on a screen — not a chat. "
        "Learners can dismiss it. It does not keep a conversation thread.",
    )

    add_heading(doc, "The five jobs", 1)
    add_table(
        doc,
        ["Job", "Purpose", "Example"],
        [
            ("Onboard", "First visit welcome", "Welcome + program + open My Program"),
            ("Nudge", "Progress and motivation", "% complete, next task, approved quote"),
            ("Recommend", "Learn tab", "Start with [next task title]"),
            ("Event", "Calendar / announcement", "Upcoming session for your batch"),
        ],
    )
    add_para(doc, "The app never invents dates or quotes. Quotes come from CMS or an approved list.")

    add_heading(doc, "Where learners see whispers (LEP)", 1)
    add_table(
        doc,
        ["Tab", "What happens"],
        [
            ("Home", "Dynamic message; may show Open next task"),
            ("Learn", "Dynamic message + city chips (design kept)"),
            ("Engage", "Dynamic community message + industry chips"),
            ("Profile", "No whisper — program, batch, Refresh access live here"),
        ],
    )

    add_heading(doc, "How setup is made (four layers)", 1)
    add_bullets(
        doc,
        [
            "CMS admin (web) — settings saved in Firebase as cms_config/ilGuide",
            "Cloud Functions — ilGuideWhisper + phone/Zoho sync (refreshMyAccess, resolvePhoneAccess)",
            "Optional API — il-guide-api on a server (advanced wording via OpenAI)",
            "Mobile app — reads CMS, builds context, shows the card",
        ],
    )

    add_heading(doc, "CEM: turn IL Guide on in CMS", 1)
    add_bullets(
        doc,
        [
            "Open admin: local http://localhost:8081/admin#ilguide or production /admin#ilguide after web deploy",
            "Sign in as staff (admin, CEM, moderator, PL, superadmin)",
            "IL Guide tab → IL Guide is on",
            "Enable surfaces: Home, Learn, Community (and first-login if needed)",
            "Enable jobs: onboard, nudge, recommend, event as required",
            "Edit quotations if needed → Save changes",
            "App picks up changes within about one minute",
        ],
    )

    add_heading(doc, "How the next task is chosen", 1)
    add_para(
        doc,
        "For LEP, IL Guide looks at My Program journey tasks first (VIA, CoDeSeF, Program Schedule, Day 1, etc.) "
        "in phase order. It uses what the learner has already completed. It can also use web LMS task progress. "
        "Learn whispers can include Open next task to jump straight to that task screen.",
    )

    add_heading(doc, "Phone login and batch on Profile", 1)
    add_bullets(
        doc,
        [
            "Learner signs in with registered mobile → Zoho checks the number",
            "After OTP, refreshMyAccess copies program and batch into Firebase profile",
            "Profile → Program & batch shows LEP and batch name",
            "If batch says not set in Zoho yet: set Batch on the Lead in Zoho, then learner taps Just paid? Refresh access",
            "Demo flow bar without real login will not show batch or full IL Guide behaviour",
        ],
    )

    add_heading(doc, "Developer / Varun: deploy checklist", 1)
    add_bullets(
        doc,
        [
            "Copy app-new/docs/cloud-functions/ilGuideWhisper.js into D:\\LMS\\new_lms\\functions and export in index.js",
            "Deploy: ilGuideWhisper, resolvePhoneAccess, refreshMyAccess, updateMyWelcomeProfile",
            "Firestore rules already allow learners to read live CMS content and ilGuide config when signed in",
            "Optional: deploy il-guide-api and set EXPO_PUBLIC_IL_GUIDE_API_URL in the app build",
        ],
    )

    add_heading(doc, "Test plan (pilot)", 1)
    add_bullets(
        doc,
        [
            "CMS: IL Guide on; Home, Learn, Community on",
            "Real phone login (not demo-only)",
            "Home / Learn / Engage: whisper appears",
            "Open next task opens correct My Program task",
            "Dismiss hides that message until a different one is chosen",
            "Profile shows LEP + batch after Refresh access",
        ],
    )

    add_heading(doc, "Not the same as Notification events", 1)
    add_para(
        doc,
        "Notification events in CMS (admin#notifications) are for push, WhatsApp, and email rules. "
        "IL Guide whisper is in-app only when the learner opens a tab.",
    )

    add_heading(doc, "Reference", 1)
    add_para(doc, "Markdown source in repo: docs/IL_GUIDE_WHISPER_GUIDE.md")

    doc.save(OUT)
    print(f"Wrote {OUT}")


if __name__ == "__main__":
    main()
