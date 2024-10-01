const widgetData = {
    id: 'product-details',
    label: 'Product details',
    link: '/services/web/codbex-products/widgets/subviews/product-details.html',
    lazyLoad: true,
    order: 14,
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