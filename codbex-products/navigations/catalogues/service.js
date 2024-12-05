const navigationData = {
    id: 'catalogues-navigation',
    label: "Catalogues",
    group: "products",
    order: 3800,
    link: "/services/web/codbex-products/gen/codbex-products/ui/Catalogues/index.html?embedded"
};

function getNavigation() {
    return navigationData;
}

if (typeof exports !== 'undefined') {
    exports.getNavigation = getNavigation;
}

export { getNavigation }
