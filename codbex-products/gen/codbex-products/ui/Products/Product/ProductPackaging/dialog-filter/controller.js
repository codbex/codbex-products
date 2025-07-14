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
		if (entity.Ratio !== undefined) {
			filter.$filter.equals.Ratio = entity.Ratio;
		}
		if (entity.Name) {
			filter.$filter.contains.Name = entity.Name;
		}
		Dialogs.postMessage({ topic: 'codbex-products.Products.ProductPackaging.entitySearch', data: {
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
		Dialogs.closeWindow({ id: 'ProductPackaging-filter' });
	};

	$scope.clearErrorMessage = () => {
		$scope.errorMessage = null;
	};
});