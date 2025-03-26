angular.module('page', ["ideUI", "ideView", "entityApi"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-products.Products.Product';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/ts/codbex-products/gen/codbex-products/api/Products/ProductService.ts";
	}])
	.controller('PageController', ['$scope',  '$http', 'messageHub', 'ViewParameters', 'entityApi', function ($scope,  $http, messageHub, ViewParameters, entityApi) {

		$scope.entity = {};
		$scope.forms = {
			details: {},
		};
		$scope.formHeaders = {
			select: "Product Details",
			create: "Create Product",
			update: "Update Product"
		};
		$scope.action = 'select';

		let params = ViewParameters.get();
		if (Object.keys(params).length) {
			$scope.action = params.action;
			$scope.entity = params.entity;
			$scope.selectedMainEntityKey = params.selectedMainEntityKey;
			$scope.selectedMainEntityId = params.selectedMainEntityId;
			$scope.optionsBaseUnit = params.optionsBaseUnit;
			$scope.optionsType = params.optionsType;
			$scope.optionsCategory = params.optionsCategory;
			$scope.optionsManufacturer = params.optionsManufacturer;
			$scope.optionsCompany = params.optionsCompany;
		}

		$scope.create = function () {
			let entity = $scope.entity;
			entity[$scope.selectedMainEntityKey] = $scope.selectedMainEntityId;
			entityApi.create(entity).then(function (response) {
				if (response.status != 201) {
					$scope.errorMessage = `Unable to create Product: '${response.message}'`;
					return;
				}
				messageHub.postMessage("entityCreated", response.data);
				$scope.cancel();
				messageHub.showAlertSuccess("Product", "Product successfully created");
			});
		};

		$scope.update = function () {
			let id = $scope.entity.Id;
			let entity = $scope.entity;
			entity[$scope.selectedMainEntityKey] = $scope.selectedMainEntityId;
			entityApi.update(id, entity).then(function (response) {
				if (response.status != 200) {
					$scope.errorMessage = `Unable to update Product: '${response.message}'`;
					return;
				}
				messageHub.postMessage("entityUpdated", response.data);
				$scope.cancel();
				messageHub.showAlertSuccess("Product", "Product successfully updated");
			});
		};

		$scope.serviceBaseUnit = "/services/ts/codbex-uoms/gen/codbex-uoms/api/UnitsOfMeasures/UoMService.ts";
		
		$scope.optionsBaseUnit = [];
		
		$http.get("/services/ts/codbex-uoms/gen/codbex-uoms/api/UnitsOfMeasures/UoMService.ts").then(function (response) {
			$scope.optionsBaseUnit = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Name
				}
			});
		});
		$scope.serviceType = "/services/ts/codbex-products/gen/codbex-products/api/Settings/ProductTypeService.ts";
		
		$scope.optionsType = [];
		
		$http.get("/services/ts/codbex-products/gen/codbex-products/api/Settings/ProductTypeService.ts").then(function (response) {
			$scope.optionsType = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Name
				}
			});
		});
		$scope.serviceCategory = "/services/ts/codbex-products/gen/codbex-products/api/Categories/ProductCategoryService.ts";
		
		$scope.optionsCategory = [];
		
		$http.get("/services/ts/codbex-products/gen/codbex-products/api/Categories/ProductCategoryService.ts").then(function (response) {
			$scope.optionsCategory = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Name
				}
			});
		});
		$scope.serviceManufacturer = "/services/ts/codbex-partners/gen/codbex-partners/api/Manufacturers/ManufacturerService.ts";
		
		$scope.optionsManufacturer = [];
		
		$http.get("/services/ts/codbex-partners/gen/codbex-partners/api/Manufacturers/ManufacturerService.ts").then(function (response) {
			$scope.optionsManufacturer = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Name
				}
			});
		});
		$scope.serviceCompany = "/services/ts/codbex-companies/gen/codbex-companies/api/Companies/CompanyService.ts";
		
		$scope.optionsCompany = [];
		
		$http.get("/services/ts/codbex-companies/gen/codbex-companies/api/Companies/CompanyService.ts").then(function (response) {
			$scope.optionsCompany = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Name
				}
			});
		});

		$scope.cancel = function () {
			$scope.entity = {};
			$scope.action = 'select';
			messageHub.closeDialogWindow("Product-details");
		};

		$scope.clearErrorMessage = function () {
			$scope.errorMessage = null;
		};

	}]);