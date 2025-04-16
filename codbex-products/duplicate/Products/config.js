const viewData = {
    id: 'product-duplicate',
    label: 'Duplicate',
    path: '/services/web/codbex-products/duplicate/Products/products-duplicate.html',
    maxWidth: '320px',
    maxHeight: '166px',
    perspective: 'Products',
    view: 'Product',
    type: 'entity',
    order: 20
};
if (typeof exports !== 'undefined') {
    exports.getView = () => viewData;
}