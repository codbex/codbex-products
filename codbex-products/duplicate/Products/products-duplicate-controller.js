const widgetsView = angular.module('widgets', ['ideUI', 'ideView']);

widgetsView.config(["messageHubProvider", function (messageHubProvider) {
    messageHubProvider.eventIdPrefix = 'codbex-products.Products.Product';
}])

widgetsView.controller('WidgetsViewController', ['$scope', '$http', 'ViewParameters', "messageHub", function ($scope, $http, ViewParameters, messageHub) {
    $scope.submitCopy = function (batch) {
        const params = ViewParameters.get();

        const productUrl = "http://localhost:8080/services/ts/codbex-products/gen/codbex-products/api/Products/ProductService.ts/";

        $http.get(productUrl + params.id)
            .then(function (response) {
                console.log(JSON.stringify(params.data));

                $http.post(productUrl, {
                    Name: response.data.Name,
                    Title: response.data.Title,
                    Model: response.data.Model,
                    Batch: batch,
                    Type: response.data.Type,
                    Category: response.data.Category,
                    BaseUnit: response.data.BaseUnit,
                    Company: response.data.Company,
                    SKU: response.data.SKU,
                    UPC: response.data.UPC,
                    EAN: response.data.EAN,
                    JAN: response.data.JAN,
                    ISBN: response.data.ISBN,
                    MPN: response.data.MPN,
                    Manufacturer: response.data.Manufacturer,
                    Weight: response.data.Weight,
                    Height: response.data.Height,
                    Length: response.data.Length,
                    VAT: response.data.VAT,
                    Enabled: response.data.Enabled
                }).then(function (_) {
                    messageHub.closeDialogWindow('product-duplicate');

                    messageHub.triggerEvent('entityUpdated');
                });
            });
    }
}]);

