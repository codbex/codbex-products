const widgetData = {
    id: 'inventory-accuracy',
    label: 'Inventory Accuracy',
    link: '/services/web/codbex-products/widgets/subviews/inventory-accuracy.html',
    lazyLoad: true,
    order: 13,
    size: "medium"
};

export function getWidget() {
    return widgetData;
}

if (typeof exports !== 'undefined') {
    exports.getWidget = function () {
        return widgetData;
    }
}