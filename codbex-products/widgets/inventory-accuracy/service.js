const widgetData = {
    id: 'inventory-accuracy-widget',
    label: 'Inventory Accuracy',
    link: '/services/web/codbex-products/widgets/inventory-accuracy/index.html',
    redirectViewId: 'categories-navigation',
    size: "small"
};

export function getWidget() {
    return widgetData;
}

if (typeof exports !== 'undefined') {
    exports.getWidget = function () {
        return widgetData;
    }
}