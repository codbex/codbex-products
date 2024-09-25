const navigationData = {
    id: 'catalogues-navigation',
    label: "Catalogues",
    view: "catalogues",
    group: "products",
    orderNumber: 1000,
    lazyLoad: true,
    link: "/services/web/codbex-products/gen/codbex-products/ui/Catalogues/index.html?embedded"
};

function getNavigation() {
    return navigationData;
}

if (typeof exports !== 'undefined') {
    exports.getNavigation = getNavigation;
}

export { getNavigation }
