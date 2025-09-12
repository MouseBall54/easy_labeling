/**
 * Easy Labeling TypeScript Main Entry Point
 * 
 * This is the main entry point for the TypeScript version of Easy Labeling.
 * Currently a Hello World test to verify the build environment.
 */

// Hello World test
console.log('🚀 Easy Labeling TypeScript Migration - Phase 1 Complete!');
console.log('✅ TypeScript compilation working');
console.log('✅ Webpack bundling working');
console.log('📅 Phase 1 completed:', new Date().toISOString());

// Test basic TypeScript features
interface TestInterface {
  message: string;
  timestamp: Date;
}

class TestClass {
  private data: TestInterface;

  constructor(message: string) {
    this.data = {
      message,
      timestamp: new Date(),
    };
  }

  public getMessage(): string {
    return `${this.data.message} at ${this.data.timestamp.toLocaleString()}`;
  }
}

// Test the class
const test = new TestClass('TypeScript environment is ready!');
console.log('🎯 Test:', test.getMessage());

// DOM ready test
document.addEventListener('DOMContentLoaded', () => {
  console.log('📱 DOM loaded - ready for Phase 2 implementation');
  
  // Create a simple indicator on the page
  const indicator = document.createElement('div');
  indicator.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    background: #28a745;
    color: white;
    padding: 10px 15px;
    border-radius: 5px;
    font-family: monospace;
    font-size: 12px;
    z-index: 9999;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  `;
  indicator.textContent = '✅ TypeScript Build Active';
  document.body.appendChild(indicator);
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    indicator.remove();
  }, 5000);
});

// Export for future use
export { TestClass, TestInterface };