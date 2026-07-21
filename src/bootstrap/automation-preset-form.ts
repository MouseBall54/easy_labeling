import {
  DEFAULT_MULTIPLE_DETECTION_SETTINGS,
  validatePreprocessingSettings
} from "../features/automation/preset-codec.js";
import { parseNonNegativeClassId } from "../domain/class-id.js";
import type {
  AutomationOutputMode,
  AutomationPreset,
  MultipleDetectionSettings,
  PixelRect,
  TemplateAsset,
  TemplateMatchingSettings,
  TemplatePreprocessingSettings
} from "../features/automation/types.js";
import type { UiDomElements } from "../ui/dom-elements.js";

function readFinite(input: HTMLInputElement, field: string): number {
  const value = Number(input.value);
  if (!Number.isFinite(value)) {
    throw new Error(`${field} must be a finite number`);
  }
  return value;
}

export interface AutomationPresetForm {
  readPreprocessing(): TemplatePreprocessingSettings;
  readMatching(): TemplateMatchingSettings;
  readOutputMode(): AutomationOutputMode;
  readMultipleDetection(): MultipleDetectionSettings;
  syncOutputMode(): void;
  reset(defaultLayoutId: string): void;
  load(preset: AutomationPreset, template: TemplateAsset): void;
  clearResult(): void;
}

export function createAutomationPresetForm(elements: UiDomElements): AutomationPresetForm {
  const readSearchRoi = (): PixelRect | null => {
    if (!elements.templateSearchRoiToggle.checked) {
      return null;
    }
    return {
      x: readFinite(elements.templateSearchXInput, "Search X"),
      y: readFinite(elements.templateSearchYInput, "Search Y"),
      width: readFinite(elements.templateSearchWidthInput, "Search width"),
      height: readFinite(elements.templateSearchHeightInput, "Search height")
    };
  };

  const form: AutomationPresetForm = {
    readPreprocessing(): TemplatePreprocessingSettings {
      const settings: TemplatePreprocessingSettings = {
        grayscale: elements.templateGrayscaleToggle.checked,
        gaussianBlurEnabled: elements.templateBlurToggle.checked,
        blurKernelSize: readFinite(elements.templateBlurKernelInput, "Blur kernel"),
        blurSigma: readFinite(elements.templateBlurSigmaInput, "Blur sigma"),
        gaussianNoiseEnabled: elements.templateNoiseToggle.checked,
        gaussianNoiseSigma: readFinite(elements.templateNoiseSigmaInput, "Noise sigma"),
        gaussianNoiseSeed: readFinite(elements.templateNoiseSeedInput, "Noise seed")
      };
      validatePreprocessingSettings(settings);
      return settings;
    },

    readMatching(): TemplateMatchingSettings {
      const minimumScore = readFinite(elements.templateMinimumScoreInput, "Minimum score");
      if (minimumScore < -1 || minimumScore > 1) {
        throw new Error("Minimum score must be between -1 and 1");
      }
      return {
        minimumScore,
        searchRoi: readSearchRoi(),
        mode: elements.templateMatchingFastRadio.checked ? "fast" : "accurate"
      };
    },

    readOutputMode(): AutomationOutputMode {
      return elements.templateOutputMultipleRadio.checked ? "multiple-detection-boxes" : "layout-best-match";
    },

    readMultipleDetection(): MultipleDetectionSettings {
      const settings: MultipleDetectionSettings = {
        classId: parseNonNegativeClassId(elements.templateMultipleClassIdInput.value),
        maximumDetections: readFinite(elements.templateMaximumDetectionsInput, "Maximum detections"),
        strictNonOverlap: elements.templateStrictNonOverlapToggle.checked,
        nmsIouThreshold: readFinite(elements.templateNmsIouInput, "NMS IoU threshold"),
        paddingX: readFinite(elements.templatePaddingXInput, "Padding X"),
        paddingY: readFinite(elements.templatePaddingYInput, "Padding Y")
      };
      elements.templateMultipleClassIdInput.value = settings.classId;
      if (!Number.isInteger(settings.maximumDetections) || settings.maximumDetections < 1 || settings.maximumDetections > 10000) {
        throw new Error("Maximum detections must be an integer between 1 and 10000");
      }
      if (settings.nmsIouThreshold < 0 || settings.nmsIouThreshold > 1) {
        throw new Error("NMS IoU threshold must be between 0 and 1");
      }
      if (settings.paddingX < 0 || settings.paddingY < 0) {
        throw new Error("Detection padding must be zero or greater");
      }
      return settings;
    },

    syncOutputMode(): void {
      const multiple = form.readOutputMode() === "multiple-detection-boxes";
      elements.templateLayoutOutputSettings.hidden = multiple;
      elements.templateMultipleOutputSettings.hidden = !multiple;
      elements.templateMatchSelectionControls.hidden = !multiple || !elements.templateApplySelectedMatchesRadio.checked;
    },

    reset(defaultLayoutId: string): void {
      elements.templateNameInput.value = "";
      elements.templateLayoutSelect.value = defaultLayoutId;
      elements.templateOutputLayoutRadio.checked = true;
      elements.templateOutputMultipleRadio.checked = false;
      elements.templateApplyAllMatchesRadio.checked = true;
      elements.templateApplySelectedMatchesRadio.checked = false;
      elements.templateMatchingAccurateRadio.checked = true;
      elements.templateMatchingFastRadio.checked = false;
      elements.templateGrayscaleToggle.checked = true;
      elements.templateBlurToggle.checked = true;
      elements.templateBlurKernelInput.value = "13";
      elements.templateBlurSigmaInput.value = "0";
      elements.templateNoiseToggle.checked = false;
      elements.templateNoiseSigmaInput.value = "0";
      elements.templateNoiseSeedInput.value = "1";
      elements.templateMinimumScoreInput.value = "0.80";
      elements.templateSearchRoiToggle.checked = false;
      elements.templateSearchRoiInputs.hidden = true;
      elements.templateRelationXInput.value = "0";
      elements.templateRelationYInput.value = "0";
      elements.templateManualXInput.value = "0";
      elements.templateManualYInput.value = "0";
      elements.templateMultipleClassIdInput.value = DEFAULT_MULTIPLE_DETECTION_SETTINGS.classId;
      elements.templateMaximumDetectionsInput.value = String(DEFAULT_MULTIPLE_DETECTION_SETTINGS.maximumDetections);
      elements.templateStrictNonOverlapToggle.checked = DEFAULT_MULTIPLE_DETECTION_SETTINGS.strictNonOverlap;
      elements.templateNmsIouInput.value = String(DEFAULT_MULTIPLE_DETECTION_SETTINGS.nmsIouThreshold);
      elements.templatePaddingXInput.value = String(DEFAULT_MULTIPLE_DETECTION_SETTINGS.paddingX);
      elements.templatePaddingYInput.value = String(DEFAULT_MULTIPLE_DETECTION_SETTINGS.paddingY);
      elements.templateExistingPolicySelect.value = "append";
      form.clearResult();
      form.syncOutputMode();
    },

    load(preset: AutomationPreset, template: TemplateAsset): void {
      elements.templateNameInput.value = preset.name;
      elements.templateLayoutSelect.value = preset.layoutId ?? "";
      elements.templateOutputLayoutRadio.checked = preset.outputMode === "layout-best-match";
      elements.templateOutputMultipleRadio.checked = preset.outputMode === "multiple-detection-boxes";
      elements.templateApplyAllMatchesRadio.checked = true;
      elements.templateApplySelectedMatchesRadio.checked = false;
      elements.templateMatchingAccurateRadio.checked = preset.matching.mode === "accurate";
      elements.templateMatchingFastRadio.checked = preset.matching.mode === "fast";
      elements.templateGrayscaleToggle.checked = template.preprocessing.grayscale;
      elements.templateBlurToggle.checked = template.preprocessing.gaussianBlurEnabled;
      elements.templateBlurKernelInput.value = String(template.preprocessing.blurKernelSize);
      elements.templateBlurSigmaInput.value = String(template.preprocessing.blurSigma);
      elements.templateNoiseToggle.checked = template.preprocessing.gaussianNoiseEnabled;
      elements.templateNoiseSigmaInput.value = String(template.preprocessing.gaussianNoiseSigma);
      elements.templateNoiseSeedInput.value = String(template.preprocessing.gaussianNoiseSeed);
      elements.templateMinimumScoreInput.value = String(preset.matching.minimumScore);
      elements.templateSearchRoiToggle.checked = Boolean(preset.matching.searchRoi);
      elements.templateSearchRoiInputs.hidden = !preset.matching.searchRoi;
      const searchRoi = preset.matching.searchRoi;
      elements.templateSearchXInput.value = String(searchRoi?.x ?? 0);
      elements.templateSearchYInput.value = String(searchRoi?.y ?? 0);
      elements.templateSearchWidthInput.value = String(searchRoi?.width ?? template.sourceImageSize.width);
      elements.templateSearchHeightInput.value = String(searchRoi?.height ?? template.sourceImageSize.height);
      elements.templateRelationXInput.value = String(preset.relationOffset.x);
      elements.templateRelationYInput.value = String(preset.relationOffset.y);
      elements.templateManualXInput.value = String(preset.manualOffset.x);
      elements.templateManualYInput.value = String(preset.manualOffset.y);
      elements.templateMultipleClassIdInput.value = preset.multipleDetection.classId;
      elements.templateMaximumDetectionsInput.value = String(preset.multipleDetection.maximumDetections);
      elements.templateStrictNonOverlapToggle.checked = preset.multipleDetection.strictNonOverlap;
      elements.templateNmsIouInput.value = String(preset.multipleDetection.nmsIouThreshold);
      elements.templatePaddingXInput.value = String(preset.multipleDetection.paddingX);
      elements.templatePaddingYInput.value = String(preset.multipleDetection.paddingY);
      elements.templateExistingPolicySelect.value = preset.existingLabelsPolicy;
      form.clearResult();
      form.syncOutputMode();
    },

    clearResult(): void {
      elements.templateMatchScore.textContent = "No preview yet";
      elements.templateMatchCoordinates.textContent = "";
      elements.templateMatchTimings.textContent = "";
      elements.templateMatchCandidates.replaceChildren();
    }
  };

  return form;
}
