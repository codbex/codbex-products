angular.module('page', ['blimpKit', 'platformView', 'platformLocale', 'EntityService'])
	.config(['EntityServiceProvider', (EntityServiceProvider) => {
		EntityServiceProvider.baseUrl = '/services/ts/codbex-products/gen/codbex-products/api/Products/ProductAttributeService.ts';
	}])
	.controller('PageController', ($scope, $http, ViewParameters, LocaleService, EntityService) => {
		const Dialogs = new DialogHub();
		const Notifications = new NotificationHub();
		let description = 'Description';
		let propertySuccessfullyCreated = 'ProductAttribute successfully created';
		let propertySuccessfullyUpdated = 'ProductAttribute successfully updated';
		$scope.entity = {};
		$scope.forms = {
			details: {},
		};
		$scope.formHeaders = {
			select: 'ProductAttribute Details',
			create: 'Create ProductAttribute',
			update: 'Update ProductAttribute'
		};
		$scope.action = 'select';

		LocaleService.onInit(() => {
			description = LocaleService.t('codbex-products:codbex-products-model.defaults.description');
			$scope.formHeaders.select = LocaleService.t('codbex-products:codbex-products-model.defaults.formHeadSelect', { name: '$t(codbex-products:codbex-products-model.t.PRODUCTATTRIBUTE)' });
			$scope.formHeaders.create = LocaleService.t('codbex-products:codbex-products-model.defaults.formHeadCreate', { name: '$t(codbex-products:codbex-products-model.t.PRODUCTATTRIBUTE)' });
			$scope.formHeaders.update = LocaleService.t('codbex-products:codbex-products-model.defaults.formHeadUpdate', { name: '$t(codbex-products:codbex-products-model.t.PRODUCTATTRIBUTE)' });
			propertySuccessfullyCreated = LocaleService.t('codbex-products:codbex-products-model.messages.propertySuccessfullyCreated', { name: '$t(codbex-products:codbex-products-model.t.PRODUCTATTRIBUTE)' });
			propertySuccessfullyUpdated = LocaleService.t('codbex-products:codbex-products-model.messages.propertySuccessfullyUpdated', { name: '$t(codbex-products:codbex-products-model.t.PRODUCTATTRIBUTE)' });
		});

		let params = ViewParameters.get();
		if (Object.keys(params).length) {
			$scope.action = params.action;
			$scope.entity = params.entity;
			$scope.selectedMainEntityKey = params.selectedMainEntityKey;
			$scope.selectedMainEntityId = params.selectedMainEntityId;
			$scope.optionsProduct = params.optionsProduct;
			$scope.optionsGroup = params.optionsGroup;
		}

		$scope.create = () => {
			let entity = $scope.entity;
			entity[$scope.selectedMainEntityKey] = $scope.selectedMainEntityId;
			EntityService.create(entity).then((response) => {
				Dialogs.postMessage({ topic: 'codbex-products.Products.ProductAttribute.entityCreated', data: response.data });
				Notifications.show({
					title: LocaleService.t('codbex-products:codbex-products-model.t.PRODUCTATTRIBUTE'),
					description: propertySuccessfullyCreated,
					type: 'positive'
				});
				$scope.cancel();
			}, (error) => {
				const message = error.data ? error.data.message : '';
				Dialogs.showAlert({
					title: LocaleService.t('codbex-products:codbex-products-model.t.PRODUCTATTRIBUTE'),
					message: LocaleService.t('codbex-products:codbex-products-model.messages.error.unableToCreate', { name: '$t(codbex-products:codbex-products-model.t.PRODUCTATTRIBUTE)', message: message }),
					type: AlertTypes.Error
				});
				console.error('EntityService:', error);
			});
		};

		$scope.update = () => {
			let id = $scope.entity.Id;
			let entity = $scope.entity;
			entity[$scope.selectedMainEntityKey] = $scope.selectedMainEntityId;
			EntityService.update(id, entity).then((response) => {
				Dialogs.postMessage({ topic: 'codbex-products.Products.ProductAttribute.entityUpdated', data: response.data });
				Notifications.show({
					title: LocaleService.t('codbex-products:codbex-products-model.t.PRODUCTATTRIBUTE'),
					description: propertySuccessfullyUpdated,
					type: 'positive'
				});
				$scope.cancel();
			}, (error) => {
				const message = error.data ? error.data.message : '';
				Dialogs.showAlert({
					title: LocaleService.t('codbex-products:codbex-products-model.t.PRODUCTATTRIBUTE'),
					message: LocaleService.t('codbex-products:codbex-products-model.messages.error.unableToUpdate', { name: '$t(codbex-products:codbex-products-model.t.PRODUCTATTRIBUTE)', message: message }),
					type: AlertTypes.Error
				});
				console.error('EntityService:', error);
			});
		};

		$scope.serviceProduct = '/services/ts/codbex-products/gen/codbex-products/api/Products/ProductService.ts';
		$scope.serviceGroup = '/services/ts/codbex-products/gen/codbex-products/api/Settings/ProductAttributeGroupService.ts';

		$scope.alert = (message) => {
			if (message) Dialogs.showAlert({
				title: description,
				message: message,
				type: AlertTypes.Information,
				preformatted: true,
			});
		};

		$scope.cancel = () => {
			$scope.entity = {};
			$scope.action = 'select';
			Dialogs.closeWindow({ id: 'ProductAttribute-details' });
		};
	});