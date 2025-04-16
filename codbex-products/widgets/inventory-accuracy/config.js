const viewData = {
    id: 'inventory-accuracy-widget',
    label: 'Inventory Accuracy',
    path: '/services/web/codbex-products/widgets/inventory-accuracy/index.html',
    lazyLoad: true,
    autoFocusTab: false,
    perspectiveId: 'Categories',
    size: 'small'
};
if (typeof exports !== 'undefined') {
    exports.getView = () => viewData;
}