angular.module('page', ['blimpKit', 'platformView', 'platformLocale']).controller('PageController', ($scope, ViewParameters) => {
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
		$scope.optionsProduct = params.optionsProduct;
		$scope.optionsGroup = params.optionsGroup;
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
		if (entity.Product !== undefined) {
			filter.$filter.equals.Product = entity.Product;
		}
		if (entity.Name) {
			filter.$filter.contains.Name = entity.Name;
		}
		if (entity.Value) {
			filter.$filter.contains.Value = entity.Value;
		}
		if (entity.Group !== undefined) {
			filter.$filter.equals.Group = entity.Group;
		}
		Dialogs.postMessage({ topic: 'codbex-products.Products.ProductAttribute.entitySearch', data: {
			entity: entity,
			filter: filter
		}});
		$scope.cancel();
	};

	$scope.resetFilter = () => {
		$scope.entity = {};
		$scope.filter();
	};

	$scope.cancel = () => {
		Dialogs.closeWindow({ id: 'ProductAttribute-filter' });
	};

	$scope.clearErrorMessage = () => {
		$scope.errorMessage = null;
	};
});