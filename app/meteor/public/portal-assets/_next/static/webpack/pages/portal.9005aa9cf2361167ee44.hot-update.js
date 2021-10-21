webpackHotUpdate_N_E("pages/portal",{

/***/ "./pages/media.js":
/*!************************!*\
  !*** ./pages/media.js ***!
  \************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* WEBPACK VAR INJECTION */(function(module) {/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"./node_modules/react/jsx-dev-runtime.js\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _Users_albertzak_Git_rosalind_app_portal_node_modules_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./node_modules/@babel/runtime/regenerator */ \"./node_modules/@babel/runtime/regenerator/index.js\");\n/* harmony import */ var _Users_albertzak_Git_rosalind_app_portal_node_modules_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_Users_albertzak_Git_rosalind_app_portal_node_modules_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _Users_albertzak_Git_rosalind_app_portal_node_modules_babel_runtime_helpers_esm_asyncToGenerator__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./node_modules/@babel/runtime/helpers/esm/asyncToGenerator */ \"./node_modules/@babel/runtime/helpers/esm/asyncToGenerator.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! react */ \"./node_modules/react/index.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_3__);\n/* harmony import */ var _apiBaseUrl__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../apiBaseUrl */ \"./apiBaseUrl.js\");\n\n\n\n\nvar _jsxFileName = \"/Users/albertzak/Git/rosalind/app/portal/pages/media.js\",\n    _this = undefined,\n    _s = $RefreshSig$();\n\n\n\nvar imgStyle = {\n  maxWidth: '25%',\n  height: 'auto',\n  outline: 0,\n  margin: 3\n};\nvar isDownloadAttributeSupported = typeof document !== 'undefined' && 'download' in document.createElement('a');\n\nvar MediaPage = function MediaPage(_ref) {\n  _s();\n\n  var token = _ref.token;\n\n  var _useState = Object(react__WEBPACK_IMPORTED_MODULE_3__[\"useState\"])(true),\n      loading = _useState[0],\n      setLoading = _useState[1];\n\n  var _useState2 = Object(react__WEBPACK_IMPORTED_MODULE_3__[\"useState\"])(false),\n      error = _useState2[0],\n      setError = _useState2[1];\n\n  var _useState3 = Object(react__WEBPACK_IMPORTED_MODULE_3__[\"useState\"])(true),\n      retry = _useState3[0],\n      setRetry = _useState3[1];\n\n  var _useState4 = Object(react__WEBPACK_IMPORTED_MODULE_3__[\"useState\"])([]),\n      media = _useState4[0],\n      setMedia = _useState4[1];\n\n  Object(react__WEBPACK_IMPORTED_MODULE_3__[\"useEffect\"])( /*#__PURE__*/Object(_Users_albertzak_Git_rosalind_app_portal_node_modules_babel_runtime_helpers_esm_asyncToGenerator__WEBPACK_IMPORTED_MODULE_2__[\"default\"])( /*#__PURE__*/_Users_albertzak_Git_rosalind_app_portal_node_modules_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1___default.a.mark(function _callee() {\n    var body, req, res;\n    return _Users_albertzak_Git_rosalind_app_portal_node_modules_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1___default.a.wrap(function _callee$(_context) {\n      while (1) {\n        switch (_context.prev = _context.next) {\n          case 0:\n            _context.prev = 0;\n            body = JSON.stringify({\n              token: token\n            });\n            _context.next = 4;\n            return fetch((_apiBaseUrl__WEBPACK_IMPORTED_MODULE_4__[\"apiBaseUrl\"] || '') + '/portal/media', {\n              method: 'POST',\n              headers: {\n                'content-type': 'application/json',\n                'content-length': body.length\n              },\n              body: body\n            });\n\n          case 4:\n            req = _context.sent;\n            _context.next = 7;\n            return req.json();\n\n          case 7:\n            res = _context.sent;\n            setLoading(false);\n\n            if (res.error) {\n              setError(res.error);\n            } else {\n              setMedia(res);\n            }\n\n            _context.next = 16;\n            break;\n\n          case 12:\n            _context.prev = 12;\n            _context.t0 = _context[\"catch\"](0);\n            setLoading(false);\n            setError(_context.t0);\n\n          case 16:\n          case \"end\":\n            return _context.stop();\n        }\n      }\n    }, _callee, null, [[0, 12]]);\n  })), [token, retry]);\n\n  var saveAsFile = function saveAsFile(_ref3) {\n    var filename = _ref3.filename,\n        b64 = _ref3.b64;\n    console.error.log('saveasfile', filename, b64.substr(0, 100));\n    var link = document.createElement('a');\n    link.download = name;\n    link.href = b64;\n    link.click();\n  };\n\n  var handleClick = /*#__PURE__*/function () {\n    var _ref4 = Object(_Users_albertzak_Git_rosalind_app_portal_node_modules_babel_runtime_helpers_esm_asyncToGenerator__WEBPACK_IMPORTED_MODULE_2__[\"default\"])( /*#__PURE__*/_Users_albertzak_Git_rosalind_app_portal_node_modules_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1___default.a.mark(function _callee2(m) {\n      var body, req, res;\n      return _Users_albertzak_Git_rosalind_app_portal_node_modules_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1___default.a.wrap(function _callee2$(_context2) {\n        while (1) {\n          switch (_context2.prev = _context2.next) {\n            case 0:\n              _context2.prev = 0;\n              body = JSON.stringify({\n                token: token,\n                _id: m._id\n              });\n              _context2.next = 4;\n              return fetch((_apiBaseUrl__WEBPACK_IMPORTED_MODULE_4__[\"apiBaseUrl\"] || '') + '/portal/media-download', {\n                method: 'POST',\n                headers: {\n                  'content-type': 'application/json',\n                  'content-length': body.length\n                },\n                body: body\n              });\n\n            case 4:\n              req = _context2.sent;\n              _context2.next = 7;\n              return req.json();\n\n            case 7:\n              res = _context2.sent;\n              setLoading(false);\n\n              if (res.error) {\n                setError(res.error);\n              } else {\n                saveAsFile({\n                  filename: res.filename,\n                  b64: res.b64\n                });\n              }\n\n              _context2.next = 16;\n              break;\n\n            case 12:\n              _context2.prev = 12;\n              _context2.t0 = _context2[\"catch\"](0);\n              setLoading(false);\n              setError(_context2.t0);\n\n            case 16:\n            case \"end\":\n              return _context2.stop();\n          }\n        }\n      }, _callee2, null, [[0, 12]]);\n    }));\n\n    return function handleClick(_x) {\n      return _ref4.apply(this, arguments);\n    };\n  }();\n\n  var downloadAll = function downloadAll(e) {\n    e.preventDefault();\n    e.stopPropagation();\n\n    for (var i = 0; i < media.length; i++) {\n      document.getElementById('link-' + media[i]._id).click();\n    }\n  };\n\n  return /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__[\"jsxDEV\"])(\"div\", {\n    children: [/*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__[\"jsxDEV\"])(\"p\", {\n      children: \"Sie k\\xF6nnen die Bilder innerhalb von 14 Tagen abspeichern.\"\n    }, void 0, false, {\n      fileName: _jsxFileName,\n      lineNumber: 96,\n      columnNumber: 5\n    }, _this), /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__[\"jsxDEV\"])(\"p\", {\n      children: token\n    }, void 0, false, {\n      fileName: _jsxFileName,\n      lineNumber: 98,\n      columnNumber: 5\n    }, _this), isDownloadAttributeSupported ? /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__[\"jsxDEV\"])(\"p\", {\n      children: \"Tippen Sie auf ein Bild, um es zu speichern.\"\n    }, void 0, false, {\n      fileName: _jsxFileName,\n      lineNumber: 102,\n      columnNumber: 9\n    }, _this) : /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__[\"jsxDEV\"])(\"p\", {\n      children: \"Tippen Sie auf ein Bild und halten Sie gedr\\xFCckt, um es zu speichern.\"\n    }, void 0, false, {\n      fileName: _jsxFileName,\n      lineNumber: 103,\n      columnNumber: 9\n    }, _this), /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__[\"jsxDEV\"])(\"button\", {\n      onClick: downloadAll,\n      children: \"Alle Bilder speichern\"\n    }, void 0, false, {\n      fileName: _jsxFileName,\n      lineNumber: 106,\n      columnNumber: 5\n    }, _this), /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__[\"jsxDEV\"])(\"br\", {}, void 0, false, {\n      fileName: _jsxFileName,\n      lineNumber: 110,\n      columnNumber: 5\n    }, _this), /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__[\"jsxDEV\"])(\"br\", {}, void 0, false, {\n      fileName: _jsxFileName,\n      lineNumber: 111,\n      columnNumber: 5\n    }, _this), error && /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__[\"jsxDEV\"])(\"div\", {\n      children: [\"Fehler: \", error.toString()]\n    }, void 0, true, {\n      fileName: _jsxFileName,\n      lineNumber: 113,\n      columnNumber: 15\n    }, _this), loading && /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__[\"jsxDEV\"])(\"div\", {\n      children: \"Einen Moment bitte, Bilder werden geladen...\"\n    }, void 0, false, {\n      fileName: _jsxFileName,\n      lineNumber: 114,\n      columnNumber: 17\n    }, _this), (media || []).map(function (m) {\n      return /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__[\"jsxDEV\"])(\"a\", {\n        id: 'link-' + m._id,\n        title: m.title,\n        onClick: function onClick() {\n          return handleClick(m);\n        },\n        children: /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__[\"jsxDEV\"])(\"img\", {\n          style: imgStyle,\n          alt: m.title,\n          src: m.preview\n        }, void 0, false, {\n          fileName: _jsxFileName,\n          lineNumber: 124,\n          columnNumber: 11\n        }, _this)\n      }, m._id, false, {\n        fileName: _jsxFileName,\n        lineNumber: 118,\n        columnNumber: 9\n      }, _this);\n    }), /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__[\"jsxDEV\"])(\"br\", {}, void 0, false, {\n      fileName: _jsxFileName,\n      lineNumber: 129,\n      columnNumber: 5\n    }, _this), /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__[\"jsxDEV\"])(\"br\", {}, void 0, false, {\n      fileName: _jsxFileName,\n      lineNumber: 130,\n      columnNumber: 5\n    }, _this), /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__[\"jsxDEV\"])(\"a\", {\n      href: \"#\",\n      onClick: function onClick() {\n        return setRetry(retry + 1);\n      },\n      children: \"Neu laden\"\n    }, void 0, false, {\n      fileName: _jsxFileName,\n      lineNumber: 131,\n      columnNumber: 5\n    }, _this)]\n  }, void 0, true, {\n    fileName: _jsxFileName,\n    lineNumber: 95,\n    columnNumber: 10\n  }, _this);\n};\n\n_s(MediaPage, \"1xttYf5d58h6y8CNRQmjSfjA5oA=\");\n\n_c = MediaPage;\n/* harmony default export */ __webpack_exports__[\"default\"] = (MediaPage);\n\nvar _c;\n\n$RefreshReg$(_c, \"MediaPage\");\n\n;\n    var _a, _b;\n    // Legacy CSS implementations will `eval` browser code in a Node.js context\n    // to extract CSS. For backwards compatibility, we need to check we're in a\n    // browser context before continuing.\n    if (typeof self !== 'undefined' &&\n        // AMP / No-JS mode does not inject these helpers:\n        '$RefreshHelpers$' in self) {\n        var currentExports = module.__proto__.exports;\n        var prevExports = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevExports) !== null && _b !== void 0 ? _b : null;\n        // This cannot happen in MainTemplate because the exports mismatch between\n        // templating and execution.\n        self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, module.i);\n        // A module can be accepted automatically based on its exports, e.g. when\n        // it is a Refresh Boundary.\n        if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {\n            // Save the previous exports on update so we can compare the boundary\n            // signatures.\n            module.hot.dispose(function (data) {\n                data.prevExports = currentExports;\n            });\n            // Unconditionally accept an update to this module, we'll check if it's\n            // still a Refresh Boundary later.\n            module.hot.accept();\n            // This field is set when the previous version of this module was a\n            // Refresh Boundary, letting us know we need to check for invalidation or\n            // enqueue an update.\n            if (prevExports !== null) {\n                // A boundary can become ineligible if its exports are incompatible\n                // with the previous exports.\n                //\n                // For example, if you add/remove/change exports, we'll want to\n                // re-execute the importing modules, and force those components to\n                // re-render. Similarly, if you convert a class component to a\n                // function, we want to invalidate the boundary.\n                if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevExports, currentExports)) {\n                    module.hot.invalidate();\n                }\n                else {\n                    self.$RefreshHelpers$.scheduleUpdate();\n                }\n            }\n        }\n        else {\n            // Since we just executed the code for the module, it's possible that the\n            // new exports made it ineligible for being a boundary.\n            // We only care about the case when we were _previously_ a boundary,\n            // because we already accepted this update (accidental side effect).\n            var isNoLongerABoundary = prevExports !== null;\n            if (isNoLongerABoundary) {\n                module.hot.invalidate();\n            }\n        }\n    }\n\n/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../node_modules/next/dist/compiled/webpack/harmony-module.js */ \"./node_modules/next/dist/compiled/webpack/harmony-module.js\")(module)))//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9fTl9FLy4vcGFnZXMvbWVkaWEuanM/MDlhNCJdLCJuYW1lcyI6WyJpbWdTdHlsZSIsIm1heFdpZHRoIiwiaGVpZ2h0Iiwib3V0bGluZSIsIm1hcmdpbiIsImlzRG93bmxvYWRBdHRyaWJ1dGVTdXBwb3J0ZWQiLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJNZWRpYVBhZ2UiLCJ0b2tlbiIsInVzZVN0YXRlIiwibG9hZGluZyIsInNldExvYWRpbmciLCJlcnJvciIsInNldEVycm9yIiwicmV0cnkiLCJzZXRSZXRyeSIsIm1lZGlhIiwic2V0TWVkaWEiLCJ1c2VFZmZlY3QiLCJib2R5IiwiSlNPTiIsInN0cmluZ2lmeSIsImZldGNoIiwiYXBpQmFzZVVybCIsIm1ldGhvZCIsImhlYWRlcnMiLCJsZW5ndGgiLCJyZXEiLCJqc29uIiwicmVzIiwic2F2ZUFzRmlsZSIsImZpbGVuYW1lIiwiYjY0IiwiY29uc29sZSIsImxvZyIsInN1YnN0ciIsImxpbmsiLCJkb3dubG9hZCIsIm5hbWUiLCJocmVmIiwiY2xpY2siLCJoYW5kbGVDbGljayIsIm0iLCJfaWQiLCJkb3dubG9hZEFsbCIsImUiLCJwcmV2ZW50RGVmYXVsdCIsInN0b3BQcm9wYWdhdGlvbiIsImkiLCJnZXRFbGVtZW50QnlJZCIsInRvU3RyaW5nIiwibWFwIiwidGl0bGUiLCJwcmV2aWV3Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQ0E7QUFFQSxJQUFNQSxRQUFRLEdBQUc7QUFDZkMsVUFBUSxFQUFFLEtBREs7QUFFZkMsUUFBTSxFQUFFLE1BRk87QUFHZkMsU0FBTyxFQUFFLENBSE07QUFJZkMsUUFBTSxFQUFFO0FBSk8sQ0FBakI7QUFPQSxJQUFNQyw0QkFBNEIsR0FDaEMsT0FBT0MsUUFBUCxLQUFvQixXQUFwQixJQUNBLGNBQWNBLFFBQVEsQ0FBQ0MsYUFBVCxDQUF1QixHQUF2QixDQUZoQjs7QUFJQSxJQUFNQyxTQUFTLEdBQUcsU0FBWkEsU0FBWSxPQUFlO0FBQUE7O0FBQUEsTUFBWkMsS0FBWSxRQUFaQSxLQUFZOztBQUFBLGtCQUNEQyxzREFBUSxDQUFDLElBQUQsQ0FEUDtBQUFBLE1BQ3hCQyxPQUR3QjtBQUFBLE1BQ2ZDLFVBRGU7O0FBQUEsbUJBRUxGLHNEQUFRLENBQUMsS0FBRCxDQUZIO0FBQUEsTUFFeEJHLEtBRndCO0FBQUEsTUFFakJDLFFBRmlCOztBQUFBLG1CQUdMSixzREFBUSxDQUFDLElBQUQsQ0FISDtBQUFBLE1BR3hCSyxLQUh3QjtBQUFBLE1BR2pCQyxRQUhpQjs7QUFBQSxtQkFJTE4sc0RBQVEsQ0FBQyxFQUFELENBSkg7QUFBQSxNQUl4Qk8sS0FKd0I7QUFBQSxNQUlqQkMsUUFKaUI7O0FBTS9CQyx5REFBUywwU0FBQztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUVBQyxnQkFGQSxHQUVPQyxJQUFJLENBQUNDLFNBQUwsQ0FBZTtBQUMxQmIsbUJBQUssRUFBTEE7QUFEMEIsYUFBZixDQUZQO0FBQUE7QUFBQSxtQkFLWWMsS0FBSyxDQUFDLENBQUNDLHNEQUFVLElBQUksRUFBZixJQUFxQixlQUF0QixFQUNyQjtBQUNFQyxvQkFBTSxFQUFFLE1BRFY7QUFFRUMscUJBQU8sRUFBRTtBQUNQLGdDQUFnQixrQkFEVDtBQUVQLGtDQUFrQk4sSUFBSSxDQUFDTztBQUZoQixlQUZYO0FBTUVQLGtCQUFJLEVBQUVBO0FBTlIsYUFEcUIsQ0FMakI7O0FBQUE7QUFLQVEsZUFMQTtBQUFBO0FBQUEsbUJBY1lBLEdBQUcsQ0FBQ0MsSUFBSixFQWRaOztBQUFBO0FBY0FDLGVBZEE7QUFlTmxCLHNCQUFVLENBQUMsS0FBRCxDQUFWOztBQUNBLGdCQUFJa0IsR0FBRyxDQUFDakIsS0FBUixFQUFlO0FBQ2JDLHNCQUFRLENBQUNnQixHQUFHLENBQUNqQixLQUFMLENBQVI7QUFDRCxhQUZELE1BRU87QUFDTEssc0JBQVEsQ0FBQ1ksR0FBRCxDQUFSO0FBQ0Q7O0FBcEJLO0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBc0JObEIsc0JBQVUsQ0FBQyxLQUFELENBQVY7QUFDQUUsb0JBQVEsYUFBUjs7QUF2Qk07QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsR0FBRCxJQXlCTixDQUFDTCxLQUFELEVBQVFNLEtBQVIsQ0F6Qk0sQ0FBVDs7QUEyQkEsTUFBTWdCLFVBQVUsR0FBRyxTQUFiQSxVQUFhLFFBQXVCO0FBQUEsUUFBcEJDLFFBQW9CLFNBQXBCQSxRQUFvQjtBQUFBLFFBQVZDLEdBQVUsU0FBVkEsR0FBVTtBQUN4Q0MsV0FBTyxDQUFDckIsS0FBUixDQUFjc0IsR0FBZCxDQUFrQixZQUFsQixFQUFnQ0gsUUFBaEMsRUFBMENDLEdBQUcsQ0FBQ0csTUFBSixDQUFXLENBQVgsRUFBYyxHQUFkLENBQTFDO0FBQ0EsUUFBTUMsSUFBSSxHQUFHL0IsUUFBUSxDQUFDQyxhQUFULENBQXVCLEdBQXZCLENBQWI7QUFDQThCLFFBQUksQ0FBQ0MsUUFBTCxHQUFnQkMsSUFBaEI7QUFDQUYsUUFBSSxDQUFDRyxJQUFMLEdBQVlQLEdBQVo7QUFDQUksUUFBSSxDQUFDSSxLQUFMO0FBQ0QsR0FORDs7QUFRQSxNQUFNQyxXQUFXO0FBQUEsMlNBQUcsa0JBQU9DLENBQVA7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFFVnZCLGtCQUZVLEdBRUhDLElBQUksQ0FBQ0MsU0FBTCxDQUFlO0FBQzFCYixxQkFBSyxFQUFMQSxLQUQwQjtBQUUxQm1DLG1CQUFHLEVBQUVELENBQUMsQ0FBQ0M7QUFGbUIsZUFBZixDQUZHO0FBQUE7QUFBQSxxQkFNRXJCLEtBQUssQ0FBQyxDQUFDQyxzREFBVSxJQUFJLEVBQWYsSUFBcUIsd0JBQXRCLEVBQ3JCO0FBQ0VDLHNCQUFNLEVBQUUsTUFEVjtBQUVFQyx1QkFBTyxFQUFFO0FBQ1Asa0NBQWdCLGtCQURUO0FBRVAsb0NBQWtCTixJQUFJLENBQUNPO0FBRmhCLGlCQUZYO0FBTUVQLG9CQUFJLEVBQUVBO0FBTlIsZUFEcUIsQ0FOUDs7QUFBQTtBQU1WUSxpQkFOVTtBQUFBO0FBQUEscUJBZUVBLEdBQUcsQ0FBQ0MsSUFBSixFQWZGOztBQUFBO0FBZVZDLGlCQWZVO0FBZ0JoQmxCLHdCQUFVLENBQUMsS0FBRCxDQUFWOztBQUNBLGtCQUFJa0IsR0FBRyxDQUFDakIsS0FBUixFQUFlO0FBQ2JDLHdCQUFRLENBQUNnQixHQUFHLENBQUNqQixLQUFMLENBQVI7QUFDRCxlQUZELE1BRU87QUFDTGtCLDBCQUFVLENBQUM7QUFDVEMsMEJBQVEsRUFBRUYsR0FBRyxDQUFDRSxRQURMO0FBRVRDLHFCQUFHLEVBQUVILEdBQUcsQ0FBQ0c7QUFGQSxpQkFBRCxDQUFWO0FBSUQ7O0FBeEJlO0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBMEJoQnJCLHdCQUFVLENBQUMsS0FBRCxDQUFWO0FBQ0FFLHNCQUFRLGNBQVI7O0FBM0JnQjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxLQUFIOztBQUFBLG9CQUFYNEIsV0FBVztBQUFBO0FBQUE7QUFBQSxLQUFqQjs7QUErQkEsTUFBTUcsV0FBVyxHQUFHLFNBQWRBLFdBQWMsQ0FBQ0MsQ0FBRCxFQUFPO0FBQ3pCQSxLQUFDLENBQUNDLGNBQUY7QUFDQUQsS0FBQyxDQUFDRSxlQUFGOztBQUNBLFNBQUssSUFBSUMsQ0FBQyxHQUFHLENBQWIsRUFBZ0JBLENBQUMsR0FBR2hDLEtBQUssQ0FBQ1UsTUFBMUIsRUFBa0NzQixDQUFDLEVBQW5DLEVBQXVDO0FBQ3JDM0MsY0FBUSxDQUFDNEMsY0FBVCxDQUF3QixVQUFVakMsS0FBSyxDQUFDZ0MsQ0FBRCxDQUFMLENBQVNMLEdBQTNDLEVBQWdESCxLQUFoRDtBQUNEO0FBQ0YsR0FORDs7QUFRQSxzQkFBTztBQUFBLDRCQUNMO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLGFBREssZUFHTDtBQUFBLGdCQUFJaEM7QUFBSjtBQUFBO0FBQUE7QUFBQTtBQUFBLGFBSEssRUFNSEosNEJBQTRCLGdCQUMxQjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxhQUQwQixnQkFFMUI7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsYUFSQyxlQVdMO0FBQVEsYUFBTyxFQUFFd0MsV0FBakI7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsYUFYSyxlQWVMO0FBQUE7QUFBQTtBQUFBO0FBQUEsYUFmSyxlQWdCTDtBQUFBO0FBQUE7QUFBQTtBQUFBLGFBaEJLLEVBa0JKaEMsS0FBSyxpQkFBSTtBQUFBLDZCQUFjQSxLQUFLLENBQUNzQyxRQUFOLEVBQWQ7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLGFBbEJMLEVBbUJKeEMsT0FBTyxpQkFBSTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxhQW5CUCxFQXNCSCxDQUFDTSxLQUFLLElBQUksRUFBVixFQUFjbUMsR0FBZCxDQUFrQixVQUFBVCxDQUFDO0FBQUEsMEJBQ2pCO0FBQ0UsVUFBRSxFQUFFLFVBQVVBLENBQUMsQ0FBQ0MsR0FEbEI7QUFHRSxhQUFLLEVBQUVELENBQUMsQ0FBQ1UsS0FIWDtBQUlFLGVBQU8sRUFBRTtBQUFBLGlCQUFNWCxXQUFXLENBQUNDLENBQUQsQ0FBakI7QUFBQSxTQUpYO0FBQUEsK0JBTUU7QUFBSyxlQUFLLEVBQUUzQyxRQUFaO0FBQXNCLGFBQUcsRUFBRTJDLENBQUMsQ0FBQ1UsS0FBN0I7QUFBb0MsYUFBRyxFQUFFVixDQUFDLENBQUNXO0FBQTNDO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFORixTQUVPWCxDQUFDLENBQUNDLEdBRlQ7QUFBQTtBQUFBO0FBQUE7QUFBQSxlQURpQjtBQUFBLEtBQW5CLENBdEJHLGVBa0NMO0FBQUE7QUFBQTtBQUFBO0FBQUEsYUFsQ0ssZUFtQ0w7QUFBQTtBQUFBO0FBQUE7QUFBQSxhQW5DSyxlQW9DTDtBQUFHLFVBQUksRUFBQyxHQUFSO0FBQVksYUFBTyxFQUFFO0FBQUEsZUFBTTVCLFFBQVEsQ0FBQ0QsS0FBSyxHQUFHLENBQVQsQ0FBZDtBQUFBLE9BQXJCO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLGFBcENLO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxXQUFQO0FBd0NELENBeEhEOztHQUFNUCxTOztLQUFBQSxTO0FBMEhTQSx3RUFBZiIsImZpbGUiOiIuL3BhZ2VzL21lZGlhLmpzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgdXNlU3RhdGUsIHVzZUVmZmVjdCB9IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgYXBpQmFzZVVybCB9IGZyb20gJy4uL2FwaUJhc2VVcmwnXG5cbmNvbnN0IGltZ1N0eWxlID0ge1xuICBtYXhXaWR0aDogJzI1JScsXG4gIGhlaWdodDogJ2F1dG8nLFxuICBvdXRsaW5lOiAwLFxuICBtYXJnaW46IDNcbn1cblxuY29uc3QgaXNEb3dubG9hZEF0dHJpYnV0ZVN1cHBvcnRlZCA9XG4gIHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCcgJiZcbiAgJ2Rvd25sb2FkJyBpbiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJylcblxuY29uc3QgTWVkaWFQYWdlID0gKHsgdG9rZW4gfSkgPT4ge1xuICBjb25zdCBbbG9hZGluZywgc2V0TG9hZGluZ10gPSB1c2VTdGF0ZSh0cnVlKVxuICBjb25zdCBbZXJyb3IsIHNldEVycm9yXSA9IHVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbcmV0cnksIHNldFJldHJ5XSA9IHVzZVN0YXRlKHRydWUpXG4gIGNvbnN0IFttZWRpYSwgc2V0TWVkaWFdID0gdXNlU3RhdGUoW10pXG5cbiAgdXNlRWZmZWN0KGFzeW5jICgpID0+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgYm9keSA9IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgdG9rZW5cbiAgICAgIH0pXG4gICAgICBjb25zdCByZXEgPSBhd2FpdCBmZXRjaCgoYXBpQmFzZVVybCB8fCAnJykgKyAnL3BvcnRhbC9tZWRpYScsXG4gICAgICAgIHtcbiAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAnY29udGVudC10eXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICAgICAgJ2NvbnRlbnQtbGVuZ3RoJzogYm9keS5sZW5ndGhcbiAgICAgICAgICB9LFxuICAgICAgICAgIGJvZHk6IGJvZHlcbiAgICAgICAgfSlcbiAgICAgIGNvbnN0IHJlcyA9IGF3YWl0IHJlcS5qc29uKClcbiAgICAgIHNldExvYWRpbmcoZmFsc2UpXG4gICAgICBpZiAocmVzLmVycm9yKSB7XG4gICAgICAgIHNldEVycm9yKHJlcy5lcnJvcilcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNldE1lZGlhKHJlcylcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBzZXRMb2FkaW5nKGZhbHNlKVxuICAgICAgc2V0RXJyb3IoZSlcbiAgICB9XG4gIH0sIFt0b2tlbiwgcmV0cnldKVxuXG4gIGNvbnN0IHNhdmVBc0ZpbGUgPSAoeyBmaWxlbmFtZSwgYjY0IH0pID0+IHtcbiAgICBjb25zb2xlLmVycm9yLmxvZygnc2F2ZWFzZmlsZScsIGZpbGVuYW1lLCBiNjQuc3Vic3RyKDAsIDEwMCkpXG4gICAgY29uc3QgbGluayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKVxuICAgIGxpbmsuZG93bmxvYWQgPSBuYW1lXG4gICAgbGluay5ocmVmID0gYjY0XG4gICAgbGluay5jbGljaygpXG4gIH1cblxuICBjb25zdCBoYW5kbGVDbGljayA9IGFzeW5jIChtKSA9PiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGJvZHkgPSBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgIHRva2VuLFxuICAgICAgICBfaWQ6IG0uX2lkXG4gICAgICB9KVxuICAgICAgY29uc3QgcmVxID0gYXdhaXQgZmV0Y2goKGFwaUJhc2VVcmwgfHwgJycpICsgJy9wb3J0YWwvbWVkaWEtZG93bmxvYWQnLFxuICAgICAgICB7XG4gICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgJ2NvbnRlbnQtdHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgICAgICdjb250ZW50LWxlbmd0aCc6IGJvZHkubGVuZ3RoXG4gICAgICAgICAgfSxcbiAgICAgICAgICBib2R5OiBib2R5XG4gICAgICAgIH0pXG4gICAgICBjb25zdCByZXMgPSBhd2FpdCByZXEuanNvbigpXG4gICAgICBzZXRMb2FkaW5nKGZhbHNlKVxuICAgICAgaWYgKHJlcy5lcnJvcikge1xuICAgICAgICBzZXRFcnJvcihyZXMuZXJyb3IpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzYXZlQXNGaWxlKHtcbiAgICAgICAgICBmaWxlbmFtZTogcmVzLmZpbGVuYW1lLFxuICAgICAgICAgIGI2NDogcmVzLmI2NFxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHNldExvYWRpbmcoZmFsc2UpXG4gICAgICBzZXRFcnJvcihlKVxuICAgIH1cbiAgfVxuXG4gIGNvbnN0IGRvd25sb2FkQWxsID0gKGUpID0+IHtcbiAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICBlLnN0b3BQcm9wYWdhdGlvbigpXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBtZWRpYS5sZW5ndGg7IGkrKykge1xuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xpbmstJyArIG1lZGlhW2ldLl9pZCkuY2xpY2soKVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiA8ZGl2PlxuICAgIDxwPlNpZSBrw7ZubmVuIGRpZSBCaWxkZXIgaW5uZXJoYWxiIHZvbiAxNCBUYWdlbiBhYnNwZWljaGVybi48L3A+XG5cbiAgICA8cD57dG9rZW59PC9wPlxuXG4gICAge1xuICAgICAgaXNEb3dubG9hZEF0dHJpYnV0ZVN1cHBvcnRlZFxuICAgICAgPyA8cD5UaXBwZW4gU2llIGF1ZiBlaW4gQmlsZCwgdW0gZXMgenUgc3BlaWNoZXJuLjwvcD5cbiAgICAgIDogPHA+VGlwcGVuIFNpZSBhdWYgZWluIEJpbGQgdW5kIGhhbHRlbiBTaWUgZ2VkcsO8Y2t0LCB1bSBlcyB6dSBzcGVpY2hlcm4uPC9wPlxuICAgIH1cblxuICAgIDxidXR0b24gb25DbGljaz17ZG93bmxvYWRBbGx9PlxuICAgICAgQWxsZSBCaWxkZXIgc3BlaWNoZXJuXG4gICAgPC9idXR0b24+XG5cbiAgICA8YnIgLz5cbiAgICA8YnIgLz5cblxuICAgIHtlcnJvciAmJiA8ZGl2PkZlaGxlcjoge2Vycm9yLnRvU3RyaW5nKCl9PC9kaXY+fVxuICAgIHtsb2FkaW5nICYmIDxkaXY+RWluZW4gTW9tZW50IGJpdHRlLCBCaWxkZXIgd2VyZGVuIGdlbGFkZW4uLi48L2Rpdj59XG5cbiAgICB7XG4gICAgICAobWVkaWEgfHwgW10pLm1hcChtID0+XG4gICAgICAgIDxhXG4gICAgICAgICAgaWQ9eydsaW5rLScgKyBtLl9pZH1cbiAgICAgICAgICBrZXk9e20uX2lkfVxuICAgICAgICAgIHRpdGxlPXttLnRpdGxlfVxuICAgICAgICAgIG9uQ2xpY2s9eygpID0+IGhhbmRsZUNsaWNrKG0pfVxuICAgICAgICA+XG4gICAgICAgICAgPGltZyBzdHlsZT17aW1nU3R5bGV9IGFsdD17bS50aXRsZX0gc3JjPXttLnByZXZpZXd9IC8+XG4gICAgICAgIDwvYT5cbiAgICAgIClcbiAgICB9XG5cbiAgICA8YnIgLz5cbiAgICA8YnIgLz5cbiAgICA8YSBocmVmPScjJyBvbkNsaWNrPXsoKSA9PiBzZXRSZXRyeShyZXRyeSArIDEpfT5cbiAgICAgIE5ldSBsYWRlblxuICAgIDwvYT5cbiAgPC9kaXY+XG59XG5cbmV4cG9ydCBkZWZhdWx0IE1lZGlhUGFnZVxuIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///./pages/media.js\n");

/***/ })

})