angular.module('page', ["ideUI", "ideView", "entityApi"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-products.products.Product';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/js/codbex-products/gen/api/products/Product.js";
	}])
	.controller('PageController', ['$scope', '$http', 'messageHub', 'entityApi', function ($scope, $http, messageHub, entityApi) {

		$scope.dataPage = 1;
		$scope.dataCount = 0;
		$scope.dataOffset = 0;
		$scope.dataLimit = 10;
		$scope.action = "select";

		function refreshData() {
			$scope.dataReset = true;
			$scope.dataPage--;
		}

		//-----------------Events-------------------//
		messageHub.onDidReceiveMessage("clearDetails", function (msg) {
			$scope.$apply(function () {
				$scope.selectedEntity = null;
				$scope.action = "select";
			});
		});

		messageHub.onDidReceiveMessage("entityCreated", function (msg) {
			refreshData();
			$scope.loadPage();
		});

		messageHub.onDidReceiveMessage("entityUpdated", function (msg) {
			refreshData();
			$scope.loadPage();
		});
		//-----------------Events-------------------//

		$scope.loadPage = function () {
			$scope.selectedEntity = null;
			entityApi.count().then(function (response) {
				if (response.status != 200) {
					messageHub.showAlertError("Product", `Unable to count Product: '${response.message}'`);
					return;
				}
				$scope.dataCount = response.data;
				$scope.dataPages = Math.ceil($scope.dataCount / $scope.dataLimit);
				let offset = ($scope.dataPage - 1) * $scope.dataLimit;
				let limit = $scope.dataLimit;
				if ($scope.dataReset) {
					offset = 0;
					limit = $scope.dataPage * $scope.dataLimit;
				}
				entityApi.list(offset, limit).then(function (response) {
					if (response.status != 200) {
						messageHub.showAlertError("Product", `Unable to list Product: '${response.message}'`);
						return;
					}
					if ($scope.data == null || $scope.dataReset) {
						$scope.data = [];
						$scope.dataReset = false;
					}
					$scope.data = $scope.data.concat(response.data);
					$scope.dataPage++;
				});
			});
		};
		$scope.loadPage($scope.dataPage);

		$scope.selectEntity = function (entity) {
			$scope.selectedEntity = entity;
			messageHub.postMessage("entitySelected", {
				entity: entity,
				selectedMainEntityId: entity.Id,
				optionsProductTypeId: $scope.optionsProductTypeId,
				optionsProductCategoryId: $scope.optionsProductCategoryId,
				optionsUoMId: $scope.optionsUoMId,
			});
		};

		$scope.createEntity = function () {
			$scope.selectedEntity = null;
			$scope.action = "create";

			messageHub.postMessage("createEntity", {
				entity: {},
				optionsProductTypeId: $scope.optionsProductTypeId,
				optionsProductCategoryId: $scope.optionsProductCategoryId,
				optionsUoMId: $scope.optionsUoMId,
			});
		};

		$scope.updateEntity = function () {
			$scope.action = "update";
			messageHub.postMessage("updateEntity", {
				entity: $scope.selectedEntity,
				optionsProductTypeId: $scope.optionsProductTypeId,
				optionsProductCategoryId: $scope.optionsProductCategoryId,
				optionsUoMId: $scope.optionsUoMId,
			});
		};

		$scope.deleteEntity = function () {
			let id = $scope.selectedEntity.Id;
			messageHub.showDialogAsync(
				'Delete Product?',
				`Are you sure you want to delete Product? This action cannot be undone.`,
				[{
					id: "delete-btn-yes",
					type: "emphasized",
					label: "Yes",
				},
				{
					id: "delete-btn-no",
					type: "normal",
					label: "No",
				}],
			).then(function (msg) {
				if (msg.data === "delete-btn-yes") {
					entityApi.delete(id).then(function (response) {
						if (response.status != 204) {
							messageHub.showAlertError("Product", `Unable to delete Product: '${response.message}'`);
							return;
						}
						refreshData();
						$scope.loadPage($scope.dataPage);
						messageHub.postMessage("clearDetails");
					});
				}
			});
		};

		//----------------Dropdowns-----------------//
		$scope.optionsProductTypeId = [];
		$scope.optionsProductCategoryId = [];
		$scope.optionsUoMId = [];

		$http.get("/services/js/codbex-products/gen/api/settings/ProductType.js").then(function (response) {
			$scope.optionsProductTypeId = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Name
				}
			});
		});

		$http.get("/services/js/codbex-products/gen/api/settings/ProductCategory.js").then(function (response) {
			$scope.optionsProductCategoryId = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Name
				}
			});
		});

		$http.get("/services/js/codbex-products/gen/api/entities/UoM.js").then(function (response) {
			$scope.optionsUoMId = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Name
				}
			});
		});
		$scope.optionsProductTypeIdValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsProductTypeId.length; i++) {
				if ($scope.optionsProductTypeId[i].value === optionKey) {
					return $scope.optionsProductTypeId[i].text;
				}
			}
			return null;
		};
		$scope.optionsProductCategoryIdValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsProductCategoryId.length; i++) {
				if ($scope.optionsProductCategoryId[i].value === optionKey) {
					return $scope.optionsProductCategoryId[i].text;
				}
			}
			return null;
		};
		$scope.optionsUoMIdValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsUoMId.length; i++) {
				if ($scope.optionsUoMId[i].value === optionKey) {
					return $scope.optionsUoMId[i].text;
				}
			}
			return null;
		};
		//----------------Dropdowns-----------------//

	}]);
