angular.module('page', ["ideUI", "ideView", "entityApi"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-products.products.ProductDetails';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/js/codbex-products/gen/api/products/ProductDetails.js";
	}])
	.controller('PageController', ['$scope', '$http', '$http', 'messageHub', 'entityApi', function ($scope, $http, $http, messageHub, entityApi) {

		function resetPagination() {
			$scope.dataPage = 1;
			$scope.dataCount = 0;
			$scope.dataLimit = 10;
		}
		resetPagination();

		//-----------------Events-------------------//
		messageHub.onDidReceiveMessage("codbex-products.products.${masterEntity}.entitySelected", function (msg) {
			resetPagination();
			$scope.selectedMainEntityId = msg.data.selectedMainEntityId;
			$scope.loadPage($scope.dataPage);
		}, true);

		messageHub.onDidReceiveMessage("codbex-products.products.${masterEntity}.clearDetails", function (msg) {
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
			$scope.loadPage($scope.dataPage);
		});

		messageHub.onDidReceiveMessage("entityUpdated", function (msg) {
			$scope.loadPage($scope.dataPage);
		});
		//-----------------Events-------------------//

		$scope.loadPage = function (pageNumber) {
			let ${masterEntityId} = $scope.selectedMainEntityId;
			$scope.dataPage = pageNumber;
			entityApi.count(${masterEntityId}).then(function (response) {
				if (response.status != 200) {
					messageHub.showAlertError("ProductDetails", `Unable to count ProductDetails: '${response.message}'`);
					return;
				}
				$scope.dataCount = response.data;
				let query = `${masterEntityId}=${${masterEntityId}}`;
				let offset = (pageNumber - 1) * $scope.dataLimit;
				let limit = $scope.dataLimit;
				entityApi.filter(query, offset, limit).then(function (response) {
					if (response.status != 200) {
						messageHub.showAlertError("ProductDetails", `Unable to list ProductDetails: '${response.message}'`);
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
			messageHub.showDialogWindow("ProductDetails-details", {
				action: "select",
				entity: entity,
				optionsProductId: $scope.optionsProductId,
			});
		};

		$scope.createEntity = function () {
			$scope.selectedEntity = null;
			messageHub.showDialogWindow("ProductDetails-details", {
				action: "create",
				entity: {},
				selectedMainEntityKey: "${masterEntityId}",
				selectedMainEntityId: $scope.selectedMainEntityId,
				optionsProductId: $scope.optionsProductId,
			}, null, false);
		};

		$scope.updateEntity = function (entity) {
			messageHub.showDialogWindow("ProductDetails-details", {
				action: "update",
				entity: entity,
				selectedMainEntityKey: "${masterEntityId}",
				selectedMainEntityId: $scope.selectedMainEntityId,
				optionsProductId: $scope.optionsProductId,
			}, null, false);
		};

		$scope.deleteEntity = function (entity) {
			let id = entity.Id;
			messageHub.showDialogAsync(
				'Delete ProductDetails?',
				`Are you sure you want to delete ProductDetails? This action cannot be undone.`,
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
							messageHub.showAlertError("ProductDetails", `Unable to delete ProductDetails: '${response.message}'`);
							return;
						}
						$scope.loadPage($scope.dataPage);
						messageHub.postMessage("clearDetails");
					});
				}
			});
		};

		//----------------Dropdowns-----------------//
		$scope.optionsProductId = [];

		$http.get("/services/js/codbex-products/gen/api/products/Product.js").then(function (response) {
			$scope.optionsProductId = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Name
				}
			});
		});
		$scope.optionsProductIdValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsProductId.length; i++) {
				if ($scope.optionsProductId[i].value === optionKey) {
					return $scope.optionsProductId[i].text;
				}
			}
			return null;
		};
		//----------------Dropdowns-----------------//

	}]);
