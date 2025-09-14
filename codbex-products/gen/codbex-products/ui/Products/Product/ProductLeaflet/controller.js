angular.module('page', ['blimpKit', 'platformView', 'platformLocale', 'EntityService'])
	.config(['EntityServiceProvider', (EntityServiceProvider) => {
		EntityServiceProvider.baseUrl = '/services/ts/codbex-products/gen/codbex-products/api/Products/ProductLeafletService.ts';
	}])
	.controller('PageController', ($scope, $http, EntityService, Extensions, LocaleService, ButtonStates) => {
		const Dialogs = new DialogHub();
		let translated = {
			yes: 'Yes',
			no: 'No',
			deleteConfirm: 'Are you sure you want to delete ProductLeaflet? This action cannot be undone.',
			deleteTitle: 'Delete ProductLeaflet?'
		};

		LocaleService.onInit(() => {
			translated.yes = LocaleService.t('codbex-products:codbex-products-model.defaults.yes');
			translated.no = LocaleService.t('codbex-products:codbex-products-model.defaults.no');
			translated.deleteTitle = LocaleService.t('codbex-products:codbex-products-model.defaults.deleteTitle', { name: '$t(codbex-products:codbex-products-model.t.PRODUCTLEAFLET)' });
			translated.deleteConfirm = LocaleService.t('codbex-products:codbex-products-model.messages.deleteConfirm', { name: '$t(codbex-products:codbex-products-model.t.PRODUCTLEAFLET)' });
		});
		//-----------------Custom Actions-------------------//
		Extensions.getWindows(['codbex-products-custom-action']).then((response) => {
			$scope.pageActions = response.data.filter(e => e.perspective === 'Products' && e.view === 'ProductLeaflet' && (e.type === 'page' || e.type === undefined));
			$scope.entityActions = response.data.filter(e => e.perspective === 'Products' && e.view === 'ProductLeaflet' && e.type === 'entity');
		});

		$scope.triggerPageAction = (action) => {
			Dialogs.showWindow({
				hasHeader: true,
        		title: LocaleService.t(action.translation.key, action.translation.options, action.label),
				path: action.path,
				params: {
					selectedMainEntityKey: 'Title',
					selectedMainEntityId: $scope.selectedMainEntityId,
				},
				maxWidth: action.maxWidth,
				maxHeight: action.maxHeight,
				closeButton: true
			});
		};

		$scope.triggerEntityAction = (action) => {
			Dialogs.showWindow({
				hasHeader: true,
        		title: LocaleService.t(action.translation.key, action.translation.options, action.label),
				path: action.path,
				params: {
					id: $scope.entity.Id,
					selectedMainEntityKey: 'Title',
					selectedMainEntityId: $scope.selectedMainEntityId,
				},
				closeButton: true
			});
		};
		//-----------------Custom Actions-------------------//

		function resetPagination() {
			$scope.dataPage = 1;
			$scope.dataCount = 0;
			$scope.dataLimit = 10;
		}
		resetPagination();

		//-----------------Events-------------------//
		Dialogs.addMessageListener({ topic: 'codbex-products.Products.Product.entitySelected', handler: (data) => {
			resetPagination();
			$scope.selectedMainEntityId = data.selectedMainEntityId;
			$scope.loadPage($scope.dataPage);
		}});
		Dialogs.addMessageListener({ topic: 'codbex-products.Products.Product.clearDetails', handler: () => {
			$scope.$evalAsync(() => {
				resetPagination();
				$scope.selectedMainEntityId = null;
				$scope.data = null;
			});
		}});
		Dialogs.addMessageListener({ topic: 'codbex-products.Products.ProductLeaflet.clearDetails', handler: () => {
			$scope.$evalAsync(() => {
				$scope.entity = {};
				$scope.action = 'select';
			});
		}});
		Dialogs.addMessageListener({ topic: 'codbex-products.Products.ProductLeaflet.entityCreated', handler: () => {
			$scope.loadPage($scope.dataPage, $scope.filter);
		}});
		Dialogs.addMessageListener({ topic: 'codbex-products.Products.ProductLeaflet.entityUpdated', handler: () => {
			$scope.loadPage($scope.dataPage, $scope.filter);
		}});
		Dialogs.addMessageListener({ topic: 'codbex-products.Products.ProductLeaflet.entitySearch', handler: (data) => {
			resetPagination();
			$scope.filter = data.filter;
			$scope.filterEntity = data.entity;
			$scope.loadPage($scope.dataPage, $scope.filter);
		}});
		//-----------------Events-------------------//

		$scope.loadPage = (pageNumber, filter) => {
			let Title = $scope.selectedMainEntityId;
			$scope.dataPage = pageNumber;
			if (!filter && $scope.filter) {
				filter = $scope.filter;
			}
			if (!filter) {
				filter = {};
			}
			if (!filter.$filter) {
				filter.$filter = {};
			}
			if (!filter.$filter.equals) {
				filter.$filter.equals = {};
			}
			filter.$filter.equals.Title = Title;
			EntityService.count(filter).then((resp) => {
				if (resp.data) {
					$scope.dataCount = resp.data.count;
				}
				filter.$offset = (pageNumber - 1) * $scope.dataLimit;
				filter.$limit = $scope.dataLimit;
				EntityService.search(filter).then((response) => {
					$scope.data = response.data;
				}, (error) => {
					const message = error.data ? error.data.message : '';
					Dialogs.showAlert({
						title: LocaleService.t('codbex-products:codbex-products-model.t.PRODUCTLEAFLET'),
						message: LocaleService.t('codbex-products:codbex-products-model.messages.error.unableToLF', { name: '$t(codbex-products:codbex-products-model.t.PRODUCTLEAFLET)', message: message }),
						type: AlertTypes.Error
					});
					console.error('EntityService:', error);
				});
			}, (error) => {
				const message = error.data ? error.data.message : '';
				Dialogs.showAlert({
					title: LocaleService.t('codbex-products:codbex-products-model.t.PRODUCTLEAFLET'),
					message: LocaleService.t('codbex-products:codbex-products-model.messages.error.unableToCount', { name: '$t(codbex-products:codbex-products-model.t.PRODUCTLEAFLET)', message: message }),
					type: AlertTypes.Error
				});
				console.error('EntityService:', error);
			});
		};

		$scope.selectEntity = (entity) => {
			$scope.selectedEntity = entity;
		};

		$scope.openDetails = (entity) => {
			$scope.selectedEntity = entity;
			Dialogs.showWindow({
				id: 'ProductLeaflet-details',
				params: {
					action: 'select',
					entity: entity,
					optionsTitle: $scope.optionsTitle,
				},
			});
		};

		$scope.openFilter = () => {
			Dialogs.showWindow({
				id: 'ProductLeaflet-filter',
				params: {
					entity: $scope.filterEntity,
					optionsTitle: $scope.optionsTitle,
				},
			});
		};

		$scope.createEntity = () => {
			$scope.selectedEntity = null;
			Dialogs.showWindow({
				id: 'ProductLeaflet-details',
				params: {
					action: 'create',
					entity: {
						'Title': $scope.selectedMainEntityId
					},
					selectedMainEntityKey: 'Title',
					selectedMainEntityId: $scope.selectedMainEntityId,
					optionsTitle: $scope.optionsTitle,
				},
				closeButton: false
			});
		};

		$scope.updateEntity = (entity) => {
			Dialogs.showWindow({
				id: 'ProductLeaflet-details',
				params: {
					action: 'update',
					entity: entity,
					selectedMainEntityKey: 'Title',
					selectedMainEntityId: $scope.selectedMainEntityId,
					optionsTitle: $scope.optionsTitle,
			},
				closeButton: false
			});
		};

		$scope.deleteEntity = (entity) => {
			let id = entity.Id;
			Dialogs.showDialog({
				title: translated.deleteTitle,
				message: translated.deleteConfirm,
				buttons: [{
					id: 'delete-btn-yes',
					state: ButtonStates.Emphasized,
					label: translated.yes,
				}, {
					id: 'delete-btn-no',
					label: translated.no,
				}],
				closeButton: false
			}).then((buttonId) => {
				if (buttonId === 'delete-btn-yes') {
					EntityService.delete(id).then(() => {
						$scope.loadPage($scope.dataPage, $scope.filter);
						Dialogs.triggerEvent('codbex-products.Products.ProductLeaflet.clearDetails');
					}, (error) => {
						const message = error.data ? error.data.message : '';
						Dialogs.showAlert({
							title: LocaleService.t('codbex-products:codbex-products-model.t.PRODUCTLEAFLET'),
							message: LocaleService.t('codbex-products:codbex-products-model.messages.error.unableToDelete', { name: '$t(codbex-products:codbex-products-model.t.PRODUCTLEAFLET)', message: message }),
							type: AlertTypes.Error,
						});
						console.error('EntityService:', error);
					});
				}
			});
		};

		//----------------Dropdowns-----------------//
		$scope.optionsTitle = [];


		$http.get('/services/ts/codbex-products/gen/codbex-products/api/Products/ProductService.ts').then((response) => {
			$scope.optionsTitle = response.data.map(e => ({
				value: e.Id,
				text: e.Name
			}));
		}, (error) => {
			console.error(error);
			const message = error.data ? error.data.message : '';
			Dialogs.showAlert({
				title: 'Title',
				message: LocaleService.t('codbex-products:codbex-products-model.messages.error.unableToLoad', { message: message }),
				type: AlertTypes.Error
			});
		});

		$scope.optionsTitleValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsTitle.length; i++) {
				if ($scope.optionsTitle[i].value === optionKey) {
					return $scope.optionsTitle[i].text;
				}
			}
			return null;
		};
		//----------------Dropdowns-----------------//
	});
