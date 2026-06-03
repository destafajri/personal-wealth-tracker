# Cermat — MVP Concept Brief

**Status:** Concept
**Last updated:** 2026-05-26
**Working brand name:** **Cermat** *(Indonesian: careful, prudent, meticulous)*. Alternates: *Hitungin*, *Tepat*, *Bobot*, *Sehat Finansial*. Final TBD.
**Companion doc:** `personal-wealth-platform-prd-en.md` (full PRD)

---

## 1. The product, in one sentence

**Cermat is a privacy-first web app for Indonesian adults to track their full financial picture (with live IDX stock prices and per-emiten accumulation), set goals (DP rumah, FI, dana pendidikan), simulate big decisions ("Mau KPR?" "Mau Gadai?" "Mau cicil?"), AND see capacity-based options ("Berapa max utang aman?" "Apa yang bisa gw lakukan dengan modal likuid?") — all without signup or sending data to a server.**

---

## 2. Core Concept — Four Modes

### Mode 1 — Snapshot

User inputs current state via a guided form. Includes:

- Standard assets: cash, gold (with live IDR/gram), deposito, RD, SBN, property, vehicles, pension
- **Per-emiten stock subsection**: ticker + lots sekarang + lots target 100% + target bobot % + avg dividend yield + last dividend per lembar — with **live IDX prices** auto-fetched (Yahoo Finance via `BBCA.JK` pattern)
- Liabilities and expenses — two structured sub-modules:
  - **Cicilan Aktif** — one row per active amortizing debt (KPR / KPM / Bank-KTA / Pinjol / Paylater / KK / Lain) with sisa pokok + cicilan/bln + bunga + tenor sisa + jenis bunga (Anuitas/Flat/Floating/Revolving)
  - **Gadai** — gold-pawn tracking with grams, tempo, and Rasio Tertahan
- App computes **9 metrics** (8 health + 1 capacity) with green/amber/red thresholds where applicable.

Power users see per-emiten depth. Basic users can leave the stocks section empty and use only the cash/property/debt fields. **Progressive disclosure** — advanced fields collapsed by default.

### Mode 2 — Simulator ⭐ (the killer feature — two simulator families, 7 simulators)

**Family A — Decision Simulators (4): "Mau gw X?"** *(forward-looking)*

| Simulator | Inputs | Reveals |
|---|---|---|
| **"Mau ambil KPR"** | Harga rumah, DP, tenor, suku bunga | DSR + Runway shift + **goal impact** (e.g., "FI mundur 3 tahun") |
| **"Mau Gadai Emas"** | Gram pawned, tempo, bunga | Modal cair, Defisit/bulan, Rasio Tertahan |
| **"Mau cicil"** (kendaraan/elektronik) | Harga, DP, tenor, bunga | DSR after new cicilan + impact on Savings Rate |
| **"Custom skenario"** | Free-form tweaks | Side-by-side delta on all metrics + goal shifts |

**Family B — Capacity Simulators (3): "Bisa gw apa?" / "Berapa max?"** *(reverse-looking)*

| Simulator | What it answers | Sample output |
|---|---|---|
| **"Max Utang Aman"** | Given current income + cicilan aktif, what's the max NEW monthly cicilan that keeps DSR below "Waspada" threshold? | *"Berdasarkan gaji Rp 18jt + cicilan aktif Rp 1.5jt, max cicilan baru biar DSR di zona Sehat: Rp 3.9jt/bln. Setara KPR ~Rp 480jt @ 15 tahun @ 7%, atau cicil mobil ~Rp 200jt @ 5 tahun @ 8%."* |
| **"Lunasi Utang Sekarang"** | If user pays off a specific debt (full or partial) from liquid capital, what changes? | Select any debt row from Cicilan Aktif or Gadai → preview side-by-side: liquid drops, debt principal drops, DSR drops, goals shift. For Anuitas/Flat: toggle tenor-shortens vs. cicilan-reduces. For Revolving (KK/Paylater/Pinjol): sisa pokok drops directly. |
| **"Modal Likuid Options"** | Auto-generated list of deployable actions from Modal Siap Distribusi with impact preview | *"Modal Siap Rp 52jt. Opsi yang dihitungkan: lunasi KK (Rp 8jt) → DSR −2pp; prepay KPR (Rp 20jt) → tenor mundur 14 bln; beli BBCA 30 lot (Rp 18jt) → bobot 15→18%; tambah RD → kontribusi Goal FI."* |

Each simulator renders **side-by-side**: *"Posisi Sekarang"* vs. *"Setelah Skenario"*, every metric with delta (▲ / ▼ / ●) and threshold flip (Sehat → Waspada → Bahaya). **Goal projections also shift.**

### Mode 3 — Goals (with FI auto-formula)

User defines financial goals. Per goal:

- **Goal type**: DP Rumah / Dana Pendidikan / Financial Independence / Custom
- **Target amount** (IDR) + **target date**
- **Bucket** — which assets count toward this goal (user tags: "RD + Saham + Deposito untuk FI")
- **Current progress** (auto-computed from tagged assets)
- **Monthly contribution needed** to hit target on time
- **Status**: *On-Track* / *Off-Track* / *At-Risk* (descriptive — no advice)
- **Simulator integration**: scenarios show goal impact — *"Skenario KPR ini bikin target FI mundur 3 tahun."*

**Financial Independence goal — auto-formula:**

When user selects goal type `FINANCIAL_INDEPENDENCE`, target_amount auto-computes from snapshot:

```
FI Number = Pengeluaran Bulanan × 300
          (= 25 tahun × 12 bulan, equivalent to 4% safe withdrawal rule)
```

Displayed as: *"FI Number kamu: Rp 5.4M (asumsi pengeluaran bulanan Rp 18jt × 300)."* User can override the multiplier (e.g., 240 for conservative 4.2%, 360 for ultra-conservative 3.3%).

Multiple goals tracked simultaneously. Each has its own progress bar and projected completion date.

### Mode 4 — Insight (descriptive, never prescriptive — applied across all modes)

Every metric, per-emiten card, goal card, and capacity output carries a plain-Indonesian explainer.

✅ **Allowed:** *"DSR kamu 33% — di zona Waspada (30–40%). Threshold sehat: <30%."*
✅ **Allowed:** *"Modal Siap Distribusi kamu Rp 52jt — cukup untuk lunasi Kartu Kredit (Rp 8jt) dan masih sisa Rp 44jt."*
✅ **Allowed:** *"Max utang baru yang masuk threshold sehat: Rp 3.9jt/bln cicilan."*
✅ **Allowed:** *"Goal FI kamu progress 18% — Rp 970jt dari Rp 5.4M target."*

❌ **Forbidden:** *"Sebaiknya kamu lunasi KK dulu sebelum ambil KPR."*

Non-negotiable. See PRD §9 (OJK risk mitigation).

---

## 3. Why this matters

Indonesian adults face a small number of large, mostly-irreversible financial decisions every year — KPR, Gadai Emas, vehicle financing, starting an investment habit, education planning, FI planning. They also carry a stack of ongoing debts (KPR/KPM cicilan, KK, paylater, pinjol) that interact with every new decision. The existing toolkit is fragmented:

- **Stockbit / Bibit / Pluang** manage existing portfolios; they don't simulate new decisions
- **Loan calculators** give isolated cicilan numbers; they don't tell you whether *your* finances absorb them
- **Spreadsheets** handle tracking well but break on share, can't simulate scenarios, and don't compute capacity-based options
- **Bank/dealer projections** are optimistic by design
- **Friend/family anecdotes** are heavily survivor-biased
- **Nothing answers "apa yang bisa gw lakukan sekarang?"** — capacity questions are uniquely absent from existing tools

**Cermat unifies four mental models** — Track (Snapshot), Plan (Goals), Decide (Decision Simulators), and Discover (Capacity Simulators) — in one privacy-respecting product.

### The differentiating angle

| Factor | Why it matters |
|---|---|
| **Demo-able in 60 seconds** | Slider drag → DSR flip + Goal date shift. Or: Modal Options panel → 5 deployment options ranked by metric impact. |
| **Universal hook** | KPR / Gadai / Cicilan = universal Indonesian financial decisions. DP rumah / FI = universal life goals. |
| **Two question modes** | "Aman gak kalau gw X?" (forward) AND "Apa yang bisa gw lakukan?" (reverse) — competitors only do the first |
| **Depth for sophistication** | Per-emiten + live IDX prices = real fintech-grade depth, not a toy |
| **Privacy-first** | No signup, no server-side user data, no bank linking |
| **Shippable solo** | No auth, no user DB, client-side SPA (Nuxt 3, per tech-design) + small price-proxy backend |

---

## 4. Minimum Lovable Scope — 11-day sprint

| Day | Milestone | "Done" criteria |
|---|---|---|
| 1 | Project scaffold + design tokens + landing page | Vercel deploy works; styleguide route renders |
| 2 | Price proxy backend (IDX via Yahoo + Pegadaian gold + USD/IDR) | All 3 endpoints return cached responses |
| 3 | Snapshot form — basic sections + **Cicilan Aktif row-based table** + 9 metrics (incl. Modal Siap Distribusi) | All metrics compute live; multiple debt rows addable with per-jenis-bunga behavior |
| 4 | Snapshot form — per-emiten Saham subsection with live prices | Per-emiten cards render; live IDX prices update |
| 5 | Goals module — CRUD + bucket tagging + **FI auto-formula** | Multiple goals addable; FI target auto-computes from expenses × 300 |
| 6 | **Decision simulators** — "Mau KPR" + side-by-side with goal impact | KPR simulator shows DSR + goal shift |
| 7 | **Decision simulators** — "Mau Gadai" + "Mau cicil" + Custom | All 4 decision simulators functional |
| 8 | **Capacity simulators** — "Max Utang Aman" + "Lunasi Utang" | Both compute live; descriptive output |
| 9 | **Capacity simulators** — "Modal Likuid Options" panel + Insight engine | Auto-generated options list working; ~50 copy strings audited for OJK |
| 10 | xlsx export (7 visible: Ringkasan, Snapshot, Per-Emiten, Cicilan-Aktif, Goals, Skenario, Kapasitas + hidden `_meta`) + landing polish | Downloads clean, opens in Excel/Sheets |
| 11 | Microcopy pass, OJK disclaimer, edge states, mobile-tolerance | Lighthouse ≥85; ready to ship |

**If running tight, drop in this order:**
1. Simulator "Custom skenario"
2. Simulator "Modal Likuid Options" (keep Max Utang + Lunasi Utang since those are highest-value capacity tools)
3. Mobile polish (just stack with hint)
4. xlsx export sheets beyond Snapshot + Per-Emiten

**Hard floor for a viable launch:** Snapshot (basic + per-emiten) + KPR simulator + Max Utang Aman + Lunasi Utang + Goal tracker with FI formula + 9 metrics + xlsx export. ~8 days minimum.

---

## 5. What's NOT in scope

| Cut feature | Why |
|---|---|
| xlsx **import** / round-trip | Defer to later phase |
| User accounts / login | Privacy pitch + faster ship |
| localStorage autosave | Defer with opt-in |
| Multi-scenario comparison (3-way) | Current vs. one scenario only |
| Historical snapshots / timeline | Multiple xlsx merged — exploratory |
| Sankey diagram | Visual complexity not aligned |
| Advice / robo-advisor features | Hard line — never |
| Native mobile / PWA | Web-only; mobile-tolerant via responsive |
| US stocks, international equities | IDX only |
| Crypto live prices | Manual entry sufficient |
| Tax estimation | Different category |
| Real-time intraday tick data | 15-min Yahoo delay sufficient |
| Per-emiten accumulation ladders (10/30/50/70/80/100% milestones) | Defer |
| Shareable read-only links | Exploratory |

---

## 6. Strategic / open questions

1. **Brand name** — *Cermat* is working. Alternates: *Hitungin*, *Tepat*, *Bobot*, *Sehat Finansial*. Decision needed before design.
2. **IDX live price source** — Yahoo Finance via `BBCA.JK` (recommended), Goapi.id (paid), or Stockbit unofficial (risky)?
3. ~~**FI formula multiplier** — Lock to 300 (4% safe withdrawal), or expose multiplier slider for user (240/300/360)?~~ **Closed 2026-05-31 (D0.2):** locked to `300`. No slider for MVP.
4. **Modal Siap Distribusi formula** — Cash + Deposito + RD + Crypto liquid? Or also subtract emergency-fund buffer (6× expenses)?
5. **Capacity simulator scope** — Ship all 3 (Max Utang + Lunasi + Modal Options), or only top 2?
6. **Disclaimer copy** — Must be ironclad. Anchor: *"Cermat adalah kalkulator dan alat bantu visualisasi. Bukan saran investasi atau perencanaan keuangan profesional."*
7. **Goal types** — 4 templates (DP Rumah / Dana Pendidikan / FI / Custom). Confirm.
8. **Per-emiten depth** — Lots + target + bobot + dual dividend (no ladders) for initial scope. Confirm.
9. **Snapshot-first or simulator-first?** — Recommend snapshot-first with "Coba dengan data contoh" escape.
10. **Goal bucket UX** — Tag-based (recommend), or fixed asset-category mapping?
11. **Mobile investment** — Strict desktop-first, or invest because most Indonesians are on phones?

---

## 7. What this is NOT

- ❌ **Not a robo-advisor** — no buy/sell recommendations, no portfolio rebalancing suggestions
- ❌ **Not a bank-linked aggregator** — no Open Finance, no auto-import; manual input only
- ❌ **Not a screener / trader tool** — no buy signals, no technical analysis
- ❌ **Not a budgeting app** — no transaction categorization
- ❌ **Not a community / social product** — no leaderboards, no sharing, no profiles
- ❌ **Not a bank loan calculator** — bank tools are optimized for the institution; Cermat is optimized for the user

---

## 8. The bet

**Indonesian adults track their finances, set life goals, and make 1–3 big financial decisions per year** — KPR, kendaraan, gadai, FI plan, dana pendidikan, mulai investasi rutin. Today's toolkit is fragmented: Stockbit for stocks, Bibit for RD, custom xlsx for accumulation tracking, no one for scenario simulation, no one for capacity reasoning, no one for goal-aware decision support.

**Cermat is a unified privacy-first artifact** for that workflow. Track → Plan (Goals) → Decide (Decision Simulators) → Discover (Capacity Simulators). No signup, no leak, no advice — just better tooling.

It also happens to be:
- Shippable in ~11 days solo with AI assistance
- Demo-able in 60 seconds (slider flip + goal shift OR capacity panel reveal)
- Differentiated against every competitor in the Indonesian market
- Clear of the OJK regulation grey zone *if* the descriptive-only line is held

That's the package.

---

**Next:** Read `personal-wealth-platform-prd-en.md` for full functional spec, then proceed to design guidelines.
