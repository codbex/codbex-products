angular.module('page', ["ideUI", "ideView", "entityApi"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-products.Products.Product';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/ts/codbex-products/gen/api/Products/ProductService.ts";
	}])
	.controller('PageController', ['$scope', '$http', 'messageHub', 'entityApi', function ($scope, $http, messageHub, entityApi) {

		$scope.dataPage = 1;
		$scope.dataCount = 0;
		$scope.dataOffset = 0;
		$scope.dataLimit = 10;
		$scope.action = "select";

		//-----------------Custom Actions-------------------//
		$http.get("/services/js/resources-core/services/custom-actions.js?extensionPoint=codbex-products-custom-action").then(function (response) {
			$scope.pageActions = response.data.filter(e => e.perspective === "Products" && e.view === "Product" && (e.type === "page" || e.type === undefined));
		});

		$scope.triggerPageAction = function (actionId) {
			for (const next of $scope.pageActions) {
				if (next.id === actionId) {
					messageHub.showDialogWindow("codbex-products-custom-action", {
						src: next.link,
					});
					break;
				}
			}
		};
		//-----------------Custom Actions-------------------//

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
				optionsType: $scope.optionsType,
				optionsCategory: $scope.optionsCategory,
				optionsBaseUnit: $scope.optionsBaseUnit,
				optionsCompany: $scope.optionsCompany,
				optionsManufacturer: $scope.optionsManufacturer,
			});
		};

		$scope.createEntity = function () {
			$scope.selectedEntity = null;
			$scope.action = "create";

			messageHub.postMessage("createEntity", {
				entity: {},
				optionsType: $scope.optionsType,
				optionsCategory: $scope.optionsCategory,
				optionsBaseUnit: $scope.optionsBaseUnit,
				optionsCompany: $scope.optionsCompany,
				optionsManufacturer: $scope.optionsManufacturer,
			});
		};

		$scope.updateEntity = function () {
			$scope.action = "update";
			messageHub.postMessage("updateEntity", {
				entity: $scope.selectedEntity,
				optionsType: $scope.optionsType,
				optionsCategory: $scope.optionsCategory,
				optionsBaseUnit: $scope.optionsBaseUnit,
				optionsCompany: $scope.optionsCompany,
				optionsManufacturer: $scope.optionsManufacturer,
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
		$scope.optionsType = [];
		$scope.optionsCategory = [];
		$scope.optionsBaseUnit = [];
		$scope.optionsCompany = [];
		$scope.optionsManufacturer = [];

		$http.get("/services/ts/codbex-products/gen/api/Settings/ProductTypeService.ts").then(function (response) {
			$scope.optionsType = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Name
				}
			});
		});

		$http.get("/services/ts/codbex-products/gen/api/Categories/ProductCategoryService.ts").then(function (response) {
			$scope.optionsCategory = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Name
				}
			});
		});

		$http.get("/services/ts/codbex-products/gen/api/entities/UoMService.ts").then(function (response) {
			$scope.optionsBaseUnit = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Name
				}
			});
		});

		$http.get("/services/ts/codbex-products/gen/api/Companies/CompanyService.ts").then(function (response) {
			$scope.optionsCompany = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Name
				}
			});
		});

		$http.get("/services/ts/codbex-products/gen/api/Manufacturers/ManufacturerService.ts").then(function (response) {
			$scope.optionsManufacturer = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Name
				}
			});
		});
		$scope.optionsTypeValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsType.length; i++) {
				if ($scope.optionsType[i].value === optionKey) {
					return $scope.optionsType[i].text;
				}
			}
			return null;
		};
		$scope.optionsCategoryValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsCategory.length; i++) {
				if ($scope.optionsCategory[i].value === optionKey) {
					return $scope.optionsCategory[i].text;
				}
			}
			return null;
		};
		$scope.optionsBaseUnitValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsBaseUnit.length; i++) {
				if ($scope.optionsBaseUnit[i].value === optionKey) {
					return $scope.optionsBaseUnit[i].text;
				}
			}
			return null;
		};
		$scope.optionsCompanyValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsCompany.length; i++) {
				if ($scope.optionsCompany[i].value === optionKey) {
					return $scope.optionsCompany[i].text;
				}
			}
			return null;
		};
		$scope.optionsManufacturerValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsManufacturer.length; i++) {
				if ($scope.optionsManufacturer[i].value === optionKey) {
					return $scope.optionsManufacturer[i].text;
				}
			}
			return null;
		};
		//----------------Dropdowns-----------------//

	}]);
