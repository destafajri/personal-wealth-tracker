prompt that i used on v0, bolt, lovable to recreate the web:


Act as an expert UI/UX Designer and Frontend Developer. Your task is to revamp and build a modern, high-converting UI for a Personal Finance web app named 'Cermat’(https://6c5b-114-10-46-78.ngrok-free.app/). The goal is to fix a clunky multi-step wizard flow and replace it with a seamless, intuitive experience.

The design must be clean, spacious, trustworthy, and heavily inspired by shadcn/ui components and Tailwind CSS.

### Global UI/UX Specifications:
* **Background:** A subtle, calming gradient (`bg-gradient-to-b from-white to-gray-50`).
* **Cards:** Clean white with smooth soft shadows (`bg-white shadow-sm rounded-2xl border border-gray-100 hover:shadow-md transition-all`).
* **Primary Accent Color:** Vibrant Emerald Green (`emerald-600`) to convey financial trust, growth, and safety.
* **Typography:** Sans-serif, modern, clean (e.g., Inter or Geist).
* **Vibe:** Professional, interactive, and visually engaging. Strictly avoid boring, standard HTML forms.

Please generate the code/design for two main pages:

---

### Page 1: The Landing Page (Home)
* **Navigation Bar:** Minimalist. Left: "Cermat" text logo in bold `slate-900` next to a small, green shield-check or wallet icon. Right: "Cek Keuangan dalam 10 Menit" in small gray font.
* **Hero Section (Center Aligned):** Generous vertical padding (`py-24`).
* **H1 Headline:** "Aman gak kalau gw KPR, Gadai, atau Cicil?" (large, bold `text-4xl` or `5xl text-slate-900`, balanced line-height).
* **Sub-headline:** "Berapa max utang yang aman? Cek keuangan kamu dalam 10 menit." (`text-lg text-slate-600 mt-4`).
* **Trust Badges:** Centered flex row with two pill-shaped badges (`bg-green-50 text-emerald-700 border border-green-100`). Badge 1: Lock icon + "Tanpa daftar". Badge 2: Cloud-Off icon + "Tanpa cloud".
* **Action Cards Grid (Main CTA):** A 2-column grid (`max-w-4xl`, gap-6, centered).
    * **Card 1 (Primary):** Highlighted with a subtle green border on top. Icon: User/document in a light green rounded-xl box. Title: "Mulai dari Snapshot" (bold `text-xl`). Desc: "Isi data kamu sendiri (5–10 menit)." Action: Full-width solid emerald button ("Mulai" + chevron-right icon).
    * **Card 2 (Secondary):** Standard border. Icon: Play/sparkle in a light gray rounded-xl box. Title: "Coba dengan data contoh" (bold `text-xl`). Desc: "Skip dulu, lihat tools-nya." Action: Full-width outline button (`bg-green-50 text-emerald-700`) saying "Coba" + arrow-right icon.
* **Footer:** Center-aligned, small gray text: "Cermat. Data diproses secara lokal di browser Anda untuk privasi maksimal." + small lock icon.

---

### Page 2: The 'Financial Snapshot' Page (App Interface Revamp)
**Crucial UX Change:** Abandon the old, paginated step-by-step wizard. Instead, use a modern **Split-Screen Layout** (Desktop) / Stacked (Mobile) to keep the user engaged.

**1. Top Header:**
* Left: Green text logo 'Cermat' with subtext 'Kalkulator Keuangan'.
* Right: Oval gray badge "Gratis - Tanpa Login".

**2. Left Column (Sticky Sidebar - Real-Time Dashboard):**
This replaces the old top summary bar. It must stay sticky as the user scrolls the form.
* **Title:** "Ringkasan Cepat"
* **Data Grid (2x2):** Small elegant cards for:
    * "Penghasilan" (Green, arrow up, value: e.g., Rp 18.000.000)
    * "Pengeluaran" (Red, arrow down, value: Rp 0)
    * "Total Aset" (Blue, line chart icon, value: Rp 0)
    * "Kekayaan Bersih" (Green, bar chart icon, value: Rp 0)
* **Highlight Bar:** A larger, light green card (`bg-emerald-50`) below the grid saying "Surplus Bulanan" with a prominent value (e.g., +Rp 18.000.000).

**3. Right Column (Scrollable Input Flow):**
Instead of separate pages, use a seamless vertical flow (using elegant cards or expanded accordions) for the 7 categories: Penghasilan, Pengeluaran, Tabungan, Investasi, Aset, Utang, Ringkasan. Include a subtle vertical timeline/progress line connecting them on the left side of this column.

* **Section 1: Penghasilan Bulanan (Example layout for sections)**
    * **Header:** Large title "Penghasilan Bulanan" + subtext "Masukkan semua sumber pendapatan Anda per bulan".
    * **Input Fields Grid:** Clean input cards with currency styling.
        * Label: "Gaji Pokok" (Placeholder: Rp 15.000.000) + subtext "Gaji utama dari pekerjaan" + info tooltip icon.
        * Label: "Pendapatan Sampingan" (Placeholder: Rp 3.000.000) + subtext "Freelance, bisnis sampingan" + info tooltip icon.
        * Label: "Pendapatan Lainnya" (Placeholder: Rp 1.000.000) + subtext "Dividen, sewa, dll" + info tooltip icon.
    * **Section Subtotal:** A light green wallet card summarizing "Total Penghasilan Bulanan: Rp 19.000.000".
    * **Success state:** A subtle checkmark text: "Bagus! Anda telah menginput penghasilan Anda. Lanjut ke pengeluaran rutin."

* **Bottom Action Bar:** "Sebelumnya" (outline) on the left, "Simpan & Lanjutkan" (solid green) on the right. Below it, a small lock icon with text: "Privasi Anda terjaga. Data disimpan lokal di browser Anda, tidak dikirim ke server."
