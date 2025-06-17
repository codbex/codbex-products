angular.module('product-details', ['blimpKit', 'platformView']).controller('ProductDetailsController', ($scope, $http, $window, $document) => {
    const Shell = new ShellHub();

    $scope.openPerspective = () => {
        if (viewData && viewData.perspectiveId) Shell.showPerspective({ id: viewData.perspectiveId });
    };

    $http.get('/services/ts/codbex-products/widgets/api/ProductService.ts/productData').then((response) => {
        const doughnutData = {
            labels: ['Active Products', 'Inactive Products'],
            datasets: [{
                data: [response.data.ActiveProducts, response.data.InactiveProducts],
                backgroundColor: [
                    $window.getComputedStyle($document[0].documentElement).getPropertyValue('--sapInformativeColor') || '#36a2eb',
                    $window.getComputedStyle($document[0].documentElement).getPropertyValue('--sapNegativeColor') || '#ff6384'
                ]
            }]
        };

        // Doughnut Chart Configuration
        const doughnutOptions = {
            responsive: true,
            aspectRatio: 1,
            maintainAspectRatio: true,
            legend: {
                position: 'bottom'
            },
            animation: {
                animateScale: true,
                animateRotate: true
            }
        };
        // Initialize Doughnut Chart
        const doughnutChartCtx = $document[0].getElementById('doughnutChart').getContext('2d');
        Chart.defaults.color = $window.getComputedStyle($document[0].documentElement).getPropertyValue('--sapTextColor') || '#666';
        new Chart(doughnutChartCtx, {
            type: 'doughnut',
            data: doughnutData,
            options: doughnutOptions
        });
        $scope.$evalAsync(() => {
            $scope.ActiveCategories = response.data.ActiveCategories;
            $scope.AllProducts = response.data.AllProducts;
        });
    }, (error) => {
        console.error(error);
    });

});