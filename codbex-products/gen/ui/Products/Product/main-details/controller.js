angular.module('page', ["ideUI", "ideView", "entityApi"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-products.Products.Product';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/ts/codbex-products/gen/api/Products/ProductService.ts";
	}])
	.controller('PageController', ['$scope', '$http', 'messageHub', 'entityApi', function ($scope, $http, messageHub, entityApi) {

		$scope.entity = {};
		$scope.formHeaders = {
			select: "Product Details",
			create: "Create Product",
			update: "Update Product"
		};
		$scope.formErrors = {};
		$scope.action = 'select';

		//-----------------Custom Actions-------------------//
		$http.get("/services/js/resources-core/services/custom-actions.js?extensionPoint=codbex-products-custom-action").then(function (response) {
			$scope.entityActions = response.data.filter(e => e.perspective === "Products" && e.view === "Product" && e.type === "entity");
		});

		$scope.triggerEntityAction = function (actionId, selectedEntity) {
			for (const next of $scope.entityActions) {
				if (next.id === actionId) {
					messageHub.showDialogWindow("codbex-products-custom-action", {
						src: `${next.link}?id=${$scope.entity.Id}`,
					});
					break;
				}
			}
		};
		//-----------------Custom Actions-------------------//

		//-----------------Events-------------------//
		messageHub.onDidReceiveMessage("clearDetails", function (msg) {
			$scope.$apply(function () {
				$scope.entity = {};
				$scope.formErrors = {};
				$scope.optionsType = [];
				$scope.optionsCategory = [];
				$scope.optionsBaseUnit = [];
				$scope.optionsCompany = [];
				$scope.optionsManufacturer = [];
				$scope.action = 'select';
			});
		});

		messageHub.onDidReceiveMessage("entitySelected", function (msg) {
			$scope.$apply(function () {
				$scope.entity = msg.data.entity;
				$scope.optionsType = msg.data.optionsType;
				$scope.optionsCategory = msg.data.optionsCategory;
				$scope.optionsBaseUnit = msg.data.optionsBaseUnit;
				$scope.optionsCompany = msg.data.optionsCompany;
				$scope.optionsManufacturer = msg.data.optionsManufacturer;
				$scope.action = 'select';
			});
		});

		messageHub.onDidReceiveMessage("createEntity", function (msg) {
			$scope.$apply(function () {
				$scope.entity = {};
				$scope.optionsType = msg.data.optionsType;
				$scope.optionsCategory = msg.data.optionsCategory;
				$scope.optionsBaseUnit = msg.data.optionsBaseUnit;
				$scope.optionsCompany = msg.data.optionsCompany;
				$scope.optionsManufacturer = msg.data.optionsManufacturer;
				$scope.action = 'create';
				// Set Errors for required fields only
				$scope.formErrors = {
				};
			});
		});

		messageHub.onDidReceiveMessage("updateEntity", function (msg) {
			$scope.$apply(function () {
				$scope.entity = msg.data.entity;
				$scope.optionsType = msg.data.optionsType;
				$scope.optionsCategory = msg.data.optionsCategory;
				$scope.optionsBaseUnit = msg.data.optionsBaseUnit;
				$scope.optionsCompany = msg.data.optionsCompany;
				$scope.optionsManufacturer = msg.data.optionsManufacturer;
				$scope.action = 'update';
			});
		});
		//-----------------Events-------------------//

		$scope.isValid = function (isValid, property) {
			$scope.formErrors[property] = !isValid ? true : undefined;
			for (let next in $scope.formErrors) {
				if ($scope.formErrors[next] === true) {
					$scope.isFormValid = false;
					return;
				}
			}
			$scope.isFormValid = true;
		};

		$scope.create = function () {
			entityApi.create($scope.entity).then(function (response) {
				if (response.status != 201) {
					messageHub.showAlertError("Product", `Unable to create Product: '${response.message}'`);
					return;
				}
				messageHub.postMessage("entityCreated", response.data);
				messageHub.postMessage("clearDetails", response.data);
				messageHub.showAlertSuccess("Product", "Product successfully created");
			});
		};

		$scope.update = function () {
			entityApi.update($scope.entity.Id, $scope.entity).then(function (response) {
				if (response.status != 200) {
					messageHub.showAlertError("Product", `Unable to update Product: '${response.message}'`);
					return;
				}
				messageHub.postMessage("entityUpdated", response.data);
				messageHub.postMessage("clearDetails", response.data);
				messageHub.showAlertSuccess("Product", "Product successfully updated");
			});
		};

		$scope.cancel = function () {
			messageHub.postMessage("clearDetails");
		};

	}]);