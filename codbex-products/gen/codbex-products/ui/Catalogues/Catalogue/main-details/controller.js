angular.module('page', ["ideUI", "ideView", "entityApi"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-products.Catalogues.Catalogue';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/ts/codbex-products/gen/codbex-products/api/Catalogues/CatalogueService.ts";
	}])
	.controller('PageController', ['$scope', 'Extensions', 'messageHub', 'entityApi', function ($scope, Extensions, messageHub, entityApi) {

		$scope.entity = {};
		$scope.forms = {
			details: {},
		};
		$scope.formHeaders = {
			select: "Catalogue Details",
			create: "Create Catalogue",
			update: "Update Catalogue"
		};
		$scope.action = 'select';

		//-----------------Custom Actions-------------------//
		Extensions.get('dialogWindow', 'codbex-products-custom-action').then(function (response) {
			$scope.entityActions = response.filter(e => e.perspective === "Catalogues" && e.view === "Catalogue" && e.type === "entity");
		});

		$scope.triggerEntityAction = function (action) {
			messageHub.showDialogWindow(
				action.id,
				{
					id: $scope.entity.Id
				},
				null,
				true,
				action
			);
		};
		//-----------------Custom Actions-------------------//

		//-----------------Events-------------------//
		messageHub.onDidReceiveMessage("clearDetails", function (msg) {
			$scope.$apply(function () {
				$scope.entity = {};
				$scope.optionsProduct = [];
				$scope.optionsStore = [];
				$scope.optionsBaseUnit = [];
				$scope.action = 'select';
			});
		});

		messageHub.onDidReceiveMessage("entitySelected", function (msg) {
			$scope.$apply(function () {
				$scope.entity = msg.data.entity;
				$scope.optionsProduct = msg.data.optionsProduct;
				$scope.optionsStore = msg.data.optionsStore;
				$scope.optionsBaseUnit = msg.data.optionsBaseUnit;
				$scope.action = 'select';
			});
		});

		messageHub.onDidReceiveMessage("createEntity", function (msg) {
			$scope.$apply(function () {
				$scope.entity = {};
				$scope.optionsProduct = msg.data.optionsProduct;
				$scope.optionsStore = msg.data.optionsStore;
				$scope.optionsBaseUnit = msg.data.optionsBaseUnit;
				$scope.action = 'create';
			});
		});

		messageHub.onDidReceiveMessage("updateEntity", function (msg) {
			$scope.$apply(function () {
				$scope.entity = msg.data.entity;
				$scope.optionsProduct = msg.data.optionsProduct;
				$scope.optionsStore = msg.data.optionsStore;
				$scope.optionsBaseUnit = msg.data.optionsBaseUnit;
				$scope.action = 'update';
			});
		});

		$scope.serviceProduct = "/services/ts/codbex-products/gen/codbex-products/api/Products/ProductService.ts";
		$scope.serviceStore = "/services/ts/codbex-inventory/gen/codbex-inventory/api/Stores/StoreService.ts";
		$scope.serviceBaseUnit = "/services/ts/codbex-uoms/gen/codbex-uoms/api/UnitsOfMeasures/UoMService.ts";

		//-----------------Events-------------------//

		$scope.create = function () {
			entityApi.create($scope.entity).then(function (response) {
				if (response.status != 201) {
					messageHub.showAlertError("Catalogue", `Unable to create Catalogue: '${response.message}'`);
					return;
				}
				messageHub.postMessage("entityCreated", response.data);
				messageHub.postMessage("clearDetails", response.data);
				messageHub.showAlertSuccess("Catalogue", "Catalogue successfully created");
			});
		};

		$scope.update = function () {
			entityApi.update($scope.entity.Id, $scope.entity).then(function (response) {
				if (response.status != 200) {
					messageHub.showAlertError("Catalogue", `Unable to update Catalogue: '${response.message}'`);
					return;
				}
				messageHub.postMessage("entityUpdated", response.data);
				messageHub.postMessage("clearDetails", response.data);
				messageHub.showAlertSuccess("Catalogue", "Catalogue successfully updated");
			});
		};

		$scope.cancel = function () {
			messageHub.postMessage("clearDetails");
		};

	}]);