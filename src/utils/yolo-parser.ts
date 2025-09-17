/**
 * YOLO Format Parser Utility
 * 
 * Handles parsing and generation of YOLO format annotation files.
 * YOLO format: classId centerX centerY width height (normalized coordinates 0-1)
 */

import { YoloLabel, YoloParseResult, YoloExportOptions, YoloFormatError } from '../types/filesystem';

// ===================================================================
// Constants
// ===================================================================

const DEFAULT_PRECISION = 6;
const MIN_COORDINATE = 0.0;
const MAX_COORDINATE = 1.0;
const MIN_SIZE = 0.0;

// ===================================================================
// YOLO Parser Class
// ===================================================================

export class YoloParser {
  private static readonly COORDINATE_PATTERN = /^-?\d+(\.\d+)?$/;
  private static readonly LINE_PATTERN = /^\s*(\d+)\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s*$/;

  /**
   * Parse YOLO format string into structured labels
   */
  public static parseYoloString(yoloData: string): YoloParseResult {
    const result: YoloParseResult = {
      labels: [],
      errors: [],
      warnings: []
    };

    if (!yoloData || yoloData.trim() === '') {
      return result;
    }

    const lines = yoloData.split('\n');
    
    lines.forEach((line, lineIndex) => {
      const trimmedLine = line.trim();
      
      // Skip empty lines and comments
      if (trimmedLine === '' || trimmedLine.startsWith('#')) {
        return;
      }

      try {
        const label = this.parseSingleLine(trimmedLine, lineIndex + 1);
        if (label) {
          result.labels.push(label);
        }
      } catch (error) {
        if (error instanceof YoloFormatError) {
          result.errors.push(`Line ${lineIndex + 1}: ${error.message}`);
        } else {
          result.errors.push(`Line ${lineIndex + 1}: Unknown parsing error`);
        }
      }
    });

    // Add validation warnings
    this.addValidationWarnings(result);

    return result;
  }

  /**
   * Parse a single YOLO format line
   */
  private static parseSingleLine(line: string, lineNumber: number): YoloLabel | null {
    const match = line.match(this.LINE_PATTERN);
    
    if (!match) {
      throw new YoloFormatError(
        `Invalid YOLO format. Expected: "classId centerX centerY width height"`,
        lineNumber,
        line
      );
    }

    const [, classIdStr, centerXStr, centerYStr, widthStr, heightStr] = match;

    // Parse class ID
    const classId = parseInt(classIdStr!, 10);
    if (isNaN(classId) || classId < 0) {
      throw new YoloFormatError(
        `Invalid class ID: "${classIdStr}". Must be a non-negative integer`,
        lineNumber,
        line
      );
    }

    // Parse coordinates
    const centerX = this.parseCoordinate(centerXStr!, 'centerX', lineNumber, line);
    const centerY = this.parseCoordinate(centerYStr!, 'centerY', lineNumber, line);
    const width = this.parseCoordinate(widthStr!, 'width', lineNumber, line);
    const height = this.parseCoordinate(heightStr!, 'height', lineNumber, line);

    // Validate coordinate ranges
    this.validateCoordinates({ classId, centerX, centerY, width, height }, lineNumber, line);

    return {
      classId,
      centerX,
      centerY,
      width,
      height
    };
  }

  /**
   * Parse a coordinate value with validation
   */
  private static parseCoordinate(value: string, name: string, lineNumber: number, line: string): number {
    if (!this.COORDINATE_PATTERN.test(value)) {
      throw new YoloFormatError(
        `Invalid ${name}: "${value}". Must be a valid number`,
        lineNumber,
        line
      );
    }

    const parsed = parseFloat(value);
    if (isNaN(parsed)) {
      throw new YoloFormatError(
        `Invalid ${name}: "${value}". Could not parse as number`,
        lineNumber,
        line
      );
    }

    return parsed;
  }

  /**
   * Validate YOLO label coordinates
   */
  private static validateCoordinates(label: YoloLabel, lineNumber: number, line: string): void {
    const { centerX, centerY, width, height } = label;

    // Check coordinate bounds (YOLO uses normalized coordinates 0-1)
    if (centerX < MIN_COORDINATE || centerX > MAX_COORDINATE) {
      throw new YoloFormatError(
        `centerX out of range: ${centerX}. Must be between 0 and 1`,
        lineNumber,
        line
      );
    }

    if (centerY < MIN_COORDINATE || centerY > MAX_COORDINATE) {
      throw new YoloFormatError(
        `centerY out of range: ${centerY}. Must be between 0 and 1`,
        lineNumber,
        line
      );
    }

    if (width <= MIN_SIZE || width > MAX_COORDINATE) {
      throw new YoloFormatError(
        `width out of range: ${width}. Must be between 0 and 1`,
        lineNumber,
        line
      );
    }

    if (height <= MIN_SIZE || height > MAX_COORDINATE) {
      throw new YoloFormatError(
        `height out of range: ${height}. Must be between 0 and 1`,
        lineNumber,
        line
      );
    }

    // Check bounding box bounds
    const left = centerX - width / 2;
    const right = centerX + width / 2;
    const top = centerY - height / 2;
    const bottom = centerY + height / 2;

    if (left < MIN_COORDINATE || right > MAX_COORDINATE) {
      throw new YoloFormatError(
        `Bounding box extends outside image bounds horizontally (left: ${left}, right: ${right})`,
        lineNumber,
        line
      );
    }

    if (top < MIN_COORDINATE || bottom > MAX_COORDINATE) {
      throw new YoloFormatError(
        `Bounding box extends outside image bounds vertically (top: ${top}, bottom: ${bottom})`,
        lineNumber,
        line
      );
    }
  }

  /**
   * Add validation warnings to parse result
   */
  private static addValidationWarnings(result: YoloParseResult): void {
    // Check for very small bounding boxes
    result.labels.forEach((label, index) => {
      if (label.width < 0.01 || label.height < 0.01) {
        result.warnings.push(`Label ${index + 1}: Very small bounding box (${label.width}x${label.height})`);
      }
    });

    // Check for duplicate labels (same position and class)
    const seen = new Set<string>();
    result.labels.forEach((label, index) => {
      const key = `${label.classId}_${label.centerX}_${label.centerY}_${label.width}_${label.height}`;
      if (seen.has(key)) {
        result.warnings.push(`Label ${index + 1}: Duplicate label detected`);
      }
      seen.add(key);
    });
  }

  /**
   * Convert labels array to YOLO format string
   */
  public static labelsToYoloString(labels: YoloLabel[], options: YoloExportOptions = {}): string {
    const {
      precision = DEFAULT_PRECISION,
      includeComments = false,
      validateBounds = true
    } = options;

    if (!labels || labels.length === 0) {
      return '';
    }

    const lines: string[] = [];

    if (includeComments) {
      lines.push('# YOLO format: classId centerX centerY width height (normalized coordinates)');
      lines.push(`# Generated: ${new Date().toISOString()}`);
      lines.push('');
    }

    labels.forEach((label, index) => {
      if (validateBounds && !this.validateYoloLabel(label)) {
        throw new YoloFormatError(`Invalid label at index ${index}: coordinates out of bounds`);
      }

      const line = [
        label.classId.toString(),
        label.centerX.toFixed(precision),
        label.centerY.toFixed(precision),
        label.width.toFixed(precision),
        label.height.toFixed(precision)
      ].join(' ');

      lines.push(line);
    });

    return lines.join('\n');
  }

  /**
   * Validate a single YOLO label
   */
  public static validateYoloLabel(label: YoloLabel): boolean {
    try {
      this.validateCoordinates(label, 0, '');
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Convert pixel coordinates to YOLO normalized coordinates
   */
  public static pixelToNormalized(
    pixelX: number,
    pixelY: number,
    pixelWidth: number,
    pixelHeight: number,
    imageWidth: number,
    imageHeight: number
  ): YoloLabel {
    const centerX = (pixelX + pixelWidth / 2) / imageWidth;
    const centerY = (pixelY + pixelHeight / 2) / imageHeight;
    const width = pixelWidth / imageWidth;
    const height = pixelHeight / imageHeight;

    return {
      classId: 0, // Will be set by caller
      centerX,
      centerY,
      width,
      height
    };
  }

  /**
   * Convert YOLO normalized coordinates to pixel coordinates
   */
  public static normalizedToPixel(
    label: YoloLabel,
    imageWidth: number,
    imageHeight: number
  ): { x: number; y: number; width: number; height: number } {
    const width = label.width * imageWidth;
    const height = label.height * imageHeight;
    const x = (label.centerX * imageWidth) - (width / 2);
    const y = (label.centerY * imageHeight) - (height / 2);

    return { x, y, width, height };
  }

  /**
   * Get statistics about a set of labels
   */
  public static getLabelStatistics(labels: YoloLabel[]): {
    totalLabels: number;
    classDistribution: Record<number, number>;
    averageSize: { width: number; height: number };
    sizeRange: {
      min: { width: number; height: number };
      max: { width: number; height: number };
    };
  } {
    if (!labels || labels.length === 0) {
      return {
        totalLabels: 0,
        classDistribution: {},
        averageSize: { width: 0, height: 0 },
        sizeRange: {
          min: { width: 0, height: 0 },
          max: { width: 0, height: 0 }
        }
      };
    }

    const classDistribution: Record<number, number> = {};
    let totalWidth = 0;
    let totalHeight = 0;
    let minWidth = Number.MAX_VALUE;
    let maxWidth = Number.MIN_VALUE;
    let minHeight = Number.MAX_VALUE;
    let maxHeight = Number.MIN_VALUE;

    labels.forEach(label => {
      // Class distribution
      classDistribution[label.classId] = (classDistribution[label.classId] || 0) + 1;

      // Size statistics
      totalWidth += label.width;
      totalHeight += label.height;
      minWidth = Math.min(minWidth, label.width);
      maxWidth = Math.max(maxWidth, label.width);
      minHeight = Math.min(minHeight, label.height);
      maxHeight = Math.max(maxHeight, label.height);
    });

    return {
      totalLabels: labels.length,
      classDistribution,
      averageSize: {
        width: totalWidth / labels.length,
        height: totalHeight / labels.length
      },
      sizeRange: {
        min: { width: minWidth, height: minHeight },
        max: { width: maxWidth, height: maxHeight }
      }
    };
  }
}

// ===================================================================
// Utility Functions
// ===================================================================

/**
 * Quick parse function for simple use cases
 */
export function parseYolo(yoloData: string): YoloLabel[] {
  const result = YoloParser.parseYoloString(yoloData);
  if (result.errors.length > 0) {
    throw new YoloFormatError(`YOLO parsing failed: ${result.errors.join(', ')}`);
  }
  return result.labels;
}

/**
 * Quick export function for simple use cases
 */
export function exportYolo(labels: YoloLabel[], precision: number = DEFAULT_PRECISION): string {
  return YoloParser.labelsToYoloString(labels, { precision });
}

/**
 * Validate YOLO string without parsing
 */
export function validateYoloString(yoloData: string): { isValid: boolean; errors: string[] } {
  const result = YoloParser.parseYoloString(yoloData);
  return {
    isValid: result.errors.length === 0,
    errors: result.errors
  };
}

// ===================================================================
// Export
// ===================================================================

export default YoloParser;