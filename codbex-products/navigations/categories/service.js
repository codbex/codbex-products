const navigationData = {
    id: 'categories-navigation',
    label: "Product Categories",
    group: "reference data",
    order: 1500,
    link: "/services/web/codbex-products/gen/codbex-products/ui/Categories/index.html?embedded"
};

function getNavigation() {
    return navigationData;
}

if (typeof exports !== 'undefined') {
    exports.getNavigation = getNavigation;
}

export { getNavigation }
