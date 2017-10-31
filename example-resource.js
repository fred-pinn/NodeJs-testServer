"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
// example-resource.js 
var rest_services_1 = require("rest-services");
// Define your own resources by extending Resource class 
var ExampleResource = /** @class */ (function (_super) {
    __extends(ExampleResource, _super);
    function ExampleResource() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
    * Define resource endpoints.
    *
    * @return state
    */
    ExampleResource.prototype.getInitialState = function () {
        return {
            resourceId: 'example',
            resourceDefinition: {
                operations: {
                    retrieve: {
                        title: 'Retrieve entity',
                        description: 'Retrieve entity by id.',
                        callback: this.retrieveItem.bind(this),
                        arguments: [
                            {
                                name: 'id',
                                source: { path: 0 },
                                optional: false,
                                type: 'string',
                                description: 'Entity id'
                            }
                        ]
                    }
                },
                actions: {},
                targetedActions: {}
            }
        };
    };
    /**
    * Retrieve entity data.
    *
    * @param args value with following keys:
    *   _req  Request object provided by express
    *   _res  Response object provided by express js
    *   ... arguments defined by you, see getInitialState()
    * @param callback
    */
    ExampleResource.prototype.retrieveItem = function (args, callback) {
        callback(null, {
            result: {
                "msg": "Hello, world!",
                "requestedEntityId": args.id
            }
        });
    };
    return ExampleResource;
}(rest_services_1.Resource));
exports["default"] = ExampleResource;
