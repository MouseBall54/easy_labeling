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
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
/*!*********************!*\
  !*** ./src/main.ts ***!
  \*********************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   TestClass: () => (/* binding */ TestClass)
/* harmony export */ });
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwibWFwcGluZ3MiOiI7O1VBQUE7VUFDQTs7Ozs7V0NEQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLHlDQUF5Qyx3Q0FBd0M7V0FDakY7V0FDQTtXQUNBLEU7Ozs7O1dDUEEsd0Y7Ozs7O1dDQUE7V0FDQTtXQUNBO1dBQ0EsdURBQXVELGlCQUFpQjtXQUN4RTtXQUNBLGdEQUFnRCxhQUFhO1dBQzdELEU7Ozs7Ozs7Ozs7OztBQ05BOzs7OztHQUtHO0FBRUgsbUJBQW1CO0FBQ25CLE9BQU8sQ0FBQyxHQUFHLENBQUMsMkRBQTJELENBQUMsQ0FBQztBQUN6RSxPQUFPLENBQUMsR0FBRyxDQUFDLGtDQUFrQyxDQUFDLENBQUM7QUFDaEQsT0FBTyxDQUFDLEdBQUcsQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO0FBQzFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsdUJBQXVCLEVBQUUsSUFBSSxJQUFJLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO0FBUS9ELE1BQU0sU0FBUztJQUdiLFlBQVksT0FBZTtRQUN6QixJQUFJLENBQUMsSUFBSSxHQUFHO1lBQ1YsT0FBTztZQUNQLFNBQVMsRUFBRSxJQUFJLElBQUksRUFBRTtTQUN0QixDQUFDO0lBQ0osQ0FBQztJQUVNLFVBQVU7UUFDZixPQUFPLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsY0FBYyxFQUFFLEVBQUUsQ0FBQztJQUMzRSxDQUFDO0NBQ0Y7QUFFRCxpQkFBaUI7QUFDakIsTUFBTSxJQUFJLEdBQUcsSUFBSSxTQUFTLENBQUMsa0NBQWtDLENBQUMsQ0FBQztBQUMvRCxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQztBQUUzQyxpQkFBaUI7QUFDakIsUUFBUSxDQUFDLGdCQUFnQixDQUFDLGtCQUFrQixFQUFFLEdBQUcsRUFBRTtJQUNqRCxPQUFPLENBQUMsR0FBRyxDQUFDLGtEQUFrRCxDQUFDLENBQUM7SUFFaEUsd0NBQXdDO0lBQ3hDLE1BQU0sU0FBUyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDaEQsU0FBUyxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUc7Ozs7Ozs7Ozs7OztHQVl6QixDQUFDO0lBQ0YsU0FBUyxDQUFDLFdBQVcsR0FBRywyQkFBMkIsQ0FBQztJQUNwRCxRQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUVyQyw4QkFBOEI7SUFDOUIsVUFBVSxDQUFDLEdBQUcsRUFBRTtRQUNkLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztJQUNyQixDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDWCxDQUFDLENBQUMsQ0FBQztBQUVILHdCQUF3QjtBQUNZIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZWFzeV9sYWJlbGluZy93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9lYXN5X2xhYmVsaW5nL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9lYXN5X2xhYmVsaW5nL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vZWFzeV9sYWJlbGluZy93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL2Vhc3lfbGFiZWxpbmcvLi9zcmMvbWFpbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBUaGUgcmVxdWlyZSBzY29wZVxudmFyIF9fd2VicGFja19yZXF1aXJlX18gPSB7fTtcblxuIiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsIi8qKlxyXG4gKiBFYXN5IExhYmVsaW5nIFR5cGVTY3JpcHQgTWFpbiBFbnRyeSBQb2ludFxyXG4gKiBcclxuICogVGhpcyBpcyB0aGUgbWFpbiBlbnRyeSBwb2ludCBmb3IgdGhlIFR5cGVTY3JpcHQgdmVyc2lvbiBvZiBFYXN5IExhYmVsaW5nLlxyXG4gKiBDdXJyZW50bHkgYSBIZWxsbyBXb3JsZCB0ZXN0IHRvIHZlcmlmeSB0aGUgYnVpbGQgZW52aXJvbm1lbnQuXHJcbiAqL1xyXG5cclxuLy8gSGVsbG8gV29ybGQgdGVzdFxyXG5jb25zb2xlLmxvZygn8J+agCBFYXN5IExhYmVsaW5nIFR5cGVTY3JpcHQgTWlncmF0aW9uIC0gUGhhc2UgMSBDb21wbGV0ZSEnKTtcclxuY29uc29sZS5sb2coJ+KchSBUeXBlU2NyaXB0IGNvbXBpbGF0aW9uIHdvcmtpbmcnKTtcclxuY29uc29sZS5sb2coJ+KchSBXZWJwYWNrIGJ1bmRsaW5nIHdvcmtpbmcnKTtcclxuY29uc29sZS5sb2coJ/Cfk4UgUGhhc2UgMSBjb21wbGV0ZWQ6JywgbmV3IERhdGUoKS50b0lTT1N0cmluZygpKTtcclxuXHJcbi8vIFRlc3QgYmFzaWMgVHlwZVNjcmlwdCBmZWF0dXJlc1xyXG5pbnRlcmZhY2UgVGVzdEludGVyZmFjZSB7XHJcbiAgbWVzc2FnZTogc3RyaW5nO1xyXG4gIHRpbWVzdGFtcDogRGF0ZTtcclxufVxyXG5cclxuY2xhc3MgVGVzdENsYXNzIHtcclxuICBwcml2YXRlIGRhdGE6IFRlc3RJbnRlcmZhY2U7XHJcblxyXG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2U6IHN0cmluZykge1xyXG4gICAgdGhpcy5kYXRhID0ge1xyXG4gICAgICBtZXNzYWdlLFxyXG4gICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKCksXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldE1lc3NhZ2UoKTogc3RyaW5nIHtcclxuICAgIHJldHVybiBgJHt0aGlzLmRhdGEubWVzc2FnZX0gYXQgJHt0aGlzLmRhdGEudGltZXN0YW1wLnRvTG9jYWxlU3RyaW5nKCl9YDtcclxuICB9XHJcbn1cclxuXHJcbi8vIFRlc3QgdGhlIGNsYXNzXHJcbmNvbnN0IHRlc3QgPSBuZXcgVGVzdENsYXNzKCdUeXBlU2NyaXB0IGVudmlyb25tZW50IGlzIHJlYWR5IScpO1xyXG5jb25zb2xlLmxvZygn8J+OryBUZXN0OicsIHRlc3QuZ2V0TWVzc2FnZSgpKTtcclxuXHJcbi8vIERPTSByZWFkeSB0ZXN0XHJcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCAoKSA9PiB7XHJcbiAgY29uc29sZS5sb2coJ/Cfk7EgRE9NIGxvYWRlZCAtIHJlYWR5IGZvciBQaGFzZSAyIGltcGxlbWVudGF0aW9uJyk7XHJcbiAgXHJcbiAgLy8gQ3JlYXRlIGEgc2ltcGxlIGluZGljYXRvciBvbiB0aGUgcGFnZVxyXG4gIGNvbnN0IGluZGljYXRvciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gIGluZGljYXRvci5zdHlsZS5jc3NUZXh0ID0gYFxyXG4gICAgcG9zaXRpb246IGZpeGVkO1xyXG4gICAgdG9wOiAxMHB4O1xyXG4gICAgcmlnaHQ6IDEwcHg7XHJcbiAgICBiYWNrZ3JvdW5kOiAjMjhhNzQ1O1xyXG4gICAgY29sb3I6IHdoaXRlO1xyXG4gICAgcGFkZGluZzogMTBweCAxNXB4O1xyXG4gICAgYm9yZGVyLXJhZGl1czogNXB4O1xyXG4gICAgZm9udC1mYW1pbHk6IG1vbm9zcGFjZTtcclxuICAgIGZvbnQtc2l6ZTogMTJweDtcclxuICAgIHotaW5kZXg6IDk5OTk7XHJcbiAgICBib3gtc2hhZG93OiAwIDJweCA1cHggcmdiYSgwLDAsMCwwLjIpO1xyXG4gIGA7XHJcbiAgaW5kaWNhdG9yLnRleHRDb250ZW50ID0gJ+KchSBUeXBlU2NyaXB0IEJ1aWxkIEFjdGl2ZSc7XHJcbiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChpbmRpY2F0b3IpO1xyXG4gIFxyXG4gIC8vIEF1dG8tcmVtb3ZlIGFmdGVyIDUgc2Vjb25kc1xyXG4gIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgaW5kaWNhdG9yLnJlbW92ZSgpO1xyXG4gIH0sIDUwMDApO1xyXG59KTtcclxuXHJcbi8vIEV4cG9ydCBmb3IgZnV0dXJlIHVzZVxyXG5leHBvcnQgeyBUZXN0Q2xhc3MsIFRlc3RJbnRlcmZhY2UgfTsiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=