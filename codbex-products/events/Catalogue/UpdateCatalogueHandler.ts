import { ProductRepository } from "../../gen/codbex-products/dao/Products/ProductRepository";
import { ProductSetRepository } from "../../gen/codbex-products/dao/Products/ProductSetRepository";
import { CatalogueSetRepository } from "../../gen/codbex-products/dao/Catalogues/CatalogueSetRepository";
import { CatalogueRepository } from "../../gen/codbex-products/dao/Catalogues/CatalogueRepository"


export const trigger = (event) => {

    const ProductDao = new ProductRepository();
    const ProductSetDao = new ProductSetRepository();
    const CatalogueSetDao = new CatalogueSetRepository();
    const CatalogueDao = new CatalogueRepository();

    const catalogueItem = event.entity;
    const operation = event.operation;

    if (operation === "create") {
        const product = ProductDao.findById(catalogueItem.Product);
        catalogueItem.BaseUnit = product.BaseUnit;
        CatalogueDao.update(catalogueItem);

        let productSets = ProductSetDao.findAll({
            $filter: {
                equals: {
                    Product: catalogueItem.Product
                }
            }
        }).sort((a, b) => b.Ratio - a.Ratio);

        let remainingQuantity = catalogueItem.Quantity;

        productSets.forEach(function (item) {
            const quantityForSet = Math.floor(remainingQuantity / item.Ratio);
            remainingQuantity -= quantityForSet * item.Ratio;

            CatalogueSetDao.create({
                Catalogue: catalogueItem.Id,
                ProductSet: item.Id,
                Quantity: quantityForSet
            });
        });
    }

    if (operation === "update") {
        const product = ProductDao.findById(catalogueItem.Product);
        catalogueItem.BaseUnit = product.BaseUnit;
        CatalogueDao.update(catalogueItem);

        let productSets = ProductSetDao.findAll({
            $filter: {
                equals: {
                    Product: catalogueItem.Product
                }
            }
        }).sort((a, b) => b.Ratio - a.Ratio);

        let remainingQuantity = catalogueItem.Quantity;

        productSets.forEach(function (item) {
            const quantityForSet = Math.floor(remainingQuantity / item.Ratio);
            remainingQuantity -= quantityForSet * item.Ratio;

            const existingSet = CatalogueSetDao.findAll({
                $filter: {
                    equals: {
                        Catalogue: catalogueItem.Id,
                        ProductSet: item.Id
                    }
                }
            });

            if (existingSet) {
                existingSet[0].Quantity = quantityForSet;
                CatalogueSetDao.update(existingSet[0]);
            } else {
                CatalogueSetDao.create({
                    Catalogue: catalogueItem.Id,
                    ProductSet: item.Id,
                    Quantity: quantityForSet
                });
            }
        });
    }
}

