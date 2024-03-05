angular.module('page', ["ideUI", "ideView", "entityApi"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-products.Products.Product';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/ts/codbex-products/gen/api/Products/ProductService.ts";
	}])
	.controller('PageController', ['$scope', 'messageHub', 'entityApi', function ($scope, messageHub, entityApi) {

		$scope.entity = {};
		$scope.forms = {
			details: {},
		};

		if (window != null && window.frameElement != null && window.frameElement.hasAttribute("data-parameters")) {
			let dataParameters = window.frameElement.getAttribute("data-parameters");
			if (dataParameters) {
				let params = JSON.parse(dataParameters);
				$scope.entity = params.entity ?? {};
				$scope.selectedMainEntityKey = params.selectedMainEntityKey;
				$scope.selectedMainEntityId = params.selectedMainEntityId;
				$scope.optionsType = params.optionsType;
				$scope.optionsCategory = params.optionsCategory;
				$scope.optionsBaseUnit = params.optionsBaseUnit;
				$scope.optionsCompany = params.optionsCompany;
				$scope.optionsManufacturer = params.optionsManufacturer;
			}
		}

		$scope.filter = function () {
			let entity = $scope.entity;
			const filter = {
				$filter: {
					equals: {
					},
					notEquals: {
					},
					contains: {
					},
					greaterThan: {
					},
					greaterThanOrEqual: {
					},
					lessThan: {
					},
					lessThanOrEqual: {
					}
				},
			};
			if (entity.Id) {
				filter.$filter.equals.Id = entity.Id;
			}
			if (entity.Name) {
				filter.$filter.contains.Name = entity.Name;
			}
			if (entity.Type) {
				filter.$filter.equals.Type = entity.Type;
			}
			if (entity.Category) {
				filter.$filter.equals.Category = entity.Category;
			}
			if (entity.BaseUnit) {
				filter.$filter.equals.BaseUnit = entity.BaseUnit;
			}
			if (entity.Model) {
				filter.$filter.contains.Model = entity.Model;
			}
			if (entity.Company) {
				filter.$filter.equals.Company = entity.Company;
			}
			if (entity.SKU) {
				filter.$filter.contains.SKU = entity.SKU;
			}
			if (entity.UPC) {
				filter.$filter.contains.UPC = entity.UPC;
			}
			if (entity.EAN) {
				filter.$filter.contains.EAN = entity.EAN;
			}
			if (entity.JAN) {
				filter.$filter.contains.JAN = entity.JAN;
			}
			if (entity.ISBN) {
				filter.$filter.contains.ISBN = entity.ISBN;
			}
			if (entity.MPN) {
				filter.$filter.contains.MPN = entity.MPN;
			}
			if (entity.Manufacturer) {
				filter.$filter.equals.Manufacturer = entity.Manufacturer;
			}
			if (entity.Weight) {
				filter.$filter.equals.Weight = entity.Weight;
			}
			if (entity.Height) {
				filter.$filter.equals.Height = entity.Height;
			}
			if (entity.Length) {
				filter.$filter.equals.Length = entity.Length;
			}
			if (entity.VAT) {
				filter.$filter.equals.VAT = entity.VAT;
			}
			messageHub.postMessage("entitySearch", {
				entity: entity,
				filter: filter
			});
			messageHub.postMessage("clearDetails");
			$scope.cancel();
		};

		$scope.resetFilter = function () {
			$scope.entity = {};
			$scope.filter();
		};

		$scope.cancel = function () {
			messageHub.closeDialogWindow("Product-filter");
		};

		$scope.clearErrorMessage = function () {
			$scope.errorMessage = null;
		};

	}]);