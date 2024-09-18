const widgetData = {
    id: 'top-products',
    label: 'Top products',
    link: '/services/web/codbex-products/widgets/subviews/top-products.html',
    lazyLoad: true,
    order: 15,
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