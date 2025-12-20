"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CONST = exports.PathKeys = exports.Pattern = exports.TypeGuard = exports.TypeId = void 0;
var TypeId_js_1 = require("./TypeId.js");
Object.defineProperty(exports, "TypeId", { enumerable: true, get: function () { return __importDefault(TypeId_js_1).default; } });
var TypeGuard_js_1 = require("./TypeGuard.js");
Object.defineProperty(exports, "TypeGuard", { enumerable: true, get: function () { return __importDefault(TypeGuard_js_1).default; } });
var Pattern_js_1 = require("./Pattern.js");
Object.defineProperty(exports, "Pattern", { enumerable: true, get: function () { return __importDefault(Pattern_js_1).default; } });
exports.PathKeys = __importStar(require("./PathKeys.js"));
exports.CONST = __importStar(require("./CONST.js"));
