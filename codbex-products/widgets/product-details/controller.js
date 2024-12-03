angular.module('product-details', ['ideUI', 'ideView'])
    .controller('ProductDetailsController', ['$scope', '$http', '$document', function ($scope, $http, $document) {
        angular.element($document[0]).ready(async function () {
            const productData = await getProductData();
            // Doughnut Chart Data
            const doughnutData = {
                labels: ['Active Products', 'Inactive Products'],
                datasets: [{
                    data: [productData.ActiveProducts, productData.InactiveProducts],
                    backgroundColor: ['#36a2eb', '#ff6384']
                }]
            };

            // Doughnut Chart Configuration
            const doughnutOptions = {
                responsive: true,
                maintainAspectRatio: false,
                legend: {
                    position: 'bottom'
                },
                title: {
                    display: true,
                    text: 'Product Status'
                },
                animation: {
                    animateScale: true,
                    animateRotate: true
                }
            };
            // Initialize Doughnut Chart
            const doughnutChartCtx = $document[0].getElementById('doughnutChart').getContext('2d');
            const doughnutChart = new Chart(doughnutChartCtx, {
                type: 'doughnut',
                data: doughnutData,
                options: doughnutOptions
            });
            $scope.$apply(function () {
                $scope.state.isBusy = false;
            });
        });

        const productServiceUrl = "/services/ts/codbex-products/widgets/api/ProductService.ts/productData";
        $http.get(productServiceUrl)
            .then(function (response) {
                $scope.ProductData = response.data;
            });

        async function getProductData() {
            try {
                const response = await $http.get("/services/ts/codbex-products/widgets/api/ProductService.ts/productData");
                return response.data;
            } catch (error) {
                console.error('Error fetching product data:', error);
            }
        }

    }]);