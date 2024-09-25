const navigationData = {
    id: 'products-navigation',
    label: "Products",
    view: "products",
    group: "products",
    orderNumber: 1000,
    lazyLoad: true,
    link: "/services/web/codbex-products/gen/codbex-products/ui/Products/index.html?embedded"
};

function getNavigation() {
    return navigationData;
}

if (typeof exports !== 'undefined') {
    exports.getNavigation = getNavigation;
}

export { getNavigation }
