"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.createServer = void 0;
// # Main api file
var express = require('express');
var path = require('path');
var cors = require('cors');
var cookieParser = require('cookie-parser');
var responseTime = require('response-time');
var app = express();
// Env variables
require('dotenv').config({ path: path.resolve('.env') });
// Functionality
var createDatabase = require('./database');
var createRouter = require('./api/router');
var controllers = require('./api/router/controllers');
var plugins = require('./api/plugins');
// Services
var validateConfig = require('./api/services/validate-config');
// Db instance
var database = null;
// Main
var createServer = function (object) { return __awaiter(void 0, void 0, void 0, function () {
    var config, HOST, PORT, plugin, pluginConfig, _i, _a, Static, Base, Path, _b, _c, Static, Base, Path;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0: return [4 /*yield*/, validateConfig(object)["catch"](function (err) {
                    console.error('[validateConfig]', err);
                    process.exit(1);
                })];
            case 1:
                config = _d.sent();
                HOST = config.host || 'localhost';
                PORT = config.port || 3000;
                // Connect to the database
                database = createDatabase(config.database);
                // Initialize
                app.use(express.json());
                app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
                app.use(cookieParser());
                app.use(cors(config.cors));
                app.use(initializer(config)); // Set req.app properties  
                app.use("".concat(config.api.base), timer, createRouter(config.api, { name: 'api' })); // Primary router is api
                // Set plugins
                if (config.api.plugins) {
                    // Check plugins configuration
                    for (plugin in config.api.plugins) {
                        if (plugin in plugins) {
                            if (config.api.plugins[plugin]) {
                                pluginConfig = {
                                    routes: plugins[plugin].routes,
                                    define: config.api.define // uses the same `define` as the api (for now)
                                };
                                // Set plugin as Router
                                app.use("".concat(config.api.base, "/").concat(plugin), timer, createRouter(pluginConfig, { name: plugin, isPlugin: true }));
                            }
                        }
                        // custom plugins
                        else {
                            console.error("Plugin ".concat(plugin, " not found"));
                            continue;
                        }
                    }
                }
                // Blue-Server static folders
                if (config.static) {
                    for (_i = 0, _a = config.static; _i < _a.length; _i++) {
                        Static = _a[_i];
                        Base = Static.base || Static.folder.replace(/../g, '') || '/';
                        Path = path.join(config.__dirname, Static.folder);
                        // set static folder
                        app.use(Base, timer, express.static(Path, Static.options)); // Primary static folders
                    }
                }
                // API static folders
                if (config.api.static) {
                    for (_b = 0, _c = config.api.static; _b < _c.length; _b++) {
                        Static = _c[_b];
                        Base = path.join(config.api.base, Static.base || Static.folder.replace(/../g, '')).replace(/\\/g, '/');
                        Path = (Static.fullpath || path.join(process.cwd(), Static.folder)).replace(/\\/g, '/');
                        // set static folder
                        app.use(Base, timer, express.static(Path, Static.options));
                    }
                }
                app.listen(PORT, HOST, function () {
                    console.log("\u001B[34m".concat(config.poweredBy, " is running\u001B[0m"));
                    console.log("\u001B[34mNetwork:\u001B[0m http://".concat(HOST, ":").concat(PORT));
                });
                return [2 /*return*/, app];
        }
    });
}); };
exports.createServer = createServer;
var timer = responseTime(function (req, res, time) {
    if (req.app.$config.timer === true) {
        console.log("\u001B[33m[".concat(req.method, "]\u001B[0m \u001B[34m").concat(req.url, "\u001B[0m ").concat(time.toFixed(0), "ms"));
    }
});
var initializer = function (config) { return function (req, res, next) {
    // set req.app properties
    req.app.$config = config;
    req.app.db = database;
    req.app.controllers = controllers;
    // app name
    res.set('X-Powered-By', config.poweredBy);
    next();
}; };
