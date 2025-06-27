angular.module('page', ['blimpKit', 'platformView', 'EntityService'])
	.config(['EntityServiceProvider', (EntityServiceProvider) => {
		EntityServiceProvider.baseUrl = '/services/ts/codbex-products/gen/codbex-products/api/Products/ProductService.ts';
	}])
	.controller('PageController', ($scope, $http, ViewParameters, EntityService) => {
		const Dialogs = new DialogHub();
		const Notifications = new NotificationHub();
		$scope.entity = {};
		$scope.forms = {
			details: {},
		};
		$scope.formHeaders = {
			select: 'Product Details',
			create: 'Create Product',
			update: 'Update Product'
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
		}

		$scope.create = () => {
			let entity = $scope.entity;
			entity[$scope.selectedMainEntityKey] = $scope.selectedMainEntityId;
			EntityService.create(entity).then((response) => {
				Dialogs.postMessage({ topic: 'codbex-products.Products.Product.entityCreated', data: response.data });
				Notifications.show({
					title: 'Product',
					description: 'Product successfully created',
					type: 'positive'
				});
				$scope.cancel();
			}, (error) => {
				const message = error.data ? error.data.message : '';
				$scope.$evalAsync(() => {
					$scope.errorMessage = `Unable to create Product: '${message}'`;
				});
				console.error('EntityService:', error);
			});
		};

		$scope.update = () => {
			let id = $scope.entity.Id;
			let entity = $scope.entity;
			entity[$scope.selectedMainEntityKey] = $scope.selectedMainEntityId;
			EntityService.update(id, entity).then((response) => {
				Dialogs.postMessage({ topic: 'codbex-products.Products.Product.entityUpdated', data: response.data });
				$scope.cancel();
				Notifications.show({
					title: 'Product',
					description: 'Product successfully updated',
					type: 'positive'
				});
			}, (error) => {
				const message = error.data ? error.data.message : '';
				$scope.$evalAsync(() => {
					$scope.errorMessage = `Unable to update Product: '${message}'`;
				});
				console.error('EntityService:', error);
			});
		};

		$scope.serviceBaseUnit = '/services/ts/codbex-uoms/gen/codbex-uoms/api/Settings/UoMService.ts';
		
		$scope.optionsBaseUnit = [];
		
		$http.get('/services/ts/codbex-uoms/gen/codbex-uoms/api/Settings/UoMService.ts').then((response) => {
			$scope.optionsBaseUnit = response.data.map(e => ({
				value: e.Id,
				text: e.Name
			}));
		}, (error) => {
			console.error(error);
			const message = error.data ? error.data.message : '';
			Dialogs.showAlert({
				title: 'BaseUnit',
				message: `Unable to load data: '${message}'`,
				type: AlertTypes.Error
			});
		});
		$scope.serviceType = '/services/ts/codbex-products/gen/codbex-products/api/Settings/ProductTypeService.ts';
		
		$scope.optionsType = [];
		
		$http.get('/services/ts/codbex-products/gen/codbex-products/api/Settings/ProductTypeService.ts').then((response) => {
			$scope.optionsType = response.data.map(e => ({
				value: e.Id,
				text: e.Name
			}));
		}, (error) => {
			console.error(error);
			const message = error.data ? error.data.message : '';
			Dialogs.showAlert({
				title: 'Type',
				message: `Unable to load data: '${message}'`,
				type: AlertTypes.Error
			});
		});
		$scope.serviceCategory = '/services/ts/codbex-products/gen/codbex-products/api/Settings/ProductCategoryService.ts';
		
		$scope.optionsCategory = [];
		
		$http.get('/services/ts/codbex-products/gen/codbex-products/api/Settings/ProductCategoryService.ts').then((response) => {
			$scope.optionsCategory = response.data.map(e => ({
				value: e.Id,
				text: e.Name
			}));
		}, (error) => {
			console.error(error);
			const message = error.data ? error.data.message : '';
			Dialogs.showAlert({
				title: 'Category',
				message: `Unable to load data: '${message}'`,
				type: AlertTypes.Error
			});
		});
		$scope.serviceManufacturer = '/services/ts/codbex-partners/gen/codbex-partners/api/Manufacturers/ManufacturerService.ts';
		
		$scope.optionsManufacturer = [];
		
		$http.get('/services/ts/codbex-partners/gen/codbex-partners/api/Manufacturers/ManufacturerService.ts').then((response) => {
			$scope.optionsManufacturer = response.data.map(e => ({
				value: e.Id,
				text: e.Name
			}));
		}, (error) => {
			console.error(error);
			const message = error.data ? error.data.message : '';
			Dialogs.showAlert({
				title: 'Manufacturer',
				message: `Unable to load data: '${message}'`,
				type: AlertTypes.Error
			});
		});

		$scope.alert = (message) => {
			if (message) Dialogs.showAlert({
				title: 'Description',
				message: message,
				type: AlertTypes.Information,
				preformatted: true,
			});
		};

		$scope.cancel = () => {
			$scope.entity = {};
			$scope.action = 'select';
			Dialogs.closeWindow({ id: 'Product-details' });
		};

		$scope.clearErrorMessage = () => {
			$scope.errorMessage = null;
		};
	});