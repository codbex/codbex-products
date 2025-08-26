angular.module('page', ['blimpKit', 'platformView', 'platformLocale', 'EntityService'])
	.config(["EntityServiceProvider", (EntityServiceProvider) => {
		EntityServiceProvider.baseUrl = '/services/ts/codbex-products/gen/codbex-products/api/Campaign/CampaignService.ts';
	}])
	.controller('PageController', ($scope, $http, Extensions, LocaleService, EntityService) => {
		const Dialogs = new DialogHub();
		const Notifications = new NotificationHub();
		let description = 'Description';
		let propertySuccessfullyCreated = 'Campaign successfully created';
		let propertySuccessfullyUpdated = 'Campaign successfully updated';
		$scope.entity = {};
		$scope.forms = {
			details: {},
		};
		$scope.formHeaders = {
			select: 'Campaign Details',
			create: 'Create Campaign',
			update: 'Update Campaign'
		};
		$scope.action = 'select';

		LocaleService.onInit(() => {
			description = LocaleService.t('codbex-products:codbex-products-model.defaults.description');
			$scope.formHeaders.select = LocaleService.t('codbex-products:codbex-products-model.defaults.formHeadSelect', { name: '$t(codbex-products:codbex-products-model.t.CAMPAIGN)' });
			$scope.formHeaders.create = LocaleService.t('codbex-products:codbex-products-model.defaults.formHeadCreate', { name: '$t(codbex-products:codbex-products-model.t.CAMPAIGN)' });
			$scope.formHeaders.update = LocaleService.t('codbex-products:codbex-products-model.defaults.formHeadUpdate', { name: '$t(codbex-products:codbex-products-model.t.CAMPAIGN)' });
			propertySuccessfullyCreated = LocaleService.t('codbex-products:codbex-products-model.messages.propertySuccessfullyCreated', { name: '$t(codbex-products:codbex-products-model.t.CAMPAIGN)' });
			propertySuccessfullyUpdated = LocaleService.t('codbex-products:codbex-products-model.messages.propertySuccessfullyUpdated', { name: '$t(codbex-products:codbex-products-model.t.CAMPAIGN)' });
		});

		//-----------------Custom Actions-------------------//
		Extensions.getWindows(['codbex-products-custom-action']).then((response) => {
			$scope.entityActions = response.data.filter(e => e.perspective === 'Campaign' && e.view === 'Campaign' && e.type === 'entity');
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
		Dialogs.addMessageListener({ topic: 'codbex-products.Campaign.Campaign.clearDetails', handler: () => {
			$scope.$evalAsync(() => {
				$scope.entity = {};
				$scope.action = 'select';
			});
		}});
		Dialogs.addMessageListener({ topic: 'codbex-products.Campaign.Campaign.entitySelected', handler: (data) => {
			$scope.$evalAsync(() => {
				if (data.entity.StartDate) {
					data.entity.StartDate = new Date(data.entity.StartDate);
				}
				if (data.entity.EndDate) {
					data.entity.EndDate = new Date(data.entity.EndDate);
				}
				$scope.entity = data.entity;
				$scope.action = 'select';
			});
		}});
		Dialogs.addMessageListener({ topic: 'codbex-products.Campaign.Campaign.createEntity', handler: (data) => {
			$scope.$evalAsync(() => {
				$scope.entity = {};
				$scope.action = 'create';
			});
		}});
		Dialogs.addMessageListener({ topic: 'codbex-products.Campaign.Campaign.updateEntity', handler: (data) => {
			$scope.$evalAsync(() => {
				if (data.entity.StartDate) {
					data.entity.StartDate = new Date(data.entity.StartDate);
				}
				if (data.entity.EndDate) {
					data.entity.EndDate = new Date(data.entity.EndDate);
				}
				$scope.entity = data.entity;
				$scope.action = 'update';
			});
		}});


		//-----------------Events-------------------//

		$scope.create = () => {
			EntityService.create($scope.entity).then((response) => {
				Dialogs.postMessage({ topic: 'codbex-products.Campaign.Campaign.entityCreated', data: response.data });
				Dialogs.postMessage({ topic: 'codbex-products.Campaign.Campaign.clearDetails' , data: response.data });
				Notifications.show({
					title: LocaleService.t('codbex-products:codbex-products-model.t.CAMPAIGN'),
					description: propertySuccessfullyCreated,
					type: 'positive'
				});
			}, (error) => {
				const message = error.data ? error.data.message : '';
				Dialogs.showAlert({
					title: LocaleService.t('codbex-products:codbex-products-model.t.CAMPAIGN'),
					message: LocaleService.t('codbex-products:codbex-products-model.messages.error.unableToCreate', { name: '$t(codbex-products:codbex-products-model.t.CAMPAIGN)', message: message }),
					type: AlertTypes.Error
				});
				console.error('EntityService:', error);
			});
		};

		$scope.update = () => {
			EntityService.update($scope.entity.Id, $scope.entity).then((response) => {
				Dialogs.postMessage({ topic: 'codbex-products.Campaign.Campaign.entityUpdated', data: response.data });
				Dialogs.postMessage({ topic: 'codbex-products.Campaign.Campaign.clearDetails', data: response.data });
				Notifications.show({
					title: LocaleService.t('codbex-products:codbex-products-model.t.CAMPAIGN'),
					description: propertySuccessfullyUpdated,
					type: 'positive'
				});
			}, (error) => {
				const message = error.data ? error.data.message : '';
				Dialogs.showAlert({
					title: LocaleService.t('codbex-products:codbex-products-model.t.CAMPAIGN'),
					message: LocaleService.t('codbex-products:codbex-products-model.messages.error.unableToCreate', { name: '$t(codbex-products:codbex-products-model.t.CAMPAIGN)', message: message }),
					type: AlertTypes.Error
				});
				console.error('EntityService:', error);
			});
		};

		$scope.cancel = () => {
			Dialogs.triggerEvent('codbex-products.Campaign.Campaign.clearDetails');
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
		

		//-----------------Dialogs-------------------//



		//----------------Dropdowns-----------------//


		//----------------Dropdowns-----------------//	
	});