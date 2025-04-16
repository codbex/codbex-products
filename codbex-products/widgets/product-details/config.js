const viewData = {
    id: 'product-details-widget',
    label: 'Product details',
    path: '/services/web/codbex-products/widgets/product-details/index.html',
    lazyLoad: true,
    autoFocusTab: false,
    perspectiveId: 'Products',
    size: 'large'
};
if (typeof exports !== 'undefined') {
    exports.getView = () => viewData;
}