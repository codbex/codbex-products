const navigationData = {
    id: 'products-navigation',
    label: "Products",
    group: "products",
    orderNumber: 100,
    link: "/services/web/codbex-products/gen/codbex-products/ui/Products/index.html?embedded"
};

function getNavigation() {
    return navigationData;
}

if (typeof exports !== 'undefined') {
    exports.getNavigation = getNavigation;
}

export { getNavigation }
