webpackHotUpdate_N_E("pages/portal",{

/***/ "./pages/media.js":
/*!************************!*\
  !*** ./pages/media.js ***!
  \************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* WEBPACK VAR INJECTION */(function(module) {/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"./node_modules/react/jsx-dev-runtime.js\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _Users_albertzak_Git_rosalind_app_portal_node_modules_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./node_modules/@babel/runtime/regenerator */ \"./node_modules/@babel/runtime/regenerator/index.js\");\n/* harmony import */ var _Users_albertzak_Git_rosalind_app_portal_node_modules_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_Users_albertzak_Git_rosalind_app_portal_node_modules_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _Users_albertzak_Git_rosalind_app_portal_node_modules_babel_runtime_helpers_esm_asyncToGenerator__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./node_modules/@babel/runtime/helpers/esm/asyncToGenerator */ \"./node_modules/@babel/runtime/helpers/esm/asyncToGenerator.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! react */ \"./node_modules/react/index.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_3__);\n\n\n\n\nvar _jsxFileName = \"/Users/albertzak/Git/rosalind/app/portal/pages/media.js\",\n    _this = undefined,\n    _s = $RefreshSig$();\n\n\nvar imgStyle = {\n  maxWidth: '25%',\n  height: 'auto',\n  outline: 0,\n  margin: 3\n};\nvar isDownloadAttributeSupported = typeof document !== 'undefined' && 'download' in document.createElement('a');\n\nvar MediaPage = function MediaPage(_ref) {\n  _s();\n\n  var token = _ref.token;\n\n  var _useState = Object(react__WEBPACK_IMPORTED_MODULE_3__[\"useState\"])(true),\n      loading = _useState[0],\n      setLoading = _useState[1];\n\n  var _useState2 = Object(react__WEBPACK_IMPORTED_MODULE_3__[\"useState\"])(true),\n      error = _useState2[0],\n      setError = _useState2[1];\n\n  var _useState3 = Object(react__WEBPACK_IMPORTED_MODULE_3__[\"useState\"])(),\n      media = _useState3[0],\n      setMedia = _useState3[1];\n\n  Object(react__WEBPACK_IMPORTED_MODULE_3__[\"useEffect\"])( /*#__PURE__*/Object(_Users_albertzak_Git_rosalind_app_portal_node_modules_babel_runtime_helpers_esm_asyncToGenerator__WEBPACK_IMPORTED_MODULE_2__[\"default\"])( /*#__PURE__*/_Users_albertzak_Git_rosalind_app_portal_node_modules_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1___default.a.mark(function _callee() {\n    var body, req, res;\n    return _Users_albertzak_Git_rosalind_app_portal_node_modules_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1___default.a.wrap(function _callee$(_context) {\n      while (1) {\n        switch (_context.prev = _context.next) {\n          case 0:\n            body = JSON.stringify({\n              token: token\n            });\n            _context.next = 3;\n            return fetch((apiBaseUrl || '') + '/portal/media', {\n              method: 'POST',\n              headers: {\n                'content-type': 'application/json',\n                'content-length': body.length\n              },\n              body: body\n            });\n\n          case 3:\n            req = _context.sent;\n            _context.next = 6;\n            return req.json();\n\n          case 6:\n            res = _context.sent;\n\n            if (res.error) {\n              setError(res.error);\n            } else {\n              setMedia(res);\n            }\n\n          case 8:\n          case \"end\":\n            return _context.stop();\n        }\n      }\n    }, _callee);\n  })), [token]);\n\n  if (loading) {\n    return /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__[\"jsxDEV\"])(\"div\", {\n      children: \"Einen Moment bitte, Bilder werden geladen...\"\n    }, void 0, false, {\n      fileName: _jsxFileName,\n      lineNumber: 41,\n      columnNumber: 12\n    }, _this);\n  }\n\n  var downloadAll = function downloadAll(e) {\n    e.preventDefault();\n    e.stopPropagation();\n\n    for (var i = 0; i < media.length; i++) {\n      document.getElementById('link-' + media[i]._id).click();\n    }\n  };\n\n  return /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__[\"jsxDEV\"])(\"div\", {\n    children: [/*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__[\"jsxDEV\"])(\"p\", {\n      children: \"Sie k\\xF6nnen die Bilder innerhalb von 14 Tagen abspeichern.\"\n    }, void 0, false, {\n      fileName: _jsxFileName,\n      lineNumber: 53,\n      columnNumber: 5\n    }, _this), /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__[\"jsxDEV\"])(\"p\", {\n      children: token\n    }, void 0, false, {\n      fileName: _jsxFileName,\n      lineNumber: 55,\n      columnNumber: 5\n    }, _this), isDownloadAttributeSupported ? /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__[\"jsxDEV\"])(\"p\", {\n      children: \"Tippen Sie auf ein Bild, um es zu speichern.\"\n    }, void 0, false, {\n      fileName: _jsxFileName,\n      lineNumber: 59,\n      columnNumber: 9\n    }, _this) : /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__[\"jsxDEV\"])(\"p\", {\n      children: \"Tippen Sie auf ein Bild und halten Sie gedr\\xFCckt, um es zu speichern.\"\n    }, void 0, false, {\n      fileName: _jsxFileName,\n      lineNumber: 60,\n      columnNumber: 9\n    }, _this), /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__[\"jsxDEV\"])(\"button\", {\n      onClick: downloadAll,\n      children: \"Alle Bilder speichern\"\n    }, void 0, false, {\n      fileName: _jsxFileName,\n      lineNumber: 63,\n      columnNumber: 5\n    }, _this), /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__[\"jsxDEV\"])(\"br\", {}, void 0, false, {\n      fileName: _jsxFileName,\n      lineNumber: 67,\n      columnNumber: 5\n    }, _this), /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__[\"jsxDEV\"])(\"br\", {}, void 0, false, {\n      fileName: _jsxFileName,\n      lineNumber: 68,\n      columnNumber: 5\n    }, _this), media.map(function (i) {\n      return /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__[\"jsxDEV\"])(\"a\", {\n        id: 'link-' + m._id,\n        download: m.filename,\n        href: m.path,\n        title: m.title,\n        children: /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__[\"jsxDEV\"])(\"img\", {\n          style: imgStyle,\n          alt: m.title,\n          src: m.preview\n        }, void 0, false, {\n          fileName: _jsxFileName,\n          lineNumber: 79,\n          columnNumber: 11\n        }, _this)\n      }, m._id, false, {\n        fileName: _jsxFileName,\n        lineNumber: 72,\n        columnNumber: 9\n      }, _this);\n    })]\n  }, void 0, true, {\n    fileName: _jsxFileName,\n    lineNumber: 52,\n    columnNumber: 10\n  }, _this);\n};\n\n_s(MediaPage, \"U88Tk5b8au6T9MqtgUj3P45eL60=\");\n\n_c = MediaPage;\n/* harmony default export */ __webpack_exports__[\"default\"] = (MediaPage);\n\nvar _c;\n\n$RefreshReg$(_c, \"MediaPage\");\n\n;\n    var _a, _b;\n    // Legacy CSS implementations will `eval` browser code in a Node.js context\n    // to extract CSS. For backwards compatibility, we need to check we're in a\n    // browser context before continuing.\n    if (typeof self !== 'undefined' &&\n        // AMP / No-JS mode does not inject these helpers:\n        '$RefreshHelpers$' in self) {\n        var currentExports = module.__proto__.exports;\n        var prevExports = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevExports) !== null && _b !== void 0 ? _b : null;\n        // This cannot happen in MainTemplate because the exports mismatch between\n        // templating and execution.\n        self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, module.i);\n        // A module can be accepted automatically based on its exports, e.g. when\n        // it is a Refresh Boundary.\n        if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {\n            // Save the previous exports on update so we can compare the boundary\n            // signatures.\n            module.hot.dispose(function (data) {\n                data.prevExports = currentExports;\n            });\n            // Unconditionally accept an update to this module, we'll check if it's\n            // still a Refresh Boundary later.\n            module.hot.accept();\n            // This field is set when the previous version of this module was a\n            // Refresh Boundary, letting us know we need to check for invalidation or\n            // enqueue an update.\n            if (prevExports !== null) {\n                // A boundary can become ineligible if its exports are incompatible\n                // with the previous exports.\n                //\n                // For example, if you add/remove/change exports, we'll want to\n                // re-execute the importing modules, and force those components to\n                // re-render. Similarly, if you convert a class component to a\n                // function, we want to invalidate the boundary.\n                if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevExports, currentExports)) {\n                    module.hot.invalidate();\n                }\n                else {\n                    self.$RefreshHelpers$.scheduleUpdate();\n                }\n            }\n        }\n        else {\n            // Since we just executed the code for the module, it's possible that the\n            // new exports made it ineligible for being a boundary.\n            // We only care about the case when we were _previously_ a boundary,\n            // because we already accepted this update (accidental side effect).\n            var isNoLongerABoundary = prevExports !== null;\n            if (isNoLongerABoundary) {\n                module.hot.invalidate();\n            }\n        }\n    }\n\n/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../node_modules/next/dist/compiled/webpack/harmony-module.js */ \"./node_modules/next/dist/compiled/webpack/harmony-module.js\")(module)))//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9fTl9FLy4vcGFnZXMvbWVkaWEuanM/MDlhNCJdLCJuYW1lcyI6WyJpbWdTdHlsZSIsIm1heFdpZHRoIiwiaGVpZ2h0Iiwib3V0bGluZSIsIm1hcmdpbiIsImlzRG93bmxvYWRBdHRyaWJ1dGVTdXBwb3J0ZWQiLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJNZWRpYVBhZ2UiLCJ0b2tlbiIsInVzZVN0YXRlIiwibG9hZGluZyIsInNldExvYWRpbmciLCJlcnJvciIsInNldEVycm9yIiwibWVkaWEiLCJzZXRNZWRpYSIsInVzZUVmZmVjdCIsImJvZHkiLCJKU09OIiwic3RyaW5naWZ5IiwiZmV0Y2giLCJhcGlCYXNlVXJsIiwibWV0aG9kIiwiaGVhZGVycyIsImxlbmd0aCIsInJlcSIsImpzb24iLCJyZXMiLCJkb3dubG9hZEFsbCIsImUiLCJwcmV2ZW50RGVmYXVsdCIsInN0b3BQcm9wYWdhdGlvbiIsImkiLCJnZXRFbGVtZW50QnlJZCIsIl9pZCIsImNsaWNrIiwibWFwIiwibSIsImZpbGVuYW1lIiwicGF0aCIsInRpdGxlIiwicHJldmlldyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBRUEsSUFBTUEsUUFBUSxHQUFHO0FBQ2ZDLFVBQVEsRUFBRSxLQURLO0FBRWZDLFFBQU0sRUFBRSxNQUZPO0FBR2ZDLFNBQU8sRUFBRSxDQUhNO0FBSWZDLFFBQU0sRUFBRTtBQUpPLENBQWpCO0FBT0EsSUFBTUMsNEJBQTRCLEdBQ2hDLE9BQU9DLFFBQVAsS0FBb0IsV0FBcEIsSUFDQSxjQUFjQSxRQUFRLENBQUNDLGFBQVQsQ0FBdUIsR0FBdkIsQ0FGaEI7O0FBSUEsSUFBTUMsU0FBUyxHQUFHLFNBQVpBLFNBQVksT0FBZTtBQUFBOztBQUFBLE1BQVpDLEtBQVksUUFBWkEsS0FBWTs7QUFBQSxrQkFDREMsc0RBQVEsQ0FBQyxJQUFELENBRFA7QUFBQSxNQUN4QkMsT0FEd0I7QUFBQSxNQUNmQyxVQURlOztBQUFBLG1CQUVM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RDs7R0FBTTNCLFM7O0tBQUFBLFM7QUF3RVNBLHdFQUFmIiwiZmlsZSI6Ii4vcGFnZXMvbWVkaWEuanMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyB1c2VTdGF0ZSwgdXNlRWZmZWN0IH0gZnJvbSAncmVhY3QnXG5cbmNvbnN0IGltZ1N0eWxlID0ge1xuICBtYXhXaWR0aDogJzI1JScsXG4gIGhlaWdodDogJ2F1dG8nLFxuICBvdXRsaW5lOiAwLFxuICBtYXJnaW46IDNcbn1cblxuY29uc3QgaXNEb3dubG9hZEF0dHJpYnV0ZVN1cHBvcnRlZCA9XG4gIHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCcgJiZcbiAgJ2Rvd25sb2FkJyBpbiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJylcblxuY29uc3QgTWVkaWFQYWdlID0gKHsgdG9rZW4gfSkgPT4ge1xuICBjb25zdCBbbG9hZGluZywgc2V0TG9hZGluZ10gPSB1c2VTdGF0ZSh0cnVlKVxuICBjb25zdCBbZXJyb3IsIHNldEVycm9yXSA9IHVzZVN0YXRlKHRydWUpXG4gIGNvbnN0IFttZWRpYSwgc2V0TWVkaWFdID0gdXNlU3RhdGUoKVxuXG4gIHVzZUVmZmVjdChhc3luYyAoKSA9PiB7XG4gICAgY29uc3QgYm9keSA9IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgIHRva2VuXG4gICAgfSlcbiAgICBjb25zdCByZXEgPSBhd2FpdCBmZXRjaCgoYXBpQmFzZVVybCB8fCAnJykgKyAnL3BvcnRhbC9tZWRpYScsXG4gICAgICB7XG4gICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgJ2NvbnRlbnQtdHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgICAnY29udGVudC1sZW5ndGgnOiBib2R5Lmxlbmd0aFxuICAgICAgICB9LFxuICAgICAgICBib2R5OiBib2R5XG4gICAgICB9KVxuICAgIGNvbnN0IHJlcyA9IGF3YWl0IHJlcS5qc29uKClcbiAgICBpZiAocmVzLmVycm9yKSB7XG4gICAgICBzZXRFcnJvcihyZXMuZXJyb3IpXG4gICAgfSBlbHNlIHtcbiAgICAgIHNldE1lZGlhKHJlcylcbiAgICB9XG4gIH0sIFt0b2tlbl0pXG5cbiAgaWYgKGxvYWRpbmcpIHtcbiAgICByZXR1cm4gPGRpdj5FaW5lbiBNb21lbnQgYml0dGUsIEJpbGRlciB3ZXJkZW4gZ2VsYWRlbi4uLjwvZGl2PlxuICB9XG5cbiAgY29uc3QgZG93bmxvYWRBbGwgPSAoZSkgPT4ge1xuICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG1lZGlhLmxlbmd0aDsgaSsrKSB7XG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbGluay0nICsgbWVkaWFbaV0uX2lkKS5jbGljaygpXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIDxkaXY+XG4gICAgPHA+U2llIGvDtm5uZW4gZGllIEJpbGRlciBpbm5lcmhhbGIgdm9uIDE0IFRhZ2VuIGFic3BlaWNoZXJuLjwvcD5cblxuICAgIDxwPnt0b2tlbn08L3A+XG5cbiAgICB7XG4gICAgICBpc0Rvd25sb2FkQXR0cmlidXRlU3VwcG9ydGVkXG4gICAgICA/IDxwPlRpcHBlbiBTaWUgYXVmIGVpbiBCaWxkLCB1bSBlcyB6dSBzcGVpY2hlcm4uPC9wPlxuICAgICAgOiA8cD5UaXBwZW4gU2llIGF1ZiBlaW4gQmlsZCB1bmQgaGFsdGVuIFNpZSBnZWRyw7xja3QsIHVtIGVzIHp1IHNwZWljaGVybi48L3A+XG4gICAgfVxuXG4gICAgPGJ1dHRvbiBvbkNsaWNrPXtkb3dubG9hZEFsbH0+XG4gICAgICBBbGxlIEJpbGRlciBzcGVpY2hlcm5cbiAgICA8L2J1dHRvbj5cblxuICAgIDxiciAvPlxuICAgIDxiciAvPlxuXG4gICAge1xuICAgICAgbWVkaWEubWFwKGkgPT5cbiAgICAgICAgPGFcbiAgICAgICAgICBpZD17J2xpbmstJyArIG0uX2lkfVxuICAgICAgICAgIGtleT17bS5faWR9XG4gICAgICAgICAgZG93bmxvYWQ9e20uZmlsZW5hbWV9XG4gICAgICAgICAgaHJlZj17bS5wYXRofVxuICAgICAgICAgIHRpdGxlPXttLnRpdGxlfVxuICAgICAgICA+XG4gICAgICAgICAgPGltZyBzdHlsZT17aW1nU3R5bGV9IGFsdD17bS50aXRsZX0gc3JjPXttLnByZXZpZXd9IC8+XG4gICAgICAgIDwvYT5cbiAgICAgIClcbiAgICB9XG4gIDwvZGl2PlxufVxuXG5leHBvcnQgZGVmYXVsdCBNZWRpYVBhZ2VcbiJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./pages/media.js\n");

/***/ })

})