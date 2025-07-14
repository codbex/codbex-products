angular.module('page', ['blimpKit', 'platformView', 'platformLocale', 'EntityService'])
	.config(['EntityServiceProvider', (EntityServiceProvider) => {
		EntityServiceProvider.baseUrl = '/services/ts/codbex-products/gen/codbex-products/api/Products/ProductService.ts';
	}])
	.controller('PageController', ($scope, $http, EntityService, Extensions, LocaleService, ButtonStates) => {
		const Dialogs = new DialogHub();
		let translated = {
			yes: 'Yes',
			no: 'No',
			deleteConfirm: 'Are you sure you want to delete Product? This action cannot be undone.',
			deleteTitle: 'Delete Product?'
		};

		LocaleService.onInit(() => {
			translated.yes = LocaleService.t('codbex-products:defaults.yes');
			translated.no = LocaleService.t('codbex-products:defaults.no');
			translated.deleteTitle = LocaleService.t('codbex-products:defaults.deleteTitle', { name: '$t(codbex-products:t.PRODUCT)' });
			translated.deleteConfirm = LocaleService.t('codbex-products:messages.deleteConfirm', { name: '$t(codbex-products:t.PRODUCT)' });
		});
		$scope.dataPage = 1;
		$scope.dataCount = 0;
		$scope.dataOffset = 0;
		$scope.dataLimit = 10;
		$scope.action = 'select';

		//-----------------Custom Actions-------------------//
		Extensions.getWindows(['codbex-products-custom-action']).then((response) => {
			$scope.pageActions = response.data.filter(e => e.perspective === 'Products' && e.view === 'Product' && (e.type === 'page' || e.type === undefined));
		});

		$scope.triggerPageAction = (action) => {
			Dialogs.showWindow({
				hasHeader: true,
        		title: LocaleService.t(action.translation.key, action.translation.options, action.label),
				path: action.path,
				maxWidth: action.maxWidth,
				maxHeight: action.maxHeight,
				closeButton: true
			});
		};
		//-----------------Custom Actions-------------------//

		function refreshData() {
			$scope.dataReset = true;
			$scope.dataPage--;
		}

		function resetPagination() {
			$scope.dataReset = true;
			$scope.dataPage = 1;
			$scope.dataCount = 0;
			$scope.dataLimit = 10;
		}

		//-----------------Events-------------------//
		Dialogs.addMessageListener({ topic: 'codbex-products.Products.Product.clearDetails', handler: () => {
			$scope.$evalAsync(() => {
				$scope.selectedEntity = null;
				$scope.action = 'select';
			});
		}});
		Dialogs.addMessageListener({ topic: 'codbex-products.Products.Product.entityCreated', handler: () => {
			refreshData();
			$scope.loadPage($scope.dataPage, $scope.filter);
		}});
		Dialogs.addMessageListener({ topic: 'codbex-products.Products.Product.entityUpdated', handler: () => {
			refreshData();
			$scope.loadPage($scope.dataPage, $scope.filter);
		}});
		Dialogs.addMessageListener({ topic: 'codbex-products.Products.Product.entitySearch', handler: (data) => {
			resetPagination();
			$scope.filter = data.filter;
			$scope.filterEntity = data.entity;
			$scope.loadPage($scope.dataPage, $scope.filter);
		}});
		//-----------------Events-------------------//

		$scope.loadPage = (pageNumber, filter) => {
			if (!filter && $scope.filter) {
				filter = $scope.filter;
			}
			if (!filter) {
				filter = {};
			}
			$scope.selectedEntity = null;
			EntityService.count(filter).then((resp) => {
				if (resp.data) {
					$scope.dataCount = resp.data.count;
				}
				$scope.dataPages = Math.ceil($scope.dataCount / $scope.dataLimit);
				filter.$offset = ($scope.dataPage - 1) * $scope.dataLimit;
				filter.$limit = $scope.dataLimit;
				if ($scope.dataReset) {
					filter.$offset = 0;
					filter.$limit = $scope.dataPage * $scope.dataLimit;
				}

				EntityService.search(filter).then((response) => {
					if ($scope.data == null || $scope.dataReset) {
						$scope.data = [];
						$scope.dataReset = false;
					}
					$scope.data = $scope.data.concat(response.data);
					$scope.dataPage++;
				}, (error) => {
					const message = error.data ? error.data.message : '';
					Dialogs.showAlert({
						title: LocaleService.t('codbex-products:t.PRODUCT'),
						message: LocaleService.t('codbex-products:messages.error.unableToLF', { name: '$t(codbex-products:t.PRODUCT)', message: message }),
						type: AlertTypes.Error
					});
					console.error('EntityService:', error);
				});
			}, (error) => {
				const message = error.data ? error.data.message : '';
				Dialogs.showAlert({
					title: LocaleService.t('codbex-products:t.PRODUCT'),
					message: LocaleService.t('codbex-products:messages.error.unableToCount', { name: '$t(codbex-products:t.PRODUCT)', message: message }),
					type: AlertTypes.Error
				});
				console.error('EntityService:', error);
			});
		};
		$scope.loadPage($scope.dataPage, $scope.filter);

		$scope.selectEntity = (entity) => {
			$scope.selectedEntity = entity;
			Dialogs.postMessage({ topic: 'codbex-products.Products.Product.entitySelected', data: {
				entity: entity,
				selectedMainEntityId: entity.Id,
				optionsBaseUnit: $scope.optionsBaseUnit,
				optionsType: $scope.optionsType,
				optionsCategory: $scope.optionsCategory,
				optionsManufacturer: $scope.optionsManufacturer,
			}});
		};

		$scope.createEntity = () => {
			$scope.selectedEntity = null;
			$scope.action = 'create';

			Dialogs.postMessage({ topic: 'codbex-products.Products.Product.createEntity', data: {
				entity: {},
				optionsBaseUnit: $scope.optionsBaseUnit,
				optionsType: $scope.optionsType,
				optionsCategory: $scope.optionsCategory,
				optionsManufacturer: $scope.optionsManufacturer,
			}});
		};

		$scope.updateEntity = () => {
			$scope.action = 'update';
			Dialogs.postMessage({ topic: 'codbex-products.Products.Product.updateEntity', data: {
				entity: $scope.selectedEntity,
				optionsBaseUnit: $scope.optionsBaseUnit,
				optionsType: $scope.optionsType,
				optionsCategory: $scope.optionsCategory,
				optionsManufacturer: $scope.optionsManufacturer,
			}});
		};

		$scope.deleteEntity = () => {
			let id = $scope.selectedEntity.Id;
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
						refreshData();
						$scope.loadPage($scope.dataPage, $scope.filter);
						Dialogs.triggerEvent('codbex-products.Products.Product.clearDetails');
					}, (error) => {
						const message = error.data ? error.data.message : '';
						Dialogs.showAlert({
							title: LocaleService.t('codbex-products:t.PRODUCT'),
							message: LocaleService.t('codbex-products:messages.error.unableToDelete', { name: '$t(codbex-products:t.PRODUCT)', message: message }),
							type: AlertTypes.Error
						});
						console.error('EntityService:', error);
					});
				}
			});
		};

		$scope.openFilter = () => {
			Dialogs.showWindow({
				id: 'Product-filter',
				params: {
					entity: $scope.filterEntity,
					optionsBaseUnit: $scope.optionsBaseUnit,
					optionsType: $scope.optionsType,
					optionsCategory: $scope.optionsCategory,
					optionsManufacturer: $scope.optionsManufacturer,
				},
			});
		};

		//----------------Dropdowns-----------------//
		$scope.optionsBaseUnit = [];
		$scope.optionsType = [];
		$scope.optionsCategory = [];
		$scope.optionsManufacturer = [];


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

		$scope.optionsBaseUnitValue = (optionKey) => {
			for (let i = 0; i < $scope.optionsBaseUnit.length; i++) {
				if ($scope.optionsBaseUnit[i].value === optionKey) {
					return $scope.optionsBaseUnit[i].text;
				}
			}
			return null;
		};
		$scope.optionsTypeValue = (optionKey) => {
			for (let i = 0; i < $scope.optionsType.length; i++) {
				if ($scope.optionsType[i].value === optionKey) {
					return $scope.optionsType[i].text;
				}
			}
			return null;
		};
		$scope.optionsCategoryValue = (optionKey) => {
			for (let i = 0; i < $scope.optionsCategory.length; i++) {
				if ($scope.optionsCategory[i].value === optionKey) {
					return $scope.optionsCategory[i].text;
				}
			}
			return null;
		};
		$scope.optionsManufacturerValue = (optionKey) => {
			for (let i = 0; i < $scope.optionsManufacturer.length; i++) {
				if ($scope.optionsManufacturer[i].value === optionKey) {
					return $scope.optionsManufacturer[i].text;
				}
			}
			return null;
		};
		//----------------Dropdowns-----------------//
	});
