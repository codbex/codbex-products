angular.module('page', ["ideUI", "ideView", "entityApi"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-products.Products.Product';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/ts/codbex-products/gen/codbex-products/api/Products/ProductService.ts";
	}])
	.controller('PageController', ['$scope',  '$http', 'Extensions', 'messageHub', 'entityApi', function ($scope,  $http, Extensions, messageHub, entityApi) {

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

		//-----------------Custom Actions-------------------//
		Extensions.get('dialogWindow', 'codbex-products-custom-action').then(function (response) {
			$scope.entityActions = response.filter(e => e.perspective === "Products" && e.view === "Product" && e.type === "entity");
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
				$scope.optionsBaseUnit = [];
				$scope.optionsType = [];
				$scope.optionsCategory = [];
				$scope.optionsManufacturer = [];
				$scope.optionsCompany = [];
				$scope.action = 'select';
			});
		});

		messageHub.onDidReceiveMessage("entitySelected", function (msg) {
			$scope.$apply(function () {
				$scope.entity = msg.data.entity;
				$scope.optionsBaseUnit = msg.data.optionsBaseUnit;
				$scope.optionsType = msg.data.optionsType;
				$scope.optionsCategory = msg.data.optionsCategory;
				$scope.optionsManufacturer = msg.data.optionsManufacturer;
				$scope.optionsCompany = msg.data.optionsCompany;
				$scope.action = 'select';
			});
		});

		messageHub.onDidReceiveMessage("createEntity", function (msg) {
			$scope.$apply(function () {
				$scope.entity = {};
				$scope.optionsBaseUnit = msg.data.optionsBaseUnit;
				$scope.optionsType = msg.data.optionsType;
				$scope.optionsCategory = msg.data.optionsCategory;
				$scope.optionsManufacturer = msg.data.optionsManufacturer;
				$scope.optionsCompany = msg.data.optionsCompany;
				$scope.action = 'create';
			});
		});

		messageHub.onDidReceiveMessage("updateEntity", function (msg) {
			$scope.$apply(function () {
				$scope.entity = msg.data.entity;
				$scope.optionsBaseUnit = msg.data.optionsBaseUnit;
				$scope.optionsType = msg.data.optionsType;
				$scope.optionsCategory = msg.data.optionsCategory;
				$scope.optionsManufacturer = msg.data.optionsManufacturer;
				$scope.optionsCompany = msg.data.optionsCompany;
				$scope.action = 'update';
			});
		});

		$scope.serviceBaseUnit = "/services/ts/codbex-uoms/gen/codbex-uoms/api/UnitsOfMeasures/UoMService.ts";
		$scope.serviceType = "/services/ts/codbex-products/gen/codbex-products/api/Settings/ProductTypeService.ts";
		$scope.serviceCategory = "/services/ts/codbex-products/gen/codbex-products/api/Categories/ProductCategoryService.ts";
		$scope.serviceManufacturer = "/services/ts/codbex-partners/gen/codbex-partners/api/Manufacturers/ManufacturerService.ts";
		$scope.serviceCompany = "/services/ts/codbex-companies/gen/codbex-companies/api/Companies/CompanyService.ts";

		//-----------------Events-------------------//

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
		
		//-----------------Dialogs-------------------//
		
		$scope.createBaseUnit = function () {
			messageHub.showDialogWindow("UoM-details", {
				action: "create",
				entity: {},
			}, null, false);
		};
		$scope.createType = function () {
			messageHub.showDialogWindow("ProductType-details", {
				action: "create",
				entity: {},
			}, null, false);
		};
		$scope.createCategory = function () {
			messageHub.showDialogWindow("ProductCategory-details", {
				action: "create",
				entity: {},
			}, null, false);
		};
		$scope.createManufacturer = function () {
			messageHub.showDialogWindow("Manufacturer-details", {
				action: "create",
				entity: {},
			}, null, false);
		};
		$scope.createCompany = function () {
			messageHub.showDialogWindow("Company-details", {
				action: "create",
				entity: {},
			}, null, false);
		};

		//-----------------Dialogs-------------------//



		//----------------Dropdowns-----------------//

		$scope.refreshBaseUnit = function () {
			$scope.optionsBaseUnit = [];
			$http.get("/services/ts/codbex-uoms/gen/codbex-uoms/api/UnitsOfMeasures/UoMService.ts").then(function (response) {
				$scope.optionsBaseUnit = response.data.map(e => {
					return {
						value: e.Id,
						text: e.Name
					}
				});
			});
		};
		$scope.refreshType = function () {
			$scope.optionsType = [];
			$http.get("/services/ts/codbex-products/gen/codbex-products/api/Settings/ProductTypeService.ts").then(function (response) {
				$scope.optionsType = response.data.map(e => {
					return {
						value: e.Id,
						text: e.Name
					}
				});
			});
		};
		$scope.refreshCategory = function () {
			$scope.optionsCategory = [];
			$http.get("/services/ts/codbex-products/gen/codbex-products/api/Categories/ProductCategoryService.ts").then(function (response) {
				$scope.optionsCategory = response.data.map(e => {
					return {
						value: e.Id,
						text: e.Name
					}
				});
			});
		};
		$scope.refreshManufacturer = function () {
			$scope.optionsManufacturer = [];
			$http.get("/services/ts/codbex-partners/gen/codbex-partners/api/Manufacturers/ManufacturerService.ts").then(function (response) {
				$scope.optionsManufacturer = response.data.map(e => {
					return {
						value: e.Id,
						text: e.Name
					}
				});
			});
		};
		$scope.refreshCompany = function () {
			$scope.optionsCompany = [];
			$http.get("/services/ts/codbex-companies/gen/codbex-companies/api/Companies/CompanyService.ts").then(function (response) {
				$scope.optionsCompany = response.data.map(e => {
					return {
						value: e.Id,
						text: e.Name
					}
				});
			});
		};

		//----------------Dropdowns-----------------//	
		

	}]);