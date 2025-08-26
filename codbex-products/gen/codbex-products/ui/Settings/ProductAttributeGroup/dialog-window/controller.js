angular.module('page', ['blimpKit', 'platformView', 'platformLocale', 'EntityService'])
	.config(['EntityServiceProvider', (EntityServiceProvider) => {
		EntityServiceProvider.baseUrl = '/services/ts/codbex-products/gen/codbex-products/api/Settings/ProductAttributeGroupService.ts';
	}])
	.controller('PageController', ($scope, $http, ViewParameters, LocaleService, EntityService) => {
		const Dialogs = new DialogHub();
		const Notifications = new NotificationHub();
		let description = 'Description';
		let propertySuccessfullyCreated = 'ProductAttributeGroup successfully created';
		let propertySuccessfullyUpdated = 'ProductAttributeGroup successfully updated';

		$scope.entity = {};
		$scope.forms = {
			details: {},
		};
		$scope.formHeaders = {
			select: 'ProductAttributeGroup Details',
			create: 'Create ProductAttributeGroup',
			update: 'Update ProductAttributeGroup'
		};
		$scope.action = 'select';

		LocaleService.onInit(() => {
			description = LocaleService.t('codbex-products:codbex-products-model.defaults.description');
			$scope.formHeaders.select = LocaleService.t('codbex-products:codbex-products-model.defaults.formHeadSelect', { name: '$t(codbex-products:codbex-products-model.t.PRODUCTATTRIBUTEGROUP)' });
			$scope.formHeaders.create = LocaleService.t('codbex-products:codbex-products-model.defaults.formHeadCreate', { name: '$t(codbex-products:codbex-products-model.t.PRODUCTATTRIBUTEGROUP)' });
			$scope.formHeaders.update = LocaleService.t('codbex-products:codbex-products-model.defaults.formHeadUpdate', { name: '$t(codbex-products:codbex-products-model.t.PRODUCTATTRIBUTEGROUP)' });
			propertySuccessfullyCreated = LocaleService.t('codbex-products:codbex-products-model.messages.propertySuccessfullyCreated', { name: '$t(codbex-products:codbex-products-model.t.PRODUCTATTRIBUTEGROUP)' });
			propertySuccessfullyUpdated = LocaleService.t('codbex-products:codbex-products-model.messages.propertySuccessfullyUpdated', { name: '$t(codbex-products:codbex-products-model.t.PRODUCTATTRIBUTEGROUP)' });
		});

		let params = ViewParameters.get();
		if (Object.keys(params).length) {
			$scope.action = params.action;
			$scope.entity = params.entity;
			$scope.selectedMainEntityKey = params.selectedMainEntityKey;
			$scope.selectedMainEntityId = params.selectedMainEntityId;
		}

		$scope.create = () => {
			let entity = $scope.entity;
			entity[$scope.selectedMainEntityKey] = $scope.selectedMainEntityId;
			EntityService.create(entity).then((response) => {
				Dialogs.postMessage({ topic: 'codbex-products.Settings.ProductAttributeGroup.entityCreated', data: response.data });
				Notifications.show({
					title: LocaleService.t('codbex-products:codbex-products-model.t.PRODUCTATTRIBUTEGROUP'),
					description: propertySuccessfullyCreated,
					type: 'positive'
				});
				$scope.cancel();
			}, (error) => {
				const message = error.data ? error.data.message : '';
				$scope.$evalAsync(() => {
					$scope.errorMessage = LocaleService.t('codbex-products:codbex-products-model.messages.error.unableToCreate', { name: '$t(codbex-products:codbex-products-model.t.PRODUCTATTRIBUTEGROUP)', message: message });
				});
				console.error('EntityService:', error);
			});
		};

		$scope.update = () => {
			let id = $scope.entity.Id;
			let entity = $scope.entity;
			entity[$scope.selectedMainEntityKey] = $scope.selectedMainEntityId;
			EntityService.update(id, entity).then((response) => {
				Dialogs.postMessage({ topic: 'codbex-products.Settings.ProductAttributeGroup.entityUpdated', data: response.data });
				Notifications.show({
					title: LocaleService.t('codbex-products:codbex-products-model.t.PRODUCTATTRIBUTEGROUP'),
					description: propertySuccessfullyUpdated,
					type: 'positive'
				});
				$scope.cancel();
			}, (error) => {
				const message = error.data ? error.data.message : '';
				$scope.$evalAsync(() => {
					$scope.errorMessage = LocaleService.t('codbex-products:codbex-products-model.messages.error.unableToUpdate', { name: '$t(codbex-products:codbex-products-model.t.PRODUCTATTRIBUTEGROUP)', message: message });
				});
				console.error('EntityService:', error);
			});
		};


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
			Dialogs.closeWindow({ id: 'ProductAttributeGroup-details' });
		};

		$scope.clearErrorMessage = () => {
			$scope.errorMessage = null;
		};
	});