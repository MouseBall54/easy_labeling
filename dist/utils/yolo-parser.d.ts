/**
 * YOLO Format Parser Utility
 *
 * Handles parsing and generation of YOLO format annotation files.
 * YOLO format: classId centerX centerY width height (normalized coordinates 0-1)
 */
import { YoloLabel, YoloParseResult, YoloExportOptions } from '../types/filesystem';
export declare class YoloParser {
    private static readonly COORDINATE_PATTERN;
    private static readonly LINE_PATTERN;
    /**
     * Parse YOLO format string into structured labels
     */
    static parseYoloString(yoloData: string): YoloParseResult;
    /**
     * Parse a single YOLO format line
     */
    private static parseSingleLine;
    /**
     * Parse a coordinate value with validation
     */
    private static parseCoordinate;
    /**
     * Validate YOLO label coordinates
     */
    private static validateCoordinates;
    /**
     * Add validation warnings to parse result
     */
    private static addValidationWarnings;
    /**
     * Convert labels array to YOLO format string
     */
    static labelsToYoloString(labels: YoloLabel[], options?: YoloExportOptions): string;
    /**
     * Validate a single YOLO label
     */
    static validateYoloLabel(label: YoloLabel): boolean;
    /**
     * Convert pixel coordinates to YOLO normalized coordinates
     */
    static pixelToNormalized(pixelX: number, pixelY: number, pixelWidth: number, pixelHeight: number, imageWidth: number, imageHeight: number): YoloLabel;
    /**
     * Convert YOLO normalized coordinates to pixel coordinates
     */
    static normalizedToPixel(label: YoloLabel, imageWidth: number, imageHeight: number): {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    /**
     * Get statistics about a set of labels
     */
    static getLabelStatistics(labels: YoloLabel[]): {
        totalLabels: number;
        classDistribution: Record<number, number>;
        averageSize: {
            width: number;
            height: number;
        };
        sizeRange: {
            min: {
                width: number;
                height: number;
            };
            max: {
                width: number;
                height: number;
            };
        };
    };
}
/**
 * Quick parse function for simple use cases
 */
export declare function parseYolo(yoloData: string): YoloLabel[];
/**
 * Quick export function for simple use cases
 */
export declare function exportYolo(labels: YoloLabel[], precision?: number): string;
/**
 * Validate YOLO string without parsing
 */
export declare function validateYoloString(yoloData: string): {
    isValid: boolean;
    errors: string[];
};
export default YoloParser;
//# sourceMappingURL=yolo-parser.d.ts.map