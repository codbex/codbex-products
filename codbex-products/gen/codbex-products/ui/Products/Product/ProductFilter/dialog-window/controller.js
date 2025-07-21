angular.module('page', ['blimpKit', 'platformView', 'platformLocale', 'EntityService'])
	.config(['EntityServiceProvider', (EntityServiceProvider) => {
		EntityServiceProvider.baseUrl = '/services/ts/codbex-products/gen/codbex-products/api/Products/ProductFilterService.ts';
	}])
	.controller('PageController', ($scope, $http, ViewParameters, LocaleService, EntityService) => {
		const Dialogs = new DialogHub();
		const Notifications = new NotificationHub();
		let description = 'Description';
		let propertySuccessfullyCreated = 'ProductFilter successfully created';
		let propertySuccessfullyUpdated = 'ProductFilter successfully updated';
		$scope.entity = {};
		$scope.forms = {
			details: {},
		};
		$scope.formHeaders = {
			select: 'ProductFilter Details',
			create: 'Create ProductFilter',
			update: 'Update ProductFilter'
		};
		$scope.action = 'select';

		LocaleService.onInit(() => {
			description = LocaleService.t('codbex-products:defaults.description');
			$scope.formHeaders.select = LocaleService.t('codbex-products:defaults.formHeadSelect', { name: '$t(codbex-products:t.PRODUCTFILTER)' });
			$scope.formHeaders.create = LocaleService.t('codbex-products:defaults.formHeadCreate', { name: '$t(codbex-products:t.PRODUCTFILTER)' });
			$scope.formHeaders.update = LocaleService.t('codbex-products:defaults.formHeadUpdate', { name: '$t(codbex-products:t.PRODUCTFILTER)' });
			propertySuccessfullyCreated = LocaleService.t('codbex-products:messages.propertySuccessfullyCreated', { name: '$t(codbex-products:t.PRODUCTFILTER)' });
			propertySuccessfullyUpdated = LocaleService.t('codbex-products:messages.propertySuccessfullyUpdated', { name: '$t(codbex-products:t.PRODUCTFILTER)' });
		});

		let params = ViewParameters.get();
		if (Object.keys(params).length) {
			$scope.action = params.action;
			$scope.entity = params.entity;
			$scope.selectedMainEntityKey = params.selectedMainEntityKey;
			$scope.selectedMainEntityId = params.selectedMainEntityId;
			$scope.optionsType = params.optionsType;
		}

		$scope.create = () => {
			let entity = $scope.entity;
			entity[$scope.selectedMainEntityKey] = $scope.selectedMainEntityId;
			EntityService.create(entity).then((response) => {
				Dialogs.postMessage({ topic: 'codbex-products.Products.ProductFilter.entityCreated', data: response.data });
				Notifications.show({
					title: LocaleService.t('codbex-products:t.PRODUCTFILTER'),
					description: propertySuccessfullyCreated,
					type: 'positive'
				});
				$scope.cancel();
			}, (error) => {
				const message = error.data ? error.data.message : '';
				Dialogs.showAlert({
					title: LocaleService.t('codbex-products:t.PRODUCTFILTER'),
					message: LocaleService.t('codbex-products:messages.error.unableToCreate', { name: '$t(codbex-products:t.PRODUCTFILTER)', message: message }),
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
				Dialogs.postMessage({ topic: 'codbex-products.Products.ProductFilter.entityUpdated', data: response.data });
				Notifications.show({
					title: LocaleService.t('codbex-products:t.PRODUCTFILTER'),
					description: propertySuccessfullyUpdated,
					type: 'positive'
				});
				$scope.cancel();
			}, (error) => {
				const message = error.data ? error.data.message : '';
				Dialogs.showAlert({
					title: LocaleService.t('codbex-products:t.PRODUCTFILTER'),
					message: LocaleService.t('codbex-products:messages.error.unableToUpdate', { name: '$t(codbex-products:t.PRODUCTFILTER)', message: message }),
					type: AlertTypes.Error
				});
				console.error('EntityService:', error);
			});
		};

		$scope.serviceType = '/services/ts/codbex-products/gen/codbex-products/api/entities/ProductFilterTypeService.ts';

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
			Dialogs.closeWindow({ id: 'ProductFilter-details' });
		};
	});