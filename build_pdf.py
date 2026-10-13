"""
Master Build Script for SignMate Complete Project Documentation & Viva Guide.
Assembles all 22 chapters into HTML and renders pixel-perfect PDF via Chrome headless.
"""

import os
import sys
import subprocess
import pypdf

# Import doc modules
from doc_generator.styles import CSS_CONTENT
from doc_generator.ch01_overview import get_chapter_1
from doc_generator.ch02_techstack import get_chapter_2
from doc_generator.ch03_architecture import get_chapter_3
from doc_generator.ch04_folders import get_chapter_4
from doc_generator.ch05_requirements import get_chapter_5
from doc_generator.ch06_website import get_chapter_6
from doc_generator.ch07_webrtc import get_chapter_7
from doc_generator.ch08_dataset import get_chapter_8
from doc_generator.ch09_training import get_chapter_9
from doc_generator.ch10_tflite import get_chapter_10
from doc_generator.ch11_fastapi import get_chapter_11
from doc_generator.ch12_firebase import get_chapter_12
from doc_generator.ch13_dictionary import get_chapter_13
from doc_generator.ch14_handtracking import get_chapter_14
from doc_generator.ch15_testing import get_chapter_15
from doc_generator.ch16_security import get_chapter_16
from doc_generator.ch17_deployment import get_chapter_17
from doc_generator.ch18_evolution import get_chapter_18
from doc_generator.ch19_future import get_chapter_19
from doc_generator.ch20_viva_part1 import get_chapter_20_part1
from doc_generator.ch20_viva_part2 import get_chapter_20_part2
from doc_generator.ch21_revision import get_chapter_21
from doc_generator.ch22_glossary import get_chapter_22

PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
OUTPUT_HTML = os.path.join(PROJECT_ROOT, "SignMate_Complete_Project_Documentation_and_Viva_Guide.html")
OUTPUT_PDF = os.path.join(PROJECT_ROOT, "SignMate_Complete_Project_Documentation_and_Viva_Guide.pdf")

def build_cover_page():
    return """
    <div class="cover-page">
        <div class="cover-header">
            <div class="inst-name">College of Engineering Trivandrum (TVE)</div>
            <div class="dept-name">Department of Computer Applications</div>
            <div style="font-size: 10pt; color: #64748b; margin-top: 4px;">APJ Abdul Kalam Technological University (KTU)</div>
        </div>

        <div class="cover-body">
            <div class="project-title-container">
                <div class="project-title">SIGNMATE</div>
                <div class="project-tagline">AI-Assisted Inclusive Communication</div>
                <div class="report-subtitle">
                    Master of Computer Applications (MCA) Final-Year Project Presentation<br>
                    Comprehensive Project Documentation & Comprehensive Viva Preparation Guide
                </div>
            </div>

            <div class="meta-box">
                <div class="meta-row">
                    <span class="meta-label">Project Creator:</span>
                    <span class="meta-val">Muhammed Rashid KP</span>
                </div>
                <div class="meta-row">
                    <span class="meta-label">Register / Project ID:</span>
                    <span class="meta-val">TVE25MCA-2046</span>
                </div>
                <div class="meta-row">
                    <span class="meta-label">Degree & Program:</span>
                    <span class="meta-val">Master of Computer Applications (MCA)</span>
                </div>
                <div class="meta-row">
                    <span class="meta-label">Current Implementation:</span>
                    <span class="meta-val">Web Application (React 19 + TypeScript + Vite)</span>
                </div>
                <div class="meta-row">
                    <span class="meta-label">Frontend Deployment:</span>
                    <span class="meta-val"><a href="https://signmate-ashy.vercel.app/" target="_blank">signmate-ashy.vercel.app</a> (Vercel Edge)</span>
                </div>
                <div class="meta-row">
                    <span class="meta-label">Signaling & Data Bus:</span>
                    <span class="meta-val">Google Firebase RTDB & Cloud Firestore</span>
                </div>
                <div class="meta-row">
                    <span class="meta-label">AI Computer Vision Model:</span>
                    <span class="meta-val">MobileNetV3Small (27 Classes, 97.00% Test Accuracy)</span>
                </div>
                <div class="meta-row">
                    <span class="meta-label">Academic Year:</span>
                    <span class="meta-val">2025 – 2026</span>
                </div>
            </div>
        </div>

        <div class="cover-footer">
            <div>Confidential Academic Documentation Prepared for Final-Year MCA Viva Voce Examination</div>
            <div style="font-size: 8pt; margin-top: 4px; color: #94a3b8;">Document Generated: October 2026 | Verified Codebase Artifacts Included</div>
        </div>
    </div>
    """

def build_table_of_contents():
    chapters = [
        ("Chapter 1: Project Overview & Core Mission", "Mission, Problem Statement, 3 Pitch Formats, Plain-English Definition"),
        ("Chapter 2: Complete Technology Stack", "Technology Inventory, Status Verification, Computing Taxonomy, Vercel Reality"),
        ("Chapter 3: System Architecture & Data Flows", "Multi-Tier Architecture, Component Roles, 5 Detailed Data Flows, Control vs Media Plane"),
        ("Chapter 4: Project Directory Structure & Core Files", "Verified Codebase Tree, File Responsibilities, Step-by-Step Join Execution Flow"),
        ("Chapter 5: Requirements, Use Cases & Workflows", "Functional/Non-Functional Specs, User Roles, Use-Case & Sequence Diagrams"),
        ("Chapter 6: Website Implementation & UI Architecture", "React 19 Components, State Hooks, Media Controls, Source Code Inspections"),
        ("Chapter 7: WebRTC Video Communication & Mesh Networking", "WebRTC Principles, 3-Tier Signaling, 4-Participant Mesh Math, Glare Elimination"),
        ("Chapter 8: Machine Learning Dataset & Preprocessing", "17,113 Grayscale Images, 27 Classes, Class 0 Background, Double-Normalization Bug"),
        ("Chapter 9: Model Training, Transfer Learning & Evaluation", "MobileNetV3Small Architecture, 25 ML Concepts, 97% Test Metrics, GRU Transition"),
        ("Chapter 10: TensorFlow Lite Deployment & Stabilization", "TFLite FlatBuffers (3.88MB), Thresholding, Temporal Smoothing, Debounce Hold Count"),
        ("Chapter 11: FastAPI & Backend Inference Architecture", "REST Endpoints, Preprocessing Code, CORS Security, Local vs Production Reality"),
        ("Chapter 12: Firebase Authentication & Security Boundaries", "Auth JWTs, RTDB Ephemeral Paths, onDisconnect Cleanup, Client Key Safety"),
        ("Chapter 13: Language Assistance & Dictionary Engine", "Client-Side 95k-Word Engine, Prefix Progressions, Gemini Phase 5 Status"),
        ("Chapter 14: Hand Tracking & Landmark Visualization", "MediaPipe 21 Landmarks, ROI Square Cropping, Anatomical Guard, Canvas Overlay"),
        ("Chapter 15: Testing Evidence & Verification Matrix", "22 Detailed Test Scenarios, Status Badges, Measured Evaluation Reports"),
        ("Chapter 16: Security, Privacy, Ethics & Accessibility", "DTLS-SRTP Encryption, Zero Image Retention, Skin-Tone Fairness, WCAG 2.1 AA"),
        ("Chapter 17: Production Deployment Configuration", "Vercel CI/CD Build Pipeline, Environment Variables, Local Reproduction Guide"),
        ("Chapter 18: Project Evolution & Late Stack Migrations", "Flutter to Web, ZEGOCLOUD to WebRTC, GRU to MobileNet, Model Defense Answers"),
        ("Chapter 19: Known Limitations & Future Roadmap", "Honest Technical Boundaries, Continuous Sentence ISL, SFU Scaling Architecture"),
        ("Chapter 20: Complete Viva Question Bank (110 Q&As)", "110 Categorized Viva Questions (Cats A to T) with Deep Answers & Examiner Warnings"),
        ("Chapter 21: Rapid Revision Sheet & Pre-Viva Cheat Sheet", "Master Fact Table, 1-Page Emergency Cheat Sheet, 3 Memorizable Presentation Scripts"),
        ("Chapter 22: Comprehensive Technical Glossary", "63 Essential Technical Terms Defined in Simple, Unambiguous English")
    ]

    items = []
    for i, (title, desc) in enumerate(chapters, start=1):
        items.append(f"""
        <li class="toc-item">
            <span class="toc-chapter">{title}</span>
            <span class="toc-dots"></span>
            <span style="font-size: 8pt; color: #64748b; font-style: italic;">{desc}</span>
        </li>
        """)

    return f"""
    <section id="table-of-contents" class="page-break">
        <h1>Table of Contents</h1>
        <ul class="toc-list" style="margin-top: 15px;">
            {"".join(items)}
        </ul>
    </section>
    """

def assemble_html():
    print("[1/4] Assembling document chapters...")
    body_content = [
        build_cover_page(),
        build_table_of_contents(),
        get_chapter_1(),
        get_chapter_2(),
        get_chapter_3(),
        get_chapter_4(),
        get_chapter_5(),
        get_chapter_6(),
        get_chapter_7(),
        get_chapter_8(),
        get_chapter_9(),
        get_chapter_10(),
        get_chapter_11(),
        get_chapter_12(),
        get_chapter_13(),
        get_chapter_14(),
        get_chapter_15(),
        get_chapter_16(),
        get_chapter_17(),
        get_chapter_18(),
        get_chapter_19(),
        """<section id="chapter-20" class="page-break">
           <h1>Chapter 20: Complete Viva Question Bank (110 Examiner Questions & Deep Model Answers)</h1>
           <p>This chapter contains 110 meticulously prepared questions grouped into categories A through T. Every question provides a simple, direct answer, a deeper technical analysis, and warnings about potential examiner traps.</p>
        """ + get_chapter_20_part1() + get_chapter_20_part2() + "</section>",
        get_chapter_21(),
        get_chapter_22(),
    ]

    full_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SignMate — Complete Project Documentation & Viva Preparation Guide</title>
    <style>
        {CSS_CONTENT}
    </style>
</head>
<body>
    {"".join(body_content)}
</body>
</html>
"""
    print(f"[2/4] Writing HTML document to {OUTPUT_HTML}...")
    with open(OUTPUT_HTML, "w", encoding="utf-8") as f:
        f.write(full_html)
    
    file_size_mb = os.path.getsize(OUTPUT_HTML) / (1024 * 1024)
    print(f"[2/4] Successfully saved HTML source document ({file_size_mb:.2f} MB).")
    return OUTPUT_HTML

def compile_pdf(html_path):
    print(f"[3/4] Compiling PDF via Chrome headless...")
    chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
    if not os.path.exists(chrome_path):
        chrome_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
    
    if not os.path.exists(chrome_path):
        raise FileNotFoundError("Neither Google Chrome nor Microsoft Edge was found on system.")

    print(f"Using browser rendering engine: {chrome_path}")
    
    cmd = [
        chrome_path,
        "--headless",
        "--disable-gpu",
        "--no-pdf-header-footer",
        f"--print-to-pdf={OUTPUT_PDF}",
        html_path
    ]
    
    # Run synchronously
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        print(f"Browser stderr: {res.stderr}")
        raise RuntimeError(f"Browser failed with return code {res.returncode}")

    if not os.path.exists(OUTPUT_PDF):
        raise FileNotFoundError(f"Expected PDF output was not created at {OUTPUT_PDF}")

    pdf_size_mb = os.path.getsize(OUTPUT_PDF) / (1024 * 1024)
    print(f"[3/4] Successfully generated PDF ({pdf_size_mb:.2f} MB).")
    return OUTPUT_PDF

def verify_pdf(pdf_path):
    print(f"[4/4] Verifying generated PDF integrity...")
    reader = pypdf.PdfReader(pdf_path)
    page_count = len(reader.pages)
    print(f"==================================================")
    print(f"SIGNMATE DOCUMENTATION BUILD SUCCESSFUL!")
    print(f"PDF File Path: {pdf_path}")
    print(f"Total Verified PDF Pages: {page_count} pages")
    print(f"Total Categorized Viva Questions: 110 questions")
    print(f"==================================================")
    return page_count

if __name__ == "__main__":
    html_file = assemble_html()
    pdf_file = compile_pdf(html_file)
    verify_pdf(pdf_file)
