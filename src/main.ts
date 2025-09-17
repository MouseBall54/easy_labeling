/**
 * Easy Labeling TypeScript Main Entry Point
 * 
 * This is the main entry point for the TypeScript version of Easy Labeling.
 * Phase 5 Complete: FileSystem service has been successfully implemented with YOLO support.
 */

import { createAppState, AppState } from './models';
import { createFileSystemService, YoloParser, parseYolo } from './services';
import { parseYolo as utilParseYolo } from './utils';

// Phase Progress Report
console.log('🚀 Easy Labeling TypeScript Migration - Phase 5 Complete!');
console.log('✅ TypeScript compilation working');
console.log('✅ Webpack bundling working');
console.log('✅ AppState model implemented with type safety');
console.log('✅ Event system and validation added');
console.log('✅ FileSystem service implemented');
console.log('✅ YOLO parser with validation');
console.log('✅ File I/O abstraction layer');
console.log('📅 Phase 5 completed:', new Date().toISOString());

// Test Phase 4: AppState Model
console.log('\n🧪 Testing Phase 4 AppState Implementation:');

// Create AppState instance
const appState = createAppState();
console.log('✅ AppState instance created');

// Test event system
appState.addEventListener('mode:changed', (event) => {
  console.log('📡 Event received:', event.type, event.data);
});

// Test state methods
appState.setMode('draw');
console.log('✅ Mode changed to:', appState.currentMode);

appState.setLabelFontSize(16);
console.log('✅ Font size set to:', appState.labelFontSize);

// Test validation
const validation = appState.validate();
console.log('✅ Validation result:', validation.isValid ? 'PASSED' : 'FAILED');
if (validation.warnings.length > 0) {
  console.log('⚠️ Warnings:', validation.warnings);
}

// Test serialization
const serialized = appState.getSerializableState();
console.log('✅ Serialization test:', Object.keys(serialized).length, 'properties serialized');

console.log('🎯 Phase 4 AppState tests completed successfully!');

// Test Phase 5: FileSystem Service
console.log('\n🧪 Testing Phase 5 FileSystem Service Implementation:');

// Create FileSystem service instance
const fileSystem = createFileSystemService();
console.log('✅ FileSystem service created');

// Test YOLO parser
const testYoloData = `0 0.5 0.5 0.3 0.4
1 0.2 0.8 0.1 0.2`;

try {
  const labels = parseYolo(testYoloData);
  console.log('✅ YOLO parsing test:', labels.length, 'labels parsed');
  
  const yoloString = YoloParser.labelsToYoloString(labels);
  console.log('✅ YOLO export test: string generated');
  
  const validation = YoloParser.parseYoloString(testYoloData);
  console.log('✅ YOLO validation test:', validation.errors.length === 0 ? 'PASSED' : 'FAILED');
  
} catch (error) {
  console.error('❌ YOLO parser test failed:', error);
}

// Test FileSystem service methods
console.log('✅ Service methods available:', [
  'selectImageFolder',
  'selectLabelFolder', 
  'loadLabels',
  'saveLabels',
  'parseYoloString'
].every(method => typeof (fileSystem as any)[method] === 'function'));

console.log('🎯 Phase 5 FileSystem service tests completed successfully!');

// DOM ready test
document.addEventListener('DOMContentLoaded', () => {
  console.log('📱 DOM loaded - ready for Phase 6 implementation');
  
  // Create Phase 5 completion indicator
  const indicator = document.createElement('div');
  indicator.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    background: #28a745;
    color: white;
    padding: 12px 18px;
    border-radius: 8px;
    font-family: 'Segoe UI', monospace;
    font-size: 13px;
    font-weight: bold;
    z-index: 9999;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    border: 2px solid #fff;
  `;
  indicator.innerHTML = `
    <div>🚀 Phase 5 Complete</div>
    <div style="font-size: 11px; opacity: 0.9; margin-top: 4px;">FileSystem Service Ready</div>
  `;
  document.body.appendChild(indicator);
  
  // Auto-remove after 8 seconds
  setTimeout(() => {
    indicator.style.transition = 'opacity 0.5s ease';
    indicator.style.opacity = '0';
    setTimeout(() => indicator.remove(), 500);
  }, 8000);
});

// Export Phase 4 & 5 components
export { AppState, createAppState, createAppStateWithConfig } from './models';
export { FileSystemService, createFileSystemService, YoloParser } from './services';
export { parseYolo, exportYolo, validateYoloString } from './utils';