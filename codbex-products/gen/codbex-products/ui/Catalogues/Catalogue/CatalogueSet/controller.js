angular.module('page', ["ideUI", "ideView", "entityApi"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-products.Catalogues.CatalogueSet';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/ts/codbex-products/gen/codbex-products/api/Catalogues/CatalogueSetService.ts";
	}])
	.controller('PageController', ['$scope', '$http', 'messageHub', 'entityApi', 'Extensions', function ($scope, $http, messageHub, entityApi, Extensions) {
		//-----------------Custom Actions-------------------//
		Extensions.get('dialogWindow', 'codbex-products-custom-action').then(function (response) {
			$scope.pageActions = response.filter(e => e.perspective === "Catalogues" && e.view === "CatalogueSet" && (e.type === "page" || e.type === undefined));
			$scope.entityActions = response.filter(e => e.perspective === "Catalogues" && e.view === "CatalogueSet" && e.type === "entity");
		});

		$scope.triggerPageAction = function (action) {
			messageHub.showDialogWindow(
				action.id,
				{},
				null,
				true,
				action
			);
		};

		$scope.triggerEntityAction = function (action) {
			messageHub.showDialogWindow(
				action.id,
				{
					id: $scope.entity.Id
				},
				null,
				true,
				action
			);
		};
		//-----------------Custom Actions-------------------//

		function resetPagination() {
			$scope.dataPage = 1;
			$scope.dataCount = 0;
			$scope.dataLimit = 10;
		}
		resetPagination();

		//-----------------Events-------------------//
		messageHub.onDidReceiveMessage("codbex-products.Catalogues.Catalogue.entitySelected", function (msg) {
			resetPagination();
			$scope.selectedMainEntityId = msg.data.selectedMainEntityId;
			$scope.loadPage($scope.dataPage);
		}, true);

		messageHub.onDidReceiveMessage("codbex-products.Catalogues.Catalogue.clearDetails", function (msg) {
			$scope.$apply(function () {
				resetPagination();
				$scope.selectedMainEntityId = null;
				$scope.data = null;
			});
		}, true);

		messageHub.onDidReceiveMessage("clearDetails", function (msg) {
			$scope.$apply(function () {
				$scope.entity = {};
				$scope.action = 'select';
			});
		});

		messageHub.onDidReceiveMessage("entityCreated", function (msg) {
			$scope.loadPage($scope.dataPage, $scope.filter);
		});

		messageHub.onDidReceiveMessage("entityUpdated", function (msg) {
			$scope.loadPage($scope.dataPage, $scope.filter);
		});

		messageHub.onDidReceiveMessage("entitySearch", function (msg) {
			resetPagination();
			$scope.filter = msg.data.filter;
			$scope.filterEntity = msg.data.entity;
			$scope.loadPage($scope.dataPage, $scope.filter);
		});
		//-----------------Events-------------------//

		$scope.loadPage = function (pageNumber, filter) {
			let Catalogue = $scope.selectedMainEntityId;
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
			filter.$filter.equals.Catalogue = Catalogue;
			entityApi.count(filter).then(function (response) {
				if (response.status != 200) {
					messageHub.showAlertError("CatalogueSet", `Unable to count CatalogueSet: '${response.message}'`);
					return;
				}
				if (response.data) {
					$scope.dataCount = response.data;
				}
				filter.$offset = (pageNumber - 1) * $scope.dataLimit;
				filter.$limit = $scope.dataLimit;
				entityApi.search(filter).then(function (response) {
					if (response.status != 200) {
						messageHub.showAlertError("CatalogueSet", `Unable to list/filter CatalogueSet: '${response.message}'`);
						return;
					}
					$scope.data = response.data;
				});
			});
		};

		$scope.selectEntity = function (entity) {
			$scope.selectedEntity = entity;
		};

		$scope.openDetails = function (entity) {
			$scope.selectedEntity = entity;
			messageHub.showDialogWindow("CatalogueSet-details", {
				action: "select",
				entity: entity,
				optionsProductSet: $scope.optionsProductSet,
			});
		};

		$scope.openFilter = function (entity) {
			messageHub.showDialogWindow("CatalogueSet-filter", {
				entity: $scope.filterEntity,
				optionsProductSet: $scope.optionsProductSet,
			});
		};

		$scope.createEntity = function () {
			$scope.selectedEntity = null;
			messageHub.showDialogWindow("CatalogueSet-details", {
				action: "create",
				entity: {},
				selectedMainEntityKey: "Catalogue",
				selectedMainEntityId: $scope.selectedMainEntityId,
				optionsProductSet: $scope.optionsProductSet,
			}, null, false);
		};

		$scope.updateEntity = function (entity) {
			messageHub.showDialogWindow("CatalogueSet-details", {
				action: "update",
				entity: entity,
				selectedMainEntityKey: "Catalogue",
				selectedMainEntityId: $scope.selectedMainEntityId,
				optionsProductSet: $scope.optionsProductSet,
			}, null, false);
		};

		$scope.deleteEntity = function (entity) {
			let id = entity.Id;
			messageHub.showDialogAsync(
				'Delete CatalogueSet?',
				`Are you sure you want to delete CatalogueSet? This action cannot be undone.`,
				[{
					id: "delete-btn-yes",
					type: "emphasized",
					label: "Yes",
				},
				{
					id: "delete-btn-no",
					type: "normal",
					label: "No",
				}],
			).then(function (msg) {
				if (msg.data === "delete-btn-yes") {
					entityApi.delete(id).then(function (response) {
						if (response.status != 204) {
							messageHub.showAlertError("CatalogueSet", `Unable to delete CatalogueSet: '${response.message}'`);
							return;
						}
						$scope.loadPage($scope.dataPage, $scope.filter);
						messageHub.postMessage("clearDetails");
					});
				}
			});
		};

		//----------------Dropdowns-----------------//
		$scope.optionsProductSet = [];


		$http.get("/services/ts/codbex-products/gen/codbex-products/api/Products/ProductSetService.ts").then(function (response) {
			$scope.optionsProductSet = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Name
				}
			});
		});

		$scope.optionsProductSetValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsProductSet.length; i++) {
				if ($scope.optionsProductSet[i].value === optionKey) {
					return $scope.optionsProductSet[i].text;
				}
			}
			return null;
		};
		//----------------Dropdowns-----------------//

	}]);
