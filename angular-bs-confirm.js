angular.module('angular-bs-confirm', [])
.directive('confirm', function() {
	return {
		scope: {
			confirm: '&?', // Run this on confirm
			cancel: '&?', // Run this on cancel
			confirmText: '@?',
			confirmPosition: '@?',
			confirmContainer: '@?'
		},
		restrict: 'A',
		controller: function($scope, $element) {
			$scope.isShown = false;

			$scope.doConfirm = function() {
				$scope.isShown = false;
				if ($scope.confirm)
					$scope.$eval($scope.confirm);
			};

			$scope.doCancel = function() {
				$scope.isShown = false;
				if ($scope.cancel)
					$scope.$eval($scope.cancel);
			};

			// Watcher + refresher {{{
			$scope.refresh = function() {
				if (!$scope.isShown) return;

				$element
					.tooltip('destroy')
					.tooltip({
						title: 
							'<div class="tooltip-confirm">' +
								'<div class="tooltip-confirm-text">' + ($scope.confirmText || 'Are you sure?') + '</div>' +
								'<div class="tooltip-confirm-btn-group">' +
									'<a class="btn btn-xs btn-success tooltip-confirm-btn-confirm" style="margin-right: 4px;">Yes</a>' +
									'<a class="btn btn-xs btn-danger tooltip-confirm-btn-cancel">No</a>' +
								'</div>' +
							'</div>',
						html: true,
						placement: $scope.confirmPosition || 'top',
						container: $scope.confirmContainer || null,
						trigger: 'manual',
						animation: false
					})
					.on('shown.bs.tooltip', function(e) {
						$(this).data('bs.tooltip').$tip // Shown - bind to click of buttons
							.off('click', '.tooltip-confirm-btn-confirm')
							.on('click', '.tooltip-confirm-btn-confirm', function() {
								$element.tooltip('hide');
								$scope.$apply($scope.doConfirm);
							})
							.off('click', '.tooltip-confirm-btn-cancel')
							.on('click', '.tooltip-confirm-btn-cancel', function() {
								$element.tooltip('hide');
								$scope.$apply($scope.doCancel);
							});
					})
					.tooltip('show');
			};

			$scope.$watchGroup(['confirm', 'cancel', 'confirmText', 'confirmPosition', 'confirmContainer'], $scope.refresh);
			// }}}
		},
		link: function($scope, $element) {
			$element.bind('click', function() {
				$scope.isShown = true;
				$scope.refresh();
			});
		}
	}
});
