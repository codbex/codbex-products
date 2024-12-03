const widgetData = {
    id: 'top-products-widget',
    label: 'Top products',
    link: '/services/web/codbex-products/widgets/subviews/top-products.html',
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