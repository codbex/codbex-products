angular.module('page', ['blimpKit', 'platformView', 'platformLocale', 'EntityService'])
	.config(["EntityServiceProvider", (EntityServiceProvider) => {
		EntityServiceProvider.baseUrl = '/services/ts/codbex-products/gen/codbex-products/api/Products/ProductService.ts';
	}])
	.controller('PageController', ($scope, $http, Extensions, LocaleService, EntityService) => {
		const Dialogs = new DialogHub();
		const Notifications = new NotificationHub();
		let description = 'Description';
		let propertySuccessfullyCreated = 'Product successfully created';
		let propertySuccessfullyUpdated = 'Product successfully updated';
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

		LocaleService.onInit(() => {
			description = LocaleService.t('codbex-products:defaults.description');
			$scope.formHeaders.select = LocaleService.t('codbex-products:defaults.formHeadSelect', { name: '$t(codbex-products:t.PRODUCT)' });
			$scope.formHeaders.create = LocaleService.t('codbex-products:defaults.formHeadCreate', { name: '$t(codbex-products:t.PRODUCT)' });
			$scope.formHeaders.update = LocaleService.t('codbex-products:defaults.formHeadUpdate', { name: '$t(codbex-products:t.PRODUCT)' });
			propertySuccessfullyCreated = LocaleService.t('codbex-products:messages.propertySuccessfullyCreated', { name: '$t(codbex-products:t.PRODUCT)' });
			propertySuccessfullyUpdated = LocaleService.t('codbex-products:messages.propertySuccessfullyUpdated', { name: '$t(codbex-products:t.PRODUCT)' });
		});

		//-----------------Custom Actions-------------------//
		Extensions.getWindows(['codbex-products-custom-action']).then((response) => {
			$scope.entityActions = response.data.filter(e => e.perspective === 'Products' && e.view === 'Product' && e.type === 'entity');
		});

		$scope.triggerEntityAction = (action) => {
			Dialogs.showWindow({
				hasHeader: true,
        		title: LocaleService.t(action.translation.key, action.translation.options, action.label),
				path: action.path,
				params: {
					id: $scope.entity.Id
				},
				closeButton: true
			});
		};
		//-----------------Custom Actions-------------------//

		//-----------------Events-------------------//
		Dialogs.addMessageListener({ topic: 'codbex-products.Products.Product.clearDetails', handler: () => {
			$scope.$evalAsync(() => {
				$scope.entity = {};
				$scope.optionsCurrency = [];
				$scope.optionsBaseUnit = [];
				$scope.optionsType = [];
				$scope.optionsCategory = [];
				$scope.optionsManufacturer = [];
				$scope.action = 'select';
			});
		}});
		Dialogs.addMessageListener({ topic: 'codbex-products.Products.Product.entitySelected', handler: (data) => {
			$scope.$evalAsync(() => {
				$scope.entity = data.entity;
				$scope.optionsCurrency = data.optionsCurrency;
				$scope.optionsBaseUnit = data.optionsBaseUnit;
				$scope.optionsType = data.optionsType;
				$scope.optionsCategory = data.optionsCategory;
				$scope.optionsManufacturer = data.optionsManufacturer;
				$scope.action = 'select';
			});
		}});
		Dialogs.addMessageListener({ topic: 'codbex-products.Products.Product.createEntity', handler: (data) => {
			$scope.$evalAsync(() => {
				$scope.entity = {};
				$scope.optionsCurrency = data.optionsCurrency;
				$scope.optionsBaseUnit = data.optionsBaseUnit;
				$scope.optionsType = data.optionsType;
				$scope.optionsCategory = data.optionsCategory;
				$scope.optionsManufacturer = data.optionsManufacturer;
				$scope.action = 'create';
			});
		}});
		Dialogs.addMessageListener({ topic: 'codbex-products.Products.Product.updateEntity', handler: (data) => {
			$scope.$evalAsync(() => {
				$scope.entity = data.entity;
				$scope.optionsCurrency = data.optionsCurrency;
				$scope.optionsBaseUnit = data.optionsBaseUnit;
				$scope.optionsType = data.optionsType;
				$scope.optionsCategory = data.optionsCategory;
				$scope.optionsManufacturer = data.optionsManufacturer;
				$scope.action = 'update';
			});
		}});

		$scope.serviceCurrency = '/services/ts/codbex-currencies/gen/codbex-currencies/api/Settings/CurrencyService.ts';
		$scope.serviceBaseUnit = '/services/ts/codbex-uoms/gen/codbex-uoms/api/Settings/UoMService.ts';
		$scope.serviceType = '/services/ts/codbex-products/gen/codbex-products/api/Settings/ProductTypeService.ts';
		$scope.serviceCategory = '/services/ts/codbex-products/gen/codbex-products/api/Settings/ProductCategoryService.ts';
		$scope.serviceManufacturer = '/services/ts/codbex-partners/gen/codbex-partners/api/Manufacturers/ManufacturerService.ts';

		//-----------------Events-------------------//

		$scope.create = () => {
			EntityService.create($scope.entity).then((response) => {
				Dialogs.postMessage({ topic: 'codbex-products.Products.Product.entityCreated', data: response.data });
				Dialogs.postMessage({ topic: 'codbex-products.Products.Product.clearDetails' , data: response.data });
				Notifications.show({
					title: LocaleService.t('codbex-products:t.PRODUCT'),
					description: propertySuccessfullyCreated,
					type: 'positive'
				});
			}, (error) => {
				const message = error.data ? error.data.message : '';
				Dialogs.showAlert({
					title: LocaleService.t('codbex-products:t.PRODUCT'),
					message: LocaleService.t('codbex-products:messages.error.unableToCreate', { name: '$t(codbex-products:t.PRODUCT)', message: message }),
					type: AlertTypes.Error
				});
				console.error('EntityService:', error);
			});
		};

		$scope.update = () => {
			EntityService.update($scope.entity.Id, $scope.entity).then((response) => {
				Dialogs.postMessage({ topic: 'codbex-products.Products.Product.entityUpdated', data: response.data });
				Dialogs.postMessage({ topic: 'codbex-products.Products.Product.clearDetails', data: response.data });
				Notifications.show({
					title: LocaleService.t('codbex-products:t.PRODUCT'),
					description: propertySuccessfullyUpdated,
					type: 'positive'
				});
			}, (error) => {
				const message = error.data ? error.data.message : '';
				Dialogs.showAlert({
					title: LocaleService.t('codbex-products:t.PRODUCT'),
					message: LocaleService.t('codbex-products:messages.error.unableToCreate', { name: '$t(codbex-products:t.PRODUCT)', message: message }),
					type: AlertTypes.Error
				});
				console.error('EntityService:', error);
			});
		};

		$scope.cancel = () => {
			Dialogs.triggerEvent('codbex-products.Products.Product.clearDetails');
		};
		
		//-----------------Dialogs-------------------//
		$scope.alert = (message) => {
			if (message) Dialogs.showAlert({
				title: description,
				message: message,
				type: AlertTypes.Information,
				preformatted: true,
			});
		};
		
		$scope.createCurrency = () => {
			Dialogs.showWindow({
				id: 'Currency-details',
				params: {
					action: 'create',
					entity: {},
				},
				closeButton: false
			});
		};
		$scope.createBaseUnit = () => {
			Dialogs.showWindow({
				id: 'UoM-details',
				params: {
					action: 'create',
					entity: {},
				},
				closeButton: false
			});
		};
		$scope.createType = () => {
			Dialogs.showWindow({
				id: 'ProductType-details',
				params: {
					action: 'create',
					entity: {},
				},
				closeButton: false
			});
		};
		$scope.createCategory = () => {
			Dialogs.showWindow({
				id: 'ProductCategory-details',
				params: {
					action: 'create',
					entity: {},
				},
				closeButton: false
			});
		};
		$scope.createManufacturer = () => {
			Dialogs.showWindow({
				id: 'Manufacturer-details',
				params: {
					action: 'create',
					entity: {},
				},
				closeButton: false
			});
		};

		//-----------------Dialogs-------------------//



		//----------------Dropdowns-----------------//

		$scope.refreshCurrency = () => {
			$scope.optionsCurrency = [];
			$http.get('/services/ts/codbex-currencies/gen/codbex-currencies/api/Settings/CurrencyService.ts').then((response) => {
				$scope.optionsCurrency = response.data.map(e => ({
					value: e.Id,
					text: e.Code
				}));
			}, (error) => {
				console.error(error);
				const message = error.data ? error.data.message : '';
				Dialogs.showAlert({
					title: 'Currency',
					message: LocaleService.t('codbex-products:messages.error.unableToLoad', { message: message }),
					type: AlertTypes.Error
				});
			});
		};
		$scope.refreshBaseUnit = () => {
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
					message: LocaleService.t('codbex-products:messages.error.unableToLoad', { message: message }),
					type: AlertTypes.Error
				});
			});
		};
		$scope.refreshType = () => {
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
					message: LocaleService.t('codbex-products:messages.error.unableToLoad', { message: message }),
					type: AlertTypes.Error
				});
			});
		};
		$scope.refreshCategory = () => {
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
					message: LocaleService.t('codbex-products:messages.error.unableToLoad', { message: message }),
					type: AlertTypes.Error
				});
			});
		};
		$scope.refreshManufacturer = () => {
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
					message: LocaleService.t('codbex-products:messages.error.unableToLoad', { message: message }),
					type: AlertTypes.Error
				});
			});
		};

		//----------------Dropdowns-----------------//	
	});