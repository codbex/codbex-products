angular.module('page', ['blimpKit', 'platformView', 'platformLocale', 'EntityService'])
	.config(['EntityServiceProvider', (EntityServiceProvider) => {
		EntityServiceProvider.baseUrl = '/services/ts/codbex-products/gen/codbex-products/api/Products/CampaignEntryService.ts';
	}])
	.controller('PageController', ($scope, $http, ViewParameters, LocaleService, EntityService) => {
		const Dialogs = new DialogHub();
		const Notifications = new NotificationHub();
		let description = 'Description';
		let propertySuccessfullyCreated = 'CampaignEntry successfully created';
		let propertySuccessfullyUpdated = 'CampaignEntry successfully updated';
		$scope.entity = {};
		$scope.forms = {
			details: {},
		};
		$scope.formHeaders = {
			select: 'CampaignEntry Details',
			create: 'Create CampaignEntry',
			update: 'Update CampaignEntry'
		};
		$scope.action = 'select';

		LocaleService.onInit(() => {
			description = LocaleService.t('codbex-products:defaults.description');
			$scope.formHeaders.select = LocaleService.t('codbex-products:defaults.formHeadSelect', { name: '$t(codbex-products:t.CAMPAIGNENTRY)' });
			$scope.formHeaders.create = LocaleService.t('codbex-products:defaults.formHeadCreate', { name: '$t(codbex-products:t.CAMPAIGNENTRY)' });
			$scope.formHeaders.update = LocaleService.t('codbex-products:defaults.formHeadUpdate', { name: '$t(codbex-products:t.CAMPAIGNENTRY)' });
			propertySuccessfullyCreated = LocaleService.t('codbex-products:messages.propertySuccessfullyCreated', { name: '$t(codbex-products:t.CAMPAIGNENTRY)' });
			propertySuccessfullyUpdated = LocaleService.t('codbex-products:messages.propertySuccessfullyUpdated', { name: '$t(codbex-products:t.CAMPAIGNENTRY)' });
		});

		let params = ViewParameters.get();
		if (Object.keys(params).length) {
			$scope.action = params.action;
			$scope.entity = params.entity;
			$scope.selectedMainEntityKey = params.selectedMainEntityKey;
			$scope.selectedMainEntityId = params.selectedMainEntityId;
			$scope.optionsCampaign = params.optionsCampaign;
		}

		$scope.create = () => {
			let entity = $scope.entity;
			entity[$scope.selectedMainEntityKey] = $scope.selectedMainEntityId;
			EntityService.create(entity).then((response) => {
				Dialogs.postMessage({ topic: 'codbex-products.Products.CampaignEntry.entityCreated', data: response.data });
				Notifications.show({
					title: LocaleService.t('codbex-products:t.CAMPAIGNENTRY'),
					description: propertySuccessfullyCreated,
					type: 'positive'
				});
				$scope.cancel();
			}, (error) => {
				const message = error.data ? error.data.message : '';
				Dialogs.showAlert({
					title: LocaleService.t('codbex-products:t.CAMPAIGNENTRY'),
					message: LocaleService.t('codbex-products:messages.error.unableToCreate', { name: '$t(codbex-products:t.CAMPAIGNENTRY)', message: message }),
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
				Dialogs.postMessage({ topic: 'codbex-products.Products.CampaignEntry.entityUpdated', data: response.data });
				Notifications.show({
					title: LocaleService.t('codbex-products:t.CAMPAIGNENTRY'),
					description: propertySuccessfullyUpdated,
					type: 'positive'
				});
				$scope.cancel();
			}, (error) => {
				const message = error.data ? error.data.message : '';
				Dialogs.showAlert({
					title: LocaleService.t('codbex-products:t.CAMPAIGNENTRY'),
					message: LocaleService.t('codbex-products:messages.error.unableToUpdate', { name: '$t(codbex-products:t.CAMPAIGNENTRY)', message: message }),
					type: AlertTypes.Error
				});
				console.error('EntityService:', error);
			});
		};

		$scope.serviceCampaign = '/services/ts/codbex-products/gen/codbex-products/api/Campaign/CampaignService.ts';

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
			Dialogs.closeWindow({ id: 'CampaignEntry-details' });
		};
	});