const widgetsView = angular.module('widgets', ['ideUI', 'ideView']);

widgetsView.config(["messageHubProvider", function (messageHubProvider) {
    messageHubProvider.eventIdPrefix = 'template';
}]);

widgetsView.controller('WidgetsViewController', ['$scope', 'messageHub', function ($scope, messageHub) {
}]);