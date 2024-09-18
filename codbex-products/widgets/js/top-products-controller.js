angular.module('top-products', ['ideUI', 'ideView'])
    .controller('TopProductsController', ['$scope', '$http', '$document', function ($scope, $http, $document) {
        async function getProductData() {
            try {
                const response = await $http.get("/services/ts/codbex-products/widgets/api/ProductService.ts/productData");
                return response.data;
            } catch (error) {
                console.error('Error fetching product data:', error);
            }
        }
        angular.element($document[0]).ready(async function () {
            const productData = await getProductData();
            $scope.$apply(function () {
                $scope.topProductsByUnits = productData.TopProductsByUnits;
                $scope.topProductsByRevenue = productData.TopProductsByRevenue;
                $scope.displayedProducts = $scope.topProductsByUnits; // Default display
            });
        });

        $scope.displayByUnits = function () {
            $scope.displayedProducts = $scope.topProductsByUnits;
        };

        $scope.displayByRevenue = function () {
            $scope.displayedProducts = $scope.topProductsByRevenue;
        };
    }]);
