import { expect } from '@playwright/test';
import { access, mkdir, copyFile, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { launchDesktop } from '../tests/e2e/fixtures/tauri-app.ts';
import { encodeSegmentationMaskPng, decodeSegmentationMaskPng } from '../dist/domain/annotations/segmentation-codec.js';

const out = path.resolve('output/yoloe-presets-validation');
// The profile libraries live at <sandbox>/profiles (EASY_LABELING_TEST_PROFILE_ROOT), standing in for Documents/Easy Labeling.
const dataset = path.join(out, 'workspace'), sandbox = path.join(out, 'app-profile'), profiles = path.join(sandbox, 'profiles');
const executablePath = path.resolve(process.argv[2] ?? 'target/release/Easy Labeling YOLOE-26.exe');
await mkdir(path.join(dataset, 'label'), { recursive: true }); await mkdir(path.join(dataset, 'mask'), { recursive: true });
await mkdir(path.join(profiles, 'Class Info'), { recursive: true });
const files = ['0-reference.png', '1-target-gray.png', '2-target-rgb.png'];
const originals = new Map();
for (const file of files) {
  await copyFile(path.join('tests/e2e/fixtures/yoloe-visual', file), path.join(dataset, file));
  const png = await readFile(path.join(dataset, file)), width = png.readUInt32BE(16), height = png.readUInt32BE(20);
  const mask = new Uint16Array(width * height);
  for (let y = 240; y < 740; y++) mask.fill(12, y * width + 20, y * width + 785);
  for (let y = 400; y < 900; y++) mask.fill(5, y * width + 50, y * width + 245);
  for (let y = 650; y < 660; y++) mask.fill(0, y * width + 100, y * width + 110);
  const bytes = await encodeSegmentationMaskPng({ width, height, mask });
  const text = '5 0.18209877 0.60185185 0.24074074 0.46296296\n12 0.49629630 0.45370370 0.94320988 0.46296296\n';
  await writeFile(path.join(dataset, 'mask', file), bytes); await writeFile(path.join(dataset, 'label', file.replace('.png', '.txt')), text);
  originals.set(file, { bytes, text });
}
const classes = 'names:\n  5: "person"\n  12: "bus"\n';
await writeFile(path.join(dataset, 'label', 'classes.yaml'), classes);
await writeFile(path.join(profiles, 'Class Info', 'classes.yaml'), classes);
const checks = [], network = [], errors = [];
// The GPU name the machine reports (YOLOE_EXPECT_GPU, e.g. 'Intel' on a machine without an NVIDIA card).
const gpuName = process.env.YOLOE_EXPECT_GPU ?? 'NVIDIA';
const external = (workflow) => path.join(out, `${workflow}-external.json`);
const exists = (file) => access(file).then(() => true, () => false);
const launch = async (workflow, cpu = false) => {
  // EASY_LABELING_TEST_PICK_FILE answers the library save/open dialogs with the external preset file.
  const app = await launchDesktop(executablePath, sandbox, [dataset], { browserArgs: cpu ? ['--disable-gpu'] : [],
    env: { PATH: path.join(process.env.SystemRoot, 'System32'), PYTHONHOME: 'C:\\no-python', PYTHONPATH: 'C:\\no-python',
      EASY_LABELING_TEST_PICK_FILE: external(workflow) } });
  const { page } = app; page.setDefaultTimeout(30000);
  page.on('pageerror', error => errors.push(error.message));
  // Requests leaving the app: its frontend (app.localhost) and IPC (ipc.localhost) stay local.
  await page.route(url => /^https?:/.test(url.href) && !url.hostname.endsWith('.localhost'), route => { network.push(route.request().url()); return route.abort(); });
  await expect(page.locator('#selectImageFolderBtn')).toBeEnabled();
  await page.locator('#selectImageFolderBtn').click();
  await expect(page.locator('#imageCountBadge')).toHaveText('3', { timeout: 30000 }).catch(async error => {
    await page.screenshot({ path: path.join(out, 'load-failure.png') });
    console.log((await page.locator('body').innerText()).slice(-1800));
    await app.close(); throw error;
  });
  if (workflow === 'segmentation') await page.locator('label[for="segmentationWorkflowTab"]').click();
  await page.locator('#taskYoloeBtn').click(); await page.locator('#openYoloeSetupBtn').click();
  await expect(page.locator('#yoloePresetSelect')).toBeEnabled();
  await expect(page.locator('#yoloeBackendBadge')).toHaveText(cpu ? 'CPU' : 'GPU · WebGPU');
  await expect(page.locator('#yoloeDeviceInfo')).toContainText(cpu ? 'GPU unavailable · Using CPU' : gpuName);
  return { app, page };
};
for (const workflow of ['detection', 'segmentation']) {
  const name = `acceptance_${workflow}`, defaultFile = path.join(profiles, 'YOLOE Presets', `${name}-${workflow}.yoloe.json`);
  await rm(external(workflow), { force: true });
  let { app, page } = await launch(workflow);
  try {
    await expect(page.locator('#yoloeExistingBoxSelect option')).toHaveCount(2);
    await page.locator('#yoloeExistingBoxSelect').selectOption(['0', '1']); await page.locator('#addYoloeExistingBtn').click();
    await page.locator('#yoloeReferenceSelect').selectOption(files[1]);
    await expect(page.locator('#yoloeReferenceSelect')).toBeEnabled();
    await page.locator('#yoloeExistingBoxSelect').selectOption('0'); await page.locator('#addYoloeExistingBtn').click();
    await expect(page.locator('#yoloeExampleList .yoloe-example-row')).toHaveCount(3);
    await page.locator('#yoloeProfileName').fill(name); await page.locator('#yoloeImageSize').selectOption('1024');
    await page.locator('#yoloeConfidenceInput').fill('0.2');
    await page.locator('#saveYoloePresetBtn').click(); await expect(page.locator('#yoloeSetupStatus')).toContainText('Saved');
    expect(await exists(external(workflow))).toBe(false);
    const saved = JSON.parse(await readFile(defaultFile, 'utf8'));
    expect(saved.references).toHaveLength(2); expect(saved.references.flatMap(r => r.examples)).toHaveLength(3);
    if (workflow === 'segmentation') {
      const e = saved.references[0].examples.find(e => e.classId === 5);
      expect(e.mask.runs).toContain(0); expect(e.polygon).toBeUndefined();
    }
    await page.locator('#saveYoloePresetAsBtn').click(); await expect(page.locator('#yoloePresetLocation')).toContainText(`${workflow}-external.json`);
    expect(await exists(external(workflow))).toBe(true);
    await page.locator('#yoloeConfidenceInput').fill('0.15'); await page.locator('#saveYoloePresetBtn').click();
    await expect(page.locator('#yoloeSetupStatus')).toContainText('Saved');
    expect(JSON.parse(await readFile(path.join(out, `${workflow}-external.json`), 'utf8')).settings.confidence).toBe(0.15);
    expect(JSON.parse(await readFile(defaultFile, 'utf8')).settings.confidence).toBe(0.2);
    await page.locator('#clearYoloeExamplesBtn').click(); await page.locator('#loadYoloePresetBtn').click();
    await expect(page.locator('#yoloeSetupStatus')).toContainText('Loaded'); await expect(page.locator('#yoloeExampleList .yoloe-example-row')).toHaveCount(3);
  } finally { await app.close(); }
  ({ app, page } = await launch(workflow));
  try {
    await expect(page.locator('#yoloeExampleList .yoloe-example-row')).toHaveCount(0);
    await page.locator('#yoloePresetSelect').selectOption(defaultFile);
    await expect(page.locator('#yoloeSetupStatus')).toContainText('Loaded'); await expect(page.locator('#yoloeExampleList .yoloe-example-row')).toHaveCount(3);
    await expect(page.locator('#yoloeImageSize')).toHaveValue('1024'); await expect(page.locator('#yoloeConfidenceInput')).toHaveValue('0.2');
    await page.screenshot({ path: path.join(out, `${workflow}-restored.png`) });
    await page.locator('#closeYoloeSetupBtn').click();
    await page.locator('#yoloeSaveScope').selectOption('all');
    await page.evaluate(() => {
      window.__yoloeProgress = [];
      new MutationObserver(() => window.__yoloeProgress.push(document.querySelector('#yoloeRunStatus').textContent))
        .observe(document.querySelector('#yoloeRunStatus'), { childList: true });
    });
    await page.locator('#saveYoloeCurrentBtn').click();
    await expect(page.locator('#yoloeRunStatus')).toContainText('3 image(s)', { timeout: 120000 });
    const progress = await page.evaluate(() => window.__yoloeProgress);
    for (const completed of [0, 1, 2, 3]) expect(progress.some(text => text.includes(`${completed}/3`))).toBe(true);
    const folderName = `inference-yoloe-26s-seg-${name}${workflow === 'segmentation' ? '-masks' : ''}`;
    const metadata = JSON.parse(await readFile(path.join(dataset, folderName, 'inference.json'), 'utf8'));
    expect(metadata.images).toEqual(files); expect(metadata.backend).toBe('webgpu'); expect(metadata.exampleCount).toBe(3);
    expect(metadata.gpu).toContain(gpuName); expect(metadata.detections).toBeGreaterThan(0);
    const results = [];
    for (const file of files) {
      if (workflow === 'detection') {
        const rows = (await readFile(path.join(dataset, folderName, file.replace('.png', '.txt')), 'utf8')).trim().split('\n');
        expect(rows.length).toBeGreaterThan(0); results.push({ file, boxes: rows.length });
      } else {
        const mask = await decodeSegmentationMaskPng(await readFile(path.join(dataset, folderName, 'mask', file)));
        const png = await readFile(path.join(dataset, file));
        expect(mask.width).toBe(png.readUInt32BE(16)); expect(mask.height).toBe(png.readUInt32BE(20));
        results.push({ file, foreground: mask.mask.filter(Boolean).length, classes: [...new Set(mask.mask)].filter(Boolean) });
      }
      expect(await readFile(path.join(dataset, 'label', file.replace('.png', '.txt')), 'utf8')).toBe(originals.get(file).text);
      expect(Buffer.compare(await readFile(path.join(dataset, 'mask', file)), originals.get(file).bytes)).toBe(0);
    }
    if (workflow === 'segmentation') expect(results.some(result => result.foreground > 0)).toBe(true);
    checks.push({ workflow, defaultFile, model: metadata.model, gpu: metadata.gpu, backend: metadata.backend, detections: metadata.detections, progress, results });
    await page.screenshot({ path: path.join(out, `${workflow}-all-results.png`) });
    console.log(JSON.stringify(checks.at(-1), null, 2));
  } finally { await app.close(); }
}
const { app: cpuApp, page: cpuPage } = await launch('segmentation', true);
let cpuPreview;
try {
  await expect(cpuPage.locator('#yoloeModelSelect')).toHaveValue('yoloe-26n-seg');
  await cpuPage.locator('#yoloePresetSelect').selectOption(path.join(profiles, 'YOLOE Presets', 'acceptance_segmentation-segmentation.yoloe.json'));
  await expect(cpuPage.locator('#yoloeSetupStatus')).toContainText('Loaded');
  await cpuPage.locator('#yoloeModelSelect').selectOption('yoloe-26n-seg');
  await cpuPage.locator('#previewYoloeSampleBtn').click();
  await expect(cpuPage.locator('#yoloeSetupStatus')).toContainText('mask instance(s)', { timeout: 120000 });
  await expect(cpuPage.locator('#yoloeBackendBadge')).toHaveText('CPU');
  cpuPreview = await cpuPage.locator('#yoloeSetupStatus').textContent();
} finally { await cpuApp.close(); }
expect(network).toEqual([]); expect(errors).toEqual([]);
await writeFile(path.join(out, 'results.json'), JSON.stringify({ executablePath, checks, cpuPreview, network, errors }, null, 2));
