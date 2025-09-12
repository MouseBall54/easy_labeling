/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
/* unused harmony export TestClass */
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
class TestClass {
    constructor(message) {
        this.data = {
            message,
            timestamp: new Date(),
        };
    }
    getMessage() {
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


/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwibWFwcGluZ3MiOiI7O1VBQUE7VUFDQTs7Ozs7V0NEQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLHlDQUF5Qyx3Q0FBd0M7V0FDakY7V0FDQTtXQUNBLEU7Ozs7O1dDUEEsd0Y7Ozs7OztBQ0FBOzs7OztHQUtHO0FBRUgsbUJBQW1CO0FBQ25CLE9BQU8sQ0FBQyxHQUFHLENBQUMsMkRBQTJELENBQUMsQ0FBQztBQUN6RSxPQUFPLENBQUMsR0FBRyxDQUFDLGtDQUFrQyxDQUFDLENBQUM7QUFDaEQsT0FBTyxDQUFDLEdBQUcsQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO0FBQzFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsdUJBQXVCLEVBQUUsSUFBSSxJQUFJLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO0FBUS9ELE1BQU0sU0FBUztJQUdiLFlBQVksT0FBZTtRQUN6QixJQUFJLENBQUMsSUFBSSxHQUFHO1lBQ1YsT0FBTztZQUNQLFNBQVMsRUFBRSxJQUFJLElBQUksRUFBRTtTQUN0QixDQUFDO0lBQ0osQ0FBQztJQUVNLFVBQVU7UUFDZixPQUFPLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsY0FBYyxFQUFFLEVBQUUsQ0FBQztJQUMzRSxDQUFDO0NBQ0Y7QUFFRCxpQkFBaUI7QUFDakIsTUFBTSxJQUFJLEdBQUcsSUFBSSxTQUFTLENBQUMsa0NBQWtDLENBQUMsQ0FBQztBQUMvRCxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQztBQUUzQyxpQkFBaUI7QUFDakIsUUFBUSxDQUFDLGdCQUFnQixDQUFDLGtCQUFrQixFQUFFLEdBQUcsRUFBRTtJQUNqRCxPQUFPLENBQUMsR0FBRyxDQUFDLGtEQUFrRCxDQUFDLENBQUM7SUFFaEUsd0NBQXdDO0lBQ3hDLE1BQU0sU0FBUyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDaEQsU0FBUyxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUc7Ozs7Ozs7Ozs7OztHQVl6QixDQUFDO0lBQ0YsU0FBUyxDQUFDLFdBQVcsR0FBRywyQkFBMkIsQ0FBQztJQUNwRCxRQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUVyQyw4QkFBOEI7SUFDOUIsVUFBVSxDQUFDLEdBQUcsRUFBRTtRQUNkLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztJQUNyQixDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDWCxDQUFDLENBQUMsQ0FBQztBQUVILHdCQUF3QjtBQUNZIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZWFzeV9sYWJlbGluZy93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9lYXN5X2xhYmVsaW5nL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9lYXN5X2xhYmVsaW5nL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vZWFzeV9sYWJlbGluZy8uL3NyYy9tYWluLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIFRoZSByZXF1aXJlIHNjb3BlXG52YXIgX193ZWJwYWNrX3JlcXVpcmVfXyA9IHt9O1xuXG4iLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLyoqXHJcbiAqIEVhc3kgTGFiZWxpbmcgVHlwZVNjcmlwdCBNYWluIEVudHJ5IFBvaW50XHJcbiAqIFxyXG4gKiBUaGlzIGlzIHRoZSBtYWluIGVudHJ5IHBvaW50IGZvciB0aGUgVHlwZVNjcmlwdCB2ZXJzaW9uIG9mIEVhc3kgTGFiZWxpbmcuXHJcbiAqIEN1cnJlbnRseSBhIEhlbGxvIFdvcmxkIHRlc3QgdG8gdmVyaWZ5IHRoZSBidWlsZCBlbnZpcm9ubWVudC5cclxuICovXHJcblxyXG4vLyBIZWxsbyBXb3JsZCB0ZXN0XHJcbmNvbnNvbGUubG9nKCfwn5qAIEVhc3kgTGFiZWxpbmcgVHlwZVNjcmlwdCBNaWdyYXRpb24gLSBQaGFzZSAxIENvbXBsZXRlIScpO1xyXG5jb25zb2xlLmxvZygn4pyFIFR5cGVTY3JpcHQgY29tcGlsYXRpb24gd29ya2luZycpO1xyXG5jb25zb2xlLmxvZygn4pyFIFdlYnBhY2sgYnVuZGxpbmcgd29ya2luZycpO1xyXG5jb25zb2xlLmxvZygn8J+ThSBQaGFzZSAxIGNvbXBsZXRlZDonLCBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCkpO1xyXG5cclxuLy8gVGVzdCBiYXNpYyBUeXBlU2NyaXB0IGZlYXR1cmVzXHJcbmludGVyZmFjZSBUZXN0SW50ZXJmYWNlIHtcclxuICBtZXNzYWdlOiBzdHJpbmc7XHJcbiAgdGltZXN0YW1wOiBEYXRlO1xyXG59XHJcblxyXG5jbGFzcyBUZXN0Q2xhc3Mge1xyXG4gIHByaXZhdGUgZGF0YTogVGVzdEludGVyZmFjZTtcclxuXHJcbiAgY29uc3RydWN0b3IobWVzc2FnZTogc3RyaW5nKSB7XHJcbiAgICB0aGlzLmRhdGEgPSB7XHJcbiAgICAgIG1lc3NhZ2UsXHJcbiAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKSxcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0TWVzc2FnZSgpOiBzdHJpbmcge1xyXG4gICAgcmV0dXJuIGAke3RoaXMuZGF0YS5tZXNzYWdlfSBhdCAke3RoaXMuZGF0YS50aW1lc3RhbXAudG9Mb2NhbGVTdHJpbmcoKX1gO1xyXG4gIH1cclxufVxyXG5cclxuLy8gVGVzdCB0aGUgY2xhc3NcclxuY29uc3QgdGVzdCA9IG5ldyBUZXN0Q2xhc3MoJ1R5cGVTY3JpcHQgZW52aXJvbm1lbnQgaXMgcmVhZHkhJyk7XHJcbmNvbnNvbGUubG9nKCfwn46vIFRlc3Q6JywgdGVzdC5nZXRNZXNzYWdlKCkpO1xyXG5cclxuLy8gRE9NIHJlYWR5IHRlc3RcclxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsICgpID0+IHtcclxuICBjb25zb2xlLmxvZygn8J+TsSBET00gbG9hZGVkIC0gcmVhZHkgZm9yIFBoYXNlIDIgaW1wbGVtZW50YXRpb24nKTtcclxuICBcclxuICAvLyBDcmVhdGUgYSBzaW1wbGUgaW5kaWNhdG9yIG9uIHRoZSBwYWdlXHJcbiAgY29uc3QgaW5kaWNhdG9yID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgaW5kaWNhdG9yLnN0eWxlLmNzc1RleHQgPSBgXHJcbiAgICBwb3NpdGlvbjogZml4ZWQ7XHJcbiAgICB0b3A6IDEwcHg7XHJcbiAgICByaWdodDogMTBweDtcclxuICAgIGJhY2tncm91bmQ6ICMyOGE3NDU7XHJcbiAgICBjb2xvcjogd2hpdGU7XHJcbiAgICBwYWRkaW5nOiAxMHB4IDE1cHg7XHJcbiAgICBib3JkZXItcmFkaXVzOiA1cHg7XHJcbiAgICBmb250LWZhbWlseTogbW9ub3NwYWNlO1xyXG4gICAgZm9udC1zaXplOiAxMnB4O1xyXG4gICAgei1pbmRleDogOTk5OTtcclxuICAgIGJveC1zaGFkb3c6IDAgMnB4IDVweCByZ2JhKDAsMCwwLDAuMik7XHJcbiAgYDtcclxuICBpbmRpY2F0b3IudGV4dENvbnRlbnQgPSAn4pyFIFR5cGVTY3JpcHQgQnVpbGQgQWN0aXZlJztcclxuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGluZGljYXRvcik7XHJcbiAgXHJcbiAgLy8gQXV0by1yZW1vdmUgYWZ0ZXIgNSBzZWNvbmRzXHJcbiAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICBpbmRpY2F0b3IucmVtb3ZlKCk7XHJcbiAgfSwgNTAwMCk7XHJcbn0pO1xyXG5cclxuLy8gRXhwb3J0IGZvciBmdXR1cmUgdXNlXHJcbmV4cG9ydCB7IFRlc3RDbGFzcywgVGVzdEludGVyZmFjZSB9OyJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==