System.register("server", ["node_modules/express/lib/express", "node_modules/rest-services/lib/restServices", "example-resource"], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var express_1, restServices_1, example_resource_1, app, config, services, server;
    return {
        setters: [
            function (express_1_1) {
                express_1 = express_1_1;
            },
            function (restServices_1_1) {
                restServices_1 = restServices_1_1;
            },
            function (example_resource_1_1) {
                example_resource_1 = example_resource_1_1;
            }
        ],
        execute: function () {
            app = express_1["default"]();
            // We define our example service with one resource "ExampleResource" 
            config = {
                services: [
                    {
                        serviceName: "example",
                        serviceLabel: "Example API",
                        servicePath: "api",
                        resources: [
                            example_resource_1["default"]
                        ]
                    }
                ]
            };
            services = new restServices_1.RestServices(config);
            services.mount(app);
            server = app.listen(3000, function () {
                var host = server.address().address;
                var port = server.address().port;
                console.info("==> Listening " + host + " on port " + port + ".");
            });
        }
    };
});
