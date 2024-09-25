const navigationData = {
    id: 'categories-navigation',
    label: "Categories",
    view: "categories",
    group: "products",
    orderNumber: 1000,
    lazyLoad: true,
    link: "/services/web/codbex-products/gen/codbex-products/ui/Categories/index.html?embedded"
};

function getNavigation() {
    return navigationData;
}

if (typeof exports !== 'undefined') {
    exports.getNavigation = getNavigation;
}

export { getNavigation }
