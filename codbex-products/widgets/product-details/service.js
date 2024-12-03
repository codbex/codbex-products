const widgetData = {
    id: 'product-details-widget',
    label: 'Product details',
    link: '/services/web/codbex-products/widgets/subviews/product-details.html',
    redirectViewId: 'products-navigation',
    size: "large"
};

export function getWidget() {
    return widgetData;
}

if (typeof exports !== 'undefined') {
    exports.getWidget = function () {
        return widgetData;
    }
}