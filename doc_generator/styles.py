"""
CSS Stylesheet for publication-grade academic MCA project documentation.
Optimized for high-resolution screen viewing and pixel-perfect A4 PDF printing.
"""

CSS_CONTENT = """
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

@page {
    size: A4 portrait;
    margin: 18mm 16mm 20mm 16mm;
    @bottom-right {
        content: "Page " counter(page);
        font-family: 'Inter', sans-serif;
        font-size: 8pt;
        color: #64748b;
    }
    @bottom-left {
        content: "SignMate (TVE25MCA-2046) - Final Year Project Documentation & Viva Guide";
        font-family: 'Inter', sans-serif;
        font-size: 8pt;
        color: #64748b;
    }
}

* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    font-size: 10pt;
    line-height: 1.55;
    color: #1e293b;
    background-color: #ffffff;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
}

/* Page Break Controls */
.page-break {
    page-break-before: always;
    break-before: page;
}

.avoid-break {
    page-break-inside: avoid;
    break-inside: avoid;
}

/* Cover Page */
.cover-page {
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 20mm 10mm 15mm 10mm;
    text-align: center;
    page-break-after: always;
    break-after: page;
}

.cover-header {
    margin-bottom: 25px;
}

.inst-name {
    font-size: 14pt;
    font-weight: 700;
    text-transform: uppercase;
    color: #0f172a;
    letter-spacing: 1px;
}

.dept-name {
    font-size: 11pt;
    font-weight: 600;
    color: #475569;
    margin-top: 5px;
}

.cover-body {
    margin: auto 0;
}

.project-title-container {
    padding: 25px 0;
    border-top: 3px solid #2563eb;
    border-bottom: 3px solid #2563eb;
    background: #f8fafc;
    border-radius: 8px;
    margin-bottom: 25px;
}

.project-title {
    font-size: 32pt;
    font-weight: 800;
    color: #1e3a8a;
    letter-spacing: -0.5px;
    margin-bottom: 8px;
}

.project-tagline {
    font-size: 14pt;
    font-weight: 600;
    color: #2563eb;
    text-transform: uppercase;
    letter-spacing: 1.5px;
}

.report-subtitle {
    font-size: 12pt;
    font-weight: 500;
    color: #334155;
    margin-top: 15px;
    line-height: 1.6;
}

.meta-box {
    display: inline-block;
    text-align: left;
    background: #ffffff;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    padding: 16px 28px;
    margin-top: 25px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.meta-row {
    font-size: 9.5pt;
    margin-bottom: 6px;
    display: flex;
}

.meta-row:last-child {
    margin-bottom: 0;
}

.meta-label {
    font-weight: 700;
    width: 170px;
    color: #475569;
}

.meta-val {
    font-weight: 600;
    color: #0f172a;
}

.cover-footer {
    border-top: 1px solid #e2e8f0;
    padding-top: 15px;
    font-size: 9pt;
    color: #64748b;
}

/* Typography & Headings */
h1 {
    font-size: 18pt;
    font-weight: 800;
    color: #0f172a;
    border-bottom: 2px solid #2563eb;
    padding-bottom: 6px;
    margin-top: 24px;
    margin-bottom: 14px;
    page-break-after: avoid;
    break-after: avoid;
}

h2 {
    font-size: 13pt;
    font-weight: 700;
    color: #1e3a8a;
    margin-top: 18px;
    margin-bottom: 10px;
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 4px;
    page-break-after: avoid;
    break-after: avoid;
}

h3 {
    font-size: 11pt;
    font-weight: 600;
    color: #334155;
    margin-top: 14px;
    margin-bottom: 8px;
    page-break-after: avoid;
    break-after: avoid;
}

p {
    margin-bottom: 10px;
    text-align: justify;
}

ul, ol {
    margin-left: 20px;
    margin-bottom: 10px;
}

li {
    margin-bottom: 4px;
}

/* Status Badges */
.badge {
    display: inline-block;
    padding: 2px 7px;
    font-size: 7.5pt;
    font-weight: 700;
    border-radius: 4px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-left: 6px;
    vertical-align: middle;
}

.badge-verified {
    background-color: #dcfce7;
    color: #166534;
    border: 1px solid #86efac;
}

.badge-unverified {
    background-color: #fef9c3;
    color: #854d0e;
    border: 1px solid #fde047;
}

.badge-partial {
    background-color: #ffedd5;
    color: #9a3412;
    border: 1px solid #fdba74;
}

.badge-planned {
    background-color: #f1f5f9;
    color: #475569;
    border: 1px solid #cbd5e1;
}

/* Callout Boxes */
.note-box {
    background-color: #f8fafc;
    border-left: 4px solid #3b82f6;
    padding: 10px 14px;
    margin: 12px 0;
    border-radius: 0 6px 6px 0;
    font-size: 9pt;
}

.note-box-title {
    font-weight: 700;
    color: #1d4ed8;
    margin-bottom: 4px;
    display: flex;
    align-items: center;
    gap: 6px;
}

.alert-box {
    background-color: #fef2f2;
    border-left: 4px solid #ef4444;
    padding: 10px 14px;
    margin: 12px 0;
    border-radius: 0 6px 6px 0;
    font-size: 9pt;
}

.alert-box-title {
    font-weight: 700;
    color: #b91c1c;
    margin-bottom: 4px;
}

.success-box {
    background-color: #f0fdf4;
    border-left: 4px solid #22c55e;
    padding: 10px 14px;
    margin: 12px 0;
    border-radius: 0 6px 6px 0;
    font-size: 9pt;
}

.success-box-title {
    font-weight: 700;
    color: #15803d;
    margin-bottom: 4px;
}

/* Tables */
table {
    width: 100%;
    border-collapse: collapse;
    margin: 12px 0;
    font-size: 8.5pt;
    page-break-inside: avoid;
    break-inside: avoid;
}

th, td {
    border: 1px solid #cbd5e1;
    padding: 6px 8px;
    text-align: left;
    vertical-align: top;
}

th {
    background-color: #f1f5f9;
    font-weight: 700;
    color: #0f172a;
    text-transform: uppercase;
    font-size: 8pt;
    letter-spacing: 0.3px;
}

tr:nth-child(even) td {
    background-color: #f8fafc;
}

/* Code Snippets */
pre {
    background-color: #0f172a;
    color: #f8fafc;
    font-family: 'JetBrains Mono', Consolas, Monaco, monospace;
    font-size: 8pt;
    line-height: 1.45;
    padding: 10px 12px;
    border-radius: 6px;
    margin: 10px 0;
    overflow-x: auto;
    border: 1px solid #1e293b;
    page-break-inside: avoid;
    break-inside: avoid;
}

code {
    font-family: 'JetBrains Mono', Consolas, Monaco, monospace;
    font-size: 8.5pt;
    background-color: #f1f5f9;
    color: #0f172a;
    padding: 1px 4px;
    border-radius: 4px;
    border: 1px solid #e2e8f0;
}

pre code {
    background-color: transparent;
    color: inherit;
    padding: 0;
    border: none;
    font-size: 8pt;
}

.code-title {
    background: #1e293b;
    color: #94a3b8;
    font-family: 'JetBrains Mono', Consolas, monospace;
    font-size: 7.5pt;
    font-weight: 600;
    padding: 4px 10px;
    border-top-left-radius: 6px;
    border-top-right-radius: 6px;
    border-bottom: 1px solid #334155;
    margin-bottom: -10px;
}

/* Diagram Boxes */
.diagram-container {
    background: #f8fafc;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    padding: 14px;
    margin: 14px 0;
    text-align: center;
    page-break-inside: avoid;
    break-inside: avoid;
}

.diagram-caption {
    font-size: 8.5pt;
    font-weight: 600;
    color: #475569;
    margin-top: 8px;
    text-align: center;
}

/* Viva Q&A Styles */
.viva-card {
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 12px 14px;
    margin-bottom: 12px;
    background: #ffffff;
    page-break-inside: avoid;
    break-inside: avoid;
}

.viva-card.viva-trap {
    border-left: 4px solid #ef4444;
}

.viva-card.viva-normal {
    border-left: 4px solid #2563eb;
}

.viva-q {
    font-size: 10pt;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 6px;
}

.viva-num {
    display: inline-block;
    background: #1e3a8a;
    color: #ffffff;
    font-size: 8pt;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 4px;
    margin-right: 6px;
}

.viva-a {
    font-size: 9.5pt;
    color: #334155;
    margin-bottom: 6px;
    line-height: 1.5;
}

.viva-deep {
    font-size: 9pt;
    color: #475569;
    background: #f8fafc;
    padding: 8px 10px;
    border-radius: 4px;
    margin-top: 6px;
    border: 1px dashed #cbd5e1;
}

.viva-example {
    font-size: 8.5pt;
    color: #1e40af;
    margin-top: 4px;
    font-weight: 500;
}

.viva-warn {
    font-size: 8.5pt;
    color: #b91c1c;
    background: #fff1f2;
    padding: 4px 8px;
    border-radius: 4px;
    margin-top: 6px;
    font-weight: 600;
    border: 1px solid #fecdd3;
}

/* Table of Contents */
.toc-list {
    list-style: none;
    margin-left: 0;
}

.toc-item {
    display: flex;
    justify-content: space-between;
    padding: 5px 0;
    border-bottom: 1px dotted #cbd5e1;
    font-size: 9.5pt;
}

.toc-chapter {
    font-weight: 700;
    color: #0f172a;
}

.toc-dots {
    flex-grow: 1;
    border-bottom: 1px dotted #94a3b8;
    margin: 0 8px 4px 8px;
}

.toc-page {
    font-weight: 600;
    color: #2563eb;
}
"""
