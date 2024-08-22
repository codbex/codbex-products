angular.module('page', ["ideUI", "ideView"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-products.Products.Product';
	}])
	.controller('PageController', ['$scope', 'messageHub', 'ViewParameters', function ($scope, messageHub, ViewParameters) {

		$scope.entity = {};
		$scope.forms = {
			details: {},
		};

		let params = ViewParameters.get();
		if (Object.keys(params).length) {
			$scope.entity = params.entity ?? {};
			$scope.selectedMainEntityKey = params.selectedMainEntityKey;
			$scope.selectedMainEntityId = params.selectedMainEntityId;
			$scope.optionsType = params.optionsType;
			$scope.optionsCategory = params.optionsCategory;
			$scope.optionsBaseUnit = params.optionsBaseUnit;
			$scope.optionsCompany = params.optionsCompany;
			$scope.optionsManufacturer = params.optionsManufacturer;
			$scope.optionsSet = params.optionsSet;
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
			if (entity.Id !== undefined) {
				filter.$filter.equals.Id = entity.Id;
			}
			if (entity.Name) {
				filter.$filter.contains.Name = entity.Name;
			}
			if (entity.Title) {
				filter.$filter.contains.Title = entity.Title;
			}
			if (entity.Model) {
				filter.$filter.contains.Model = entity.Model;
			}
			if (entity.Batch) {
				filter.$filter.contains.Batch = entity.Batch;
			}
			if (entity.Type !== undefined) {
				filter.$filter.equals.Type = entity.Type;
			}
			if (entity.Category !== undefined) {
				filter.$filter.equals.Category = entity.Category;
			}
			if (entity.BaseUnit) {
				filter.$filter.contains.BaseUnit = entity.BaseUnit;
			}
			if (entity.Company !== undefined) {
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
			if (entity.Manufacturer !== undefined) {
				filter.$filter.equals.Manufacturer = entity.Manufacturer;
			}
			if (entity.VAT !== undefined) {
				filter.$filter.equals.VAT = entity.VAT;
			}
			if (entity.Set !== undefined) {
				filter.$filter.equals.Set = entity.Set;
			}
			if (entity.Weight !== undefined) {
				filter.$filter.equals.Weight = entity.Weight;
			}
			if (entity.Height !== undefined) {
				filter.$filter.equals.Height = entity.Height;
			}
			if (entity.Length !== undefined) {
				filter.$filter.equals.Length = entity.Length;
			}
			if (entity.Width !== undefined) {
				filter.$filter.equals.Width = entity.Width;
			}
			if (entity.Enabled !== undefined && entity.isEnabledIndeterminate === false) {
				filter.$filter.equals.Enabled = entity.Enabled;
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