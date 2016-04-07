angular.module('angular-bs-confirm', [])
.directive('confirm', function() {
	return {
		scope: {
			confirm: '&?', // Run this on confirm
			cancel: '&?', // Run this on cancel
			confirmText: '@?',
			confirmPosition: '@?',
			confirmContainer: '@?',
			confirmDestroyDistance: '=?',
			confirmDestroyHidden: '=?'
		},
		restrict: 'A',
		controller: function($scope, $element) {
			if (angular.isUndefined($scope.confirmDestroyDistance)) $scope.confirmDestroyDistance = 250;
			if (angular.isUndefined($scope.confirmDestroyHidden)) $scope.confirmDestroyHidden = true;

			// Wheteher we are monitoring the mouse
			$scope.mouseIsWatching = false;

			// Callback used to update the mouse position
			$scope.mouseWatcherCallback = function(e) {
				var dist = {
					x: Math.abs(e.clientX - $scope.parentElem.offset().left),
					y: Math.abs(e.clientY - $scope.parentElem.offset().top)
				};
				dist.total = Math.sqrt((dist.x * dist.x) + (dist.y * dist.y));

				if (
					($scope.confirmDestroyHidden && $scope.parentElem.is(':hidden')) ||
					($scope.confirmDestroyDistance && $scope.parentElem.is(':visible') && dist.total > $scope.confirmDestroyDistance)
				) $scope.setShown(false);
			};

			$scope.isShown = false;
			$scope.setShown = function(show) {
				if ($scope.isShown && !show) { // Force hide
					$element.tooltip('destroy')
				}

				$scope.isShown = show;

				// Attach / detact the mouse watcher
				if (show && ($scope.confirmDestroyDistance || $scope.confirmDestroyHidden) && !$scope.mouseIsWatching) {
					$scope.mouseWatcher = $(document).on('mousemove', $scope.mouseWatcherCallback);
					$scope.mouseIsWatching = true;
				} else if (!show && $scope.mouseIsWatching) { // Detact event watcher
					$(document).off('mousemove', $scope.mouseWatcherCallback);
					$scope.mouseIsWatching = false;
				}
			};

			$scope.parentElem;
			$scope.setParent = function(parentElem) {
				$scope.parentElem = parentElem;
			};

			$scope.doConfirm = function() {
				$scope.setShown(false);
				if ($scope.confirm) $scope.$eval($scope.confirm);
			};

			$scope.doCancel = function() {
				$scope.setShown(false);
				if ($scope.cancel) $scope.$eval($scope.cancel);
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
			$element.bind('click', function(e) {
				$scope.setParent($(e.target));
				$scope.setShown(true);
				$scope.refresh();
			});
		}
	}
});
