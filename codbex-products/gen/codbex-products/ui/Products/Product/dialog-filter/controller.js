angular.module('page', ['blimpKit', 'platformView']).controller('PageController', ($scope, ViewParameters) => {
	const Dialogs = new DialogHub();
	$scope.entity = {};
	$scope.forms = {
		details: {},
	};

	let params = ViewParameters.get();
	if (Object.keys(params).length) {
		$scope.entity = params.entity ?? {};
		$scope.selectedMainEntityKey = params.selectedMainEntityKey;
		$scope.selectedMainEntityId = params.selectedMainEntityId;
		$scope.optionsBaseUnit = params.optionsBaseUnit;
		$scope.optionsType = params.optionsType;
		$scope.optionsCategory = params.optionsCategory;
		$scope.optionsManufacturer = params.optionsManufacturer;
		$scope.optionsCompany = params.optionsCompany;
	}

	$scope.filter = () => {
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
		if (entity.SKU) {
			filter.$filter.contains.SKU = entity.SKU;
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
		if (entity.BaseUnit !== undefined) {
			filter.$filter.equals.BaseUnit = entity.BaseUnit;
		}
		if (entity.Price !== undefined) {
			filter.$filter.equals.Price = entity.Price;
		}
		if (entity.VATRate !== undefined) {
			filter.$filter.equals.VATRate = entity.VATRate;
		}
		if (entity.Type !== undefined) {
			filter.$filter.equals.Type = entity.Type;
		}
		if (entity.Category !== undefined) {
			filter.$filter.equals.Category = entity.Category;
		}
		if (entity.Manufacturer !== undefined) {
			filter.$filter.equals.Manufacturer = entity.Manufacturer;
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
		if (entity.Name) {
			filter.$filter.contains.Name = entity.Name;
		}
		if (entity.Company !== undefined) {
			filter.$filter.equals.Company = entity.Company;
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
		if (entity.Enabled !== undefined && entity.isEnabledIndeterminate === false) {
			filter.$filter.equals.Enabled = entity.Enabled;
		}
		Dialogs.postMessage({ topic: 'codbex-products.Products.Product.entitySearch', data: {
			entity: entity,
			filter: filter
		}});
		Dialogs.triggerEvent('codbex-products.Products.Product.clearDetails');
		$scope.cancel();
	};

	$scope.resetFilter = () => {
		$scope.entity = {};
		$scope.filter();
	};

	$scope.cancel = () => {
		Dialogs.closeWindow({ id: 'Product-filter' });
	};

	$scope.clearErrorMessage = () => {
		$scope.errorMessage = null;
	};
});