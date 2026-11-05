import type { HelpKit, HelpText } from "./refine-help-content.js";

/** English guide texts, by topic id (refine-help-content.ts orders and illustrates them). */
export function englishHelpTexts({ D, R, pct, link, tip, def, keys }: HelpKit): Record<string, HelpText> {
  return {
    "edge-quickstart": {
      title: "Tutorial: snap boxes to particle edges",
      caption: "Labels drawn by hand or by automation sit a few pixels off. Edge mode moves each side onto the brightness edge.",
      html: `<ol class="rh-steps">
<li><strong>Pick cases.</strong> Select a few typical boxes on the canvas (include a hard one), then open the Lab. <em>Cases</em> lists them; switch it to <em>All boxes</em> to see more.</li>
<li><strong>Check the image.</strong> Under <em>Image</em> choose Original, or Processed when the micrograph is noisy (${link("edge-image", "Image")}).</li>
<li><strong>Read the result.</strong> In the zoom view the dashed box is the label as saved and the blue box the result. Blue bands are where each side searched. Click a side tab (Top, Left, …) to see its brightness profile below.</li>
<li><strong>Tune.</strong> If a side lands on the wrong edge, change one thing at a time: ${link("edge-criterion", "Edge criterion")}, ${link("edge-range", "search range")}, ${link("edge-polarity", "polarity")}. Every case re-runs live; nothing is saved yet.</li>
<li><strong>Save.</strong> Type a preset name under Presets (choosing a preset with <em>Apply</em> fills it in), then <em>Save settings</em>: the values are kept for this dataset and saved into that preset. Without a name the Lab asks for one and stays open. <em>Save &amp; refine these boxes</em> also applies them to the cases.</li>
<li><strong>Apply.</strong> In the Refine pane: ${keys("E")} refines the selection, ${keys("Shift", "E")} every box; ${keys("N")} walks the boxes flagged for review. ${link("folder-run", "Whole folder")} runs a preset on every image.</li>
</ol>${tip(`Work on the Default first (no class chip pressed). Give a class its own values only when it really differs (${link("edge-classes", "classes")}).`)}`
    },
    "lab-layout": {
      title: "Reading the Refine Lab",
      html: `<dl class="rh-defs">
${def("① Cases", "The boxes the Lab tries settings on: <em>Selected boxes</em>, <em>Boxes of edited classes</em> or <em>All boxes</em>. A yellow frame marks a case flagged for review. Click a case to view it.")}
${def("② Zoom view", "Wheel zooms, drag pans, double-click (or <em>Fit</em>) shows the whole case. Dashed: the box as saved. Blue: the result. Blue bands: search ranges (<em>Range opacity</em> slider above). Gold ticks: each segment's edge; grey ones were dropped. Amber: what Surroundings read. Click a band to edit that side's rule.")}
${def("③ Profile", "Mean brightness across the chosen side (inside → outside) and its change over the gradient step. The pick of the criterion is marked; with candidates from a pair, they are ticked.")}
${def("④ Readout", "One sentence per decision: criterion, segments found and kept, combine rule, first pass and final shift, what limited the search (box, neighbour, image edge).")}
${def("⑤ Settings", "Mode, Presets, Classes, Image, then Edges / Edge rule / Surroundings / Advanced (Edge mode) or Rule (Reclass mode).")}
</dl>${tip("The footer counts the cases to review; aim to bring it down while the blue boxes still sit on the edges.")}`
    },
    "edge-criterion": {
      title: "Edge criterion: which point counts as the edge",
      caption: "Left: a clean step. Right: a bright rim (the SEM edge effect) where the band criteria fit better.",
      html: `<dl class="rh-defs">
${def("Max gradient", "The steepest brightness change, with the sign the polarity expects. Best for clean steps; the default.")}
${def("50% contrast level", "Where the profile crosses halfway between the inside and outside levels (from Surroundings). Robust on soft, blurred edges; always takes the nearest crossing.")}
${def("Bright band centre", "The middle of a bright band. For thin bright lines or rims you want to sit on.")}
${def("Bright band outer 50%", "The outer half-height of a bright band: the outside of a bright rim around a particle.")}
</dl>${tip(`Each side can use its own criterion (${link("edge-sides", "per-side rules")}). The ticks in the profile show where each segment found its edge.`)}`
    },
    "edge-polarity": {
      title: "Edge polarity: bright inside or dark inside",
      html: `<p>Polarity says how brightness changes crossing the edge from inside the box to outside. Max gradient only accepts changes in that direction, so a wrong polarity snaps to the opposite edge of a rim or to a neighbouring structure.</p>
<dl class="rh-defs">
${def("Auto (detect)", "Compares the box core with the background ring (Surroundings). Needs <em>Background ring</em> above 0.", "Auto")}
${def("Bright → dark", "Bright objects on a dark background: particles, lines.")}
${def("Dark → bright", "Dark objects in a bright matrix: pores, trenches, voids.")}
</dl>${tip("Force the polarity when the background is uneven or crowded and Auto flips between cases.")}`
    },
    "edge-range": {
      title: "Search inward and outward",
      html: `<dl class="rh-defs">
${def("Search inward (px)", "How far inside the current side the edge may be. Large values may run through the box centre.", D.rangeIn)}
${def("Search outward (px)", "How far outside. The search also stops at the image border and, with <em>Stop halfway to neighbours</em>, halfway to a facing box.", D.rangeOut)}
</dl>${tip("Set the range a little larger than the typical label error. Too large and the side can jump to the next particle; too small and the true edge sits on the band limit (confidence drops, the side is flagged).")}`
    },
    "edge-segments": {
      title: "Segments and combining them",
      caption: "Each segment finds its own edge (gold); weak ones are dropped (grey); the rest combine into one side.",
      html: `<dl class="rh-defs">
${def("Segments per side", "The side is cut into this many chunks along its length; each finds an edge on its averaged profile. Chunks under half the best confidence are dropped.", D.segments)}
${def("Combine segments", "<em>Outermost</em> takes the outer edge of the kept chunks (the box encloses a bumpy outline); <em>Median</em> ignores bumps and outliers.", "Outermost")}
${def("Corner inset (%)", "Share of the side skipped at each end so rounded corners do not pull the edge.", pct(D.inset))}
</dl>${tip("Rough or irregular outlines: more segments plus Outermost. Straight edges with debris: Median.")}`
    },
    "edge-smoothing": {
      title: "Smoothing σ and gradient step",
      html: `<dl class="rh-defs">
${def("Smoothing σ", "Gaussian smoothing of the profile before the search. Raise it on noisy images; it blurs very close edges together.", D.sigma)}
${def("Gradient step (px)", "Max gradient compares brightness this many pixels apart. Larger steps ignore fine noise and catch soft edges; 2 is the classic central difference.", D.gradStep)}
</dl>${tip(`On grainy SEM images try σ 2 and step 3–4 before changing anything else, or read a ${link("edge-image", "processed image")}.`)}`
    },
    "edge-near": {
      title: "Prefer near the current edge",
      html: `<p>On (default), candidates are weighted by a Gaussian around the current edge, so a nearby edge beats a stronger one far away. Off, the strongest edge anywhere in the search band wins. 50% contrast level always takes the nearest crossing.</p>
${tip("Keep it on when labels are roughly right. Turn it off when labels are far off but the true edge is clearly the strongest.")}`
    },
    "edge-sides": {
      title: "Per-side rules (Edges and Edge rule)",
      html: `<p><em>Edges</em> sets each side to Inherit (the shared rule), a criterion of its own, or Off (the side never moves). Click a side in the small box, or a band in the zoom view, to edit that side alone under <em>Edge rule</em>; <em>All sides</em> edits the shared rule.</p>
<dl class="rh-defs">
${def("Use for all sides", "Copies the shown side's rule to every side.")}
${def("Clear side rules", "Removes every side's own values: all sides follow the shared rule again.")}
</dl>${tip("Turn a side off where boxes are cut by the image border or a scale bar, or give it a wider range where labels are always short on one side.")}`
    },
    "edge-pair": {
      title: "Top + bottom (left + right) as a pair",
      caption: "A soft halo around a bright core gives each side two edges. A pair chooses both sides together.",
      html: `<p>Opposite sides are searched for up to five candidates each and judged as pairs by the net change in height (width): growing or shrinking. If none of the preferred kind exists the other kind is used. Only the first pass uses the preference; later iterations keep the nearest pair.</p>
<dl class="rh-defs">
${def("Prefer growing / shrinking", "Halo or core: which of two nested outlines the box should follow.", "Off")}
${def("Pick: Clearest edges / Nearest to the box", "Among pairs of the preferred kind: the one whose weaker side is strongest, or the one that moves least.", "Clearest")}
</dl>`
    },
    "edge-span": {
      title: "Scan span, extensions and scanned parts",
      html: `<dl class="rh-defs">
${def("Scan span", "Which rows/columns along the side are averaged: <em>Box only</em>, <em>Box + outside</em> (the box and its extensions) or <em>Outside only</em>.", "Box only")}
${def("Extend before / after (px)", "How far past the box ends the scan goes (above/below for left/right sides, left/right for top/bottom).", 0)}
${def("Into box from start / end (px)", "How far into the box each end's scan also reaches, next to its extension, for edge hints that sit near the box ends rather than in the middle. With <em>Outside only</em> the middle of the side is left out. Where an end meets the box run or the other end, the overlap is read once (<em>Strongest part</em> over <em>Box + outside</em> keeps each part whole).", 0)}
${def("Scanned parts", "<em>Together</em> averages every part into one profile; <em>Strongest part</em> searches the start end, the box and the end end on their own and keeps the clearest. The Lab draws one curve per part (orange: start end, green: box, purple: end end).", "Together")}
</dl>${tip("Long lines or trenches cut by the box: extend along the structure so the side sees a long, clean edge. The edge shows only near the corners: <em>Outside only</em> with a few px <em>Into box</em> at each end.")}`
    },
    "edge-surroundings": {
      title: "Surroundings: background ring, core, neighbours",
      html: `<dl class="rh-defs">
${def("Background ring (px)", "Width of a ring just past the widest outward search. Its median and the box core's median (inner 50%) give the outside and inside levels: Auto polarity and the 50% level use them. 0 turns them off.", D.contextRing)}
${def("Stop halfway to neighbours", "The outward search stops halfway to a facing box, so dense rows do not swallow each other.", D.avoidNeighbors ? "on" : "off")}
${def("Row/column tolerance (px)", "Boxes in one row (column) whose top/bottom (left/right) differ from their peers by more than this are flagged. 0 turns it off.", D.peerTolerance)}
</dl>${tip("If the ring reaches into neighbouring particles, inside and outside look alike and Auto polarity guesses wrong: narrow the ring or force the polarity.")}`
    },
    "edge-review": {
      title: "Review flags: confidence, weak sides, area change",
      html: `<p>A side's confidence is its contrast-to-noise ratio (lower when the edge sits on the search limit). Boxes with a weak side, an outlier in their row or column, or a large area change are queued for review: a pin on the canvas, carets outside weak sides, everything else dimmed.</p>
<dl class="rh-defs">
${def("Flag below confidence", "Sides weaker than this are flagged.", D.reviewBelow)}
${def("Flag area growth / shrink over (%)", "Boxes whose area changes more than this get a red frame. 0 turns it off.", `${pct(D.areaGrowLimit)} / ${pct(D.areaShrinkLimit)}`)}
</dl><p>On the canvas: ${keys("N")} / ${keys("Shift", "N")} next / previous flagged box, ${keys("F")} approves it, <em>Approve all</em> approves every flag left. <em>Show review marks</em> hides the marks.</p>`
    },
    "edge-advanced": {
      title: "Iterations and refine on draw",
      html: `<dl class="rh-defs">
${def("Iterations", "Passes per box; each searches again around the last result. Stops early once a pass changes nothing.", D.iterations)}
${def("Refine new boxes on draw", "Every box you draw is refined at once (a second undo step).", D.autoOnDraw ? "on" : "off")}
</dl>`
    },
    "edge-image": {
      title: "Image: Original or Processed",
      html: `<p>Refinement reads either the original pixels or a processed image. <em>Processing</em> picks a preprocessing preset (kept with the settings) or follows the Preprocess panel live. Edge and Reclass modes each have their own image.</p>
${tip("Median or anisotropic diffusion plus auto levels usually beats raising σ: edges stay sharp while grain goes.")}`
    },
    "edge-classes": {
      title: "Default, classes and presets",
      html: `<p>With no class chip pressed you edit the <em>Default</em>, which every class uses. Press a chip to give that class its own values on top of the Default (only changed values are stored); the reset button returns it to the Default.</p>
<p><em>Presets</em> store the values and the image: <em>Save</em> with a name, choose one to apply it, export or import preset files. The preset name field links the Lab to a preset: applying or saving a preset fills it in, and <em>Save settings</em> saves the values into the preset it names (a new name makes a new preset). On the desktop app presets are files in <em>Documents/Easy Labeling</em>, shared by every dataset.</p>
${tip(`In the Refine pane, <em>Run with</em> applies one preset to every class without changing class settings; the Lab then edits that preset. See ${link("folder-run", "whole-folder runs")}.`)}`
    },
    "reclass-quickstart": {
      title: "Tutorial: find boxes of the wrong class",
      caption: "Reclass judges each box by its pixels; boxes never move.",
      html: `<ol class="rh-steps">
<li><strong>Switch Mode to Reclass</strong> in the Lab. The class chips now choose which classes the rule checks (none = all).</li>
<li><strong>Change to:</strong> the class a matching box becomes.</li>
<li><strong>Place the centre crop</strong> with the four insets (${link("reclass-crop", "centre crop")}) so it covers where defects show.</li>
<li><strong>Turn on checks</strong> (${link("reclass-checks", "Mean, Bright pixels, Area shrinks")}) and combine them with OR or AND. Matching cases get a magenta pin; the footer counts them.</li>
<li><strong>Save &amp; reclass these boxes</strong> (or <em>Apply</em> in the pane): matching boxes change class at once (one undo step) and are queued for review. Walk them with ${keys("N")}, approve with ${keys("F")} or <em>Approve all</em>; undo or change a class by hand where the rule was wrong.</li>
</ol>`
    },
    "reclass-crop": {
      title: "Centre crop: four insets",
      html: `<p>The checks measure the box less four insets: <em>Centre inset top / bottom / left / right %</em> is the share of the box height (width) left out on that side, so each edge of the crop moves on its own. Opposite sides together leave at least 10% of the box.</p>
<p>Default: ${pct(R.insetTop)} on every side (the middle half). The Lab draws the crop dashed on each case.</p>
${tip("Leave out bright rims and labels' slack: a small inset on clean sides, a large one where the rim is thick. Defects that sit off-centre: move the crop toward them.")}`
    },
    "reclass-checks": {
      title: "Checks: mean, bright pixels, area shrink",
      html: `<dl class="rh-defs">
${def("Mean ≥", "Mean brightness (0–255) of the centre crop at or above which the box matches.", R.mean.min)}
${def("Bright pixels ≥ %", `Share of crop pixels at or above <em>Bright level</em> (default ${R.bright.level}). Catches mottled, partly bright centres the mean misses. The Lab paints those pixels pink.`, pct(R.bright.minRatio))}
${def("Area shrinks ≥ %", "Refines the box with the Edge settings (without moving it) and matches when the area is this much smaller than the box as loaded from the label file.", pct(R.shrink.minRatio))}
${def("Combine", "OR: any check that is on is enough. AND: every check must pass.", "OR")}
</dl>${tip("Too many matches: raise the threshold, shrink the crop away from rims, or switch to AND. Too few: lower thresholds one at a time and watch the pins in the cases.")}`
    },
    "reclass-run": {
      title: "Apply, review and reclass",
      html: `<p>In the Refine pane (Reclass mode), <em>Reclass with</em> picks the Lab rule or a reclass preset. <em>Apply</em> works like Edge mode's: each button judges its boxes with the rule now and changes the matches to the rule's class, as one undo step.</p>
<dl class="rh-defs">
${def("Selected / All boxes", "The selected boxes, or every visible box.")}
${def("Reclass class", "Every visible box of the class chosen beside it. Classes the rule does not check, or already turns boxes into, cannot be chosen.")}
${def("Keep boxes whose class was changed by hand", "On (default), All boxes and Reclass class leave boxes you relabelled by hand alone; Selected always judges.")}
${def("Review", `Changed boxes get a magenta pin (from → to). ${keys("N")} / ${keys("Shift", "N")} walks them, ${keys("F")} approves one, <em>Approve all</em> approves the rest. Undo takes a box out of the queue.`)}
${def("Reclass all images in folder", `Every image of the folder (${link("folder-run", "whole folder")}).`)}
</dl>`
    },
    "folder-run": {
      title: "Whole folder with a preset",
      html: `<ol class="rh-steps">
<li>Tune on a few images in the Lab and save a preset (Edge or Reclass).</li>
<li>In the pane choose it under <em>Run with</em> (Edge) or <em>Reclass with</em> (Reclass).</li>
<li>Press <em>Refine all images in folder</em> or <em>Reclass all images in folder</em> and confirm.</li>
</ol><p>Current edits are saved first; every label file that changes is backed up under <em>.easy-labeling/refine-all-…</em> or <em>reclass-all-…</em> in the label folder. Stopping writes nothing. Undo (${keys("Ctrl", "Z")}) does not reach other images: restore from the backup.</p>`
    },
    hints: {
      title: "Symptoms and what to try",
      html: `<dl class="rh-defs rh-hints">
${def("A side jumps to the next particle", `Lower <em>Search outward</em>, keep <em>Stop halfway to neighbours</em> and <em>Prefer near the current edge</em> on (${link("edge-range", "range")}, ${link("edge-near", "near")}).`)}
${def("Boxes shrink into the particle", `Check ${link("edge-polarity", "polarity")} (force it on uneven backgrounds), use <em>Outermost</em> (${link("edge-segments", "segments")}) or a pair that prefers growing (${link("edge-pair", "pair")}).`)}
${def("Edges jitter on grainy images", `Raise σ to 2, gradient step to 3–4, or read a ${link("edge-image", "processed image")}.`)}
${def("Soft, blurred edges land too far in", `Try <em>50% contrast level</em> (${link("edge-criterion", "criterion")}).`)}
${def("A bright rim: the box should enclose it", `<em>Bright band outer 50%</em> (${link("edge-criterion", "criterion")}).`)}
${def("One side is cut by the image border", `Turn that side off (${link("edge-sides", "per-side rules")}).`)}
${def("Long lines or trenches", `Scan span <em>Box + outside</em> with extensions (${link("edge-span", "scan span")}).`)}
${def("Many boxes flagged", `Look at the weak-side carets first; fix the range or criterion of that side. Lower <em>Flag below confidence</em> only for truly faint edges (${link("edge-review", "review")}).`)}
${def("Reclass flags normal boxes", `Move the crop off the rim (${link("reclass-crop", "insets")}), raise Mean, or combine with AND (${link("reclass-checks", "checks")}).`)}
${def("Reclass misses defects", "Lower one threshold at a time, turn on Bright pixels for mottled centres, move the crop toward where defects show.")}
</dl>`
    },
    shortcuts: {
      title: "Shortcuts",
      html: `<dl class="rh-defs">
${def(keys("R"), "Open or close the Refine pane.")}
${def(`${keys("E")} / ${keys("Shift", "E")}`, "Apply to the selected boxes / every box with the mode shown: refine in Edge mode, reclass in Reclass mode.")}
${def(`${keys("N")} / ${keys("Shift", "N")}`, "Next / previous box to review (flags in Edge mode, reclassed boxes in Reclass mode).")}
${def(keys("F"), "Approve the selected box to review (<em>Approve all</em> in the pane approves every one).")}
${def("Zoom view", "Wheel: zoom · drag: pan · double-click: fit.")}
</dl>`
    }
  };
}
