angular.module('angular-bs-confirm', [])
.directive('confirm', function() {
	return {
		scope: {
			confirm: '&?', // Run this on confirm
			cancel: '&?', // Run this on cancel
			confirmText: '@?',
			confirmPosition: '@?',
			confirmContainer: '@?',
			confirmTrigger: '@?'
		},
		restrict: 'A',
		controller: function($scope) {
			$scope.doConfirm = function() {
				if ($scope.confirm)
					$scope.$eval($scope.confirm);
			};

			$scope.doCancel = function() {
				if ($scope.cancel)
					$scope.$eval($scope.cancel);
			};
		},
		link: function($scope, elem) {
			$scope.$watch('confirmText + confirmPosition + confirmContainer + containTrigger', function() {
				var isVisible = $(elem).siblings('.tooltip').length > 0; // Is the tooltip already shown?
				$(elem)
					.tooltip('destroy')
					.tooltip({
						title: 
							'<div class="tooltip-confirm">' +
								'<div class="tooltip-confirm-text">' + ($scope.confirmText || 'Are you sure?') + '</div>' +
								'<div class="tooltip-confirm-btn-group">' +
									'<a class="btn btn-xs btn-success tooltip-confirm-btn-confirm">Yes</a>' +
									'<a class="btn btn-xs btn-danger tooltip-confirm-btn-cancel">No</a>' +
								'</div>' +
							'</div>',
						html: true,
						placement: $scope.confirmPosition || 'top',
						container: $scope.confirmContainer || null,
						trigger: $scope.confirmTrigger || 'click',
						animation: false
					})
					.on('show.bs.tooltip', function(e) {
						if (!$(this).data('ng.tooltip-confirm')) { // Not yet attached events
							$(this).data('bs.tooltip').$tip // Shown - bind to click of buttons
								.on('click', '.tooltip-confirm-btn-confirm', function() {
									$(elem).tooltip('hide');
									$scope.$apply($scope.doConfirm);
								})
								.on('click', '.tooltip-confirm-btn-cancel', function() {
									$(elem).tooltip('hide');
								});
							$(this).data('ng.tooltip-confirm', true);
						}
					});

				if (isVisible) // Reshow the tooltip if we WERE using it before
					$(elem).tooltip('show');
			});
		}
	}
});
