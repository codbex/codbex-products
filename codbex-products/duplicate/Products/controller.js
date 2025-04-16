angular.module('productsDup', ['blimpKit', 'platformView']).controller('ProductsDupViewController', ($scope, $http, ViewParameters) => {
    const Dialogs = new DialogHub();
    const params = ViewParameters.get();
    const productUrl = '/services/ts/codbex-products/gen/codbex-products/api/Products/ProductService.ts/';

    $scope.submitCopy = (batch) => {
        $http.get(productUrl + params.id).then((response) => {
            $http.post(productUrl, {
                ...response.data,
                Batch: batch
            }).then(() => {
                Dialogs.closeWindow({ id: 'product-duplicate' });
                Dialogs.triggerEvent('codbex-products.Products.Product.entityUpdated');
            }, (error) => {
                console.error(error);
            });
        }, (error) => {
            console.error(error);
        });
    };
});