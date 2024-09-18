angular.module('inventory-accuracy', ['ideUI', 'ideView'])
    .controller('InventoryAccuracyController', ['$scope', function ($scope) {
        $scope.today = new Date()
    }]);
