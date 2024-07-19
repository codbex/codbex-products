const viewData = {
    id: 'product-duplicate',
    label: 'Duplicate',
    link: '/services/web/codbex-products/duplicate/products-duplicate.html',
    perspective: 'Products',
    view: 'Product',
    type: 'entity',
    order: 20
};

if (typeof exports !== 'undefined') {
    exports.getDialogWindow = function () {
        return viewData;
    }
}