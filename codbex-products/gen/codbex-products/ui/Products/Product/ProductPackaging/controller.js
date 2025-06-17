angular.module('page', ['blimpKit', 'platformView', 'EntityService'])
	.config(['EntityServiceProvider', (EntityServiceProvider) => {
		EntityServiceProvider.baseUrl = '/services/ts/codbex-products/gen/codbex-products/api/Products/ProductPackagingService.ts';
	}])
	.controller('PageController', ($scope, $http, EntityService, Extensions, ButtonStates) => {
		const Dialogs = new DialogHub();
		//-----------------Custom Actions-------------------//
		Extensions.getWindows(['codbex-products-custom-action']).then((response) => {
			$scope.pageActions = response.data.filter(e => e.perspective === 'Products' && e.view === 'ProductPackaging' && (e.type === 'page' || e.type === undefined));
			$scope.entityActions = response.data.filter(e => e.perspective === 'Products' && e.view === 'ProductPackaging' && e.type === 'entity');
		});

		$scope.triggerPageAction = (action) => {
			Dialogs.showWindow({
				hasHeader: true,
        		title: action.label,
				path: action.path,
				closeButton: true
			});
		};

		$scope.triggerEntityAction = (action) => {
			Dialogs.showWindow({
				hasHeader: true,
        		title: action.label,
				path: action.path,
				params: {
					id: $scope.entity.Id
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
		Dialogs.addMessageListener({ topic: 'codbex-products.Products.ProductPackaging.clearDetails', handler: () => {
			$scope.$evalAsync(() => {
				$scope.entity = {};
				$scope.action = 'select';
			});
		}});
		Dialogs.addMessageListener({ topic: 'codbex-products.Products.ProductPackaging.entityCreated', handler: () => {
			$scope.loadPage($scope.dataPage, $scope.filter);
		}});
		Dialogs.addMessageListener({ topic: 'codbex-products.Products.ProductPackaging.entityUpdated', handler: () => {
			$scope.loadPage($scope.dataPage, $scope.filter);
		}});
		Dialogs.addMessageListener({ topic: 'codbex-products.Products.ProductPackaging.entitySearch', handler: (data) => {
			resetPagination();
			$scope.filter = data.filter;
			$scope.filterEntity = data.entity;
			$scope.loadPage($scope.dataPage, $scope.filter);
		}});
		//-----------------Events-------------------//

		$scope.loadPage = (pageNumber, filter) => {
			let Product = $scope.selectedMainEntityId;
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
			filter.$filter.equals.Product = Product;
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
						title: 'ProductPackaging',
						message: `Unable to list/filter ProductPackaging: '${message}'`,
						type: AlertTypes.Error
					});
					console.error('EntityService:', error);
				});
			}, (error) => {
				const message = error.data ? error.data.message : '';
				Dialogs.showAlert({
					title: 'ProductPackaging',
					message: `Unable to count ProductPackaging: '${message}'`,
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
				id: 'ProductPackaging-details',
				params: {
					action: 'select',
					entity: entity,
					optionsUoM: $scope.optionsUoM,
				},
			});
		};

		$scope.openFilter = (entity) => {
			Dialogs.showWindow({
				id: 'ProductPackaging-filter',
				params: {
					entity: $scope.filterEntity,
					optionsUoM: $scope.optionsUoM,
				},
			});
		};

		$scope.createEntity = () => {
			$scope.selectedEntity = null;
			Dialogs.showWindow({
				id: 'ProductPackaging-details',
				params: {
					action: 'create',
					entity: {},
					selectedMainEntityKey: 'Product',
					selectedMainEntityId: $scope.selectedMainEntityId,
					optionsUoM: $scope.optionsUoM,
				},
				closeButton: false
			});
		};

		$scope.updateEntity = (entity) => {
			Dialogs.showWindow({
				id: 'ProductPackaging-details',
				params: {
					action: 'update',
					entity: entity,
					selectedMainEntityKey: 'Product',
					selectedMainEntityId: $scope.selectedMainEntityId,
					optionsUoM: $scope.optionsUoM,
			},
				closeButton: false
			});
		};

		$scope.deleteEntity = (entity) => {
			let id = entity.Id;
			Dialogs.showDialog({
				title: 'Delete ProductPackaging?',
				message: `Are you sure you want to delete ProductPackaging? This action cannot be undone.`,
				buttons: [{
					id: 'delete-btn-yes',
					state: ButtonStates.Emphasized,
					label: 'Yes',
				}, {
					id: 'delete-btn-no',
					label: 'No',
				}],
				closeButton: false
			}).then((buttonId) => {
				if (buttonId === 'delete-btn-yes') {
					EntityService.delete(id).then(() => {
						$scope.loadPage($scope.dataPage, $scope.filter);
						Dialogs.triggerEvent('codbex-products.Products.ProductPackaging.clearDetails');
					}, (error) => {
						const message = error.data ? error.data.message : '';
						Dialogs.showAlert({
							title: 'ProductPackaging',
							message: `Unable to delete ProductPackaging: '${message}'`,
							type: AlertTypes.Error,
						});
						console.error('EntityService:', error);
					});
				}
			});
		};

		//----------------Dropdowns-----------------//
		$scope.optionsUoM = [];


		$http.get('/services/ts/codbex-uoms/gen/codbex-uoms/api/Settings/UoMService.ts').then((response) => {
			$scope.optionsUoM = response.data.map(e => ({
				value: e.Id,
				text: e.Name
			}));
		}, (error) => {
			console.error(error);
			const message = error.data ? error.data.message : '';
			Dialogs.showAlert({
				title: 'UoM',
				message: `Unable to load data: '${message}'`,
				type: AlertTypes.Error
			});
		});

		$scope.optionsUoMValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsUoM.length; i++) {
				if ($scope.optionsUoM[i].value === optionKey) {
					return $scope.optionsUoM[i].text;
				}
			}
			return null;
		};
		//----------------Dropdowns-----------------//
	});
